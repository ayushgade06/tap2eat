const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Razorpay configuration using environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ==========================
// 1️⃣ CREATE ORDER (Firestore)
// ==========================
exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId, items, totalAmount } = req.body;

      if (!userId || !items || !totalAmount) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const orderRef = await db.collection("orders").add({
        userId,
        items,
        totalAmount,
        paymentStatus: "pending",
        orderStatus: "created",
        timestamp: Date.now()
      });

      res.json({
        success: true,
        orderId: orderRef.id
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
});


// ==========================
// 2️⃣ CREATE RAZORPAY ORDER
// ==========================
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const amount = req.body.amount;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    razorpay.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Razorpay error" });
      }

      res.json(order);
    });
  });
});


// ==========================
// 3️⃣ VERIFY PAYMENT 🔐
// ==========================
exports.verifyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", razorpay.key_secret) // ✅ FIXED
        .update(body.toString())
        .digest("hex");

      console.log("EXPECTED:", expectedSignature);
      console.log("RECEIVED:", razorpay_signature);

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment"
        });
      }

      const qrToken = Math.random().toString(36).substring(2);

      await db.collection("orders").doc(orderId).update({
        paymentStatus: "success",
        qrToken,
        expiryTime: Date.now() + 30 * 60 * 1000
      });

      return res.json({
        success: true,
        qrToken
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
  });
});


// ==========================
// 4️⃣ VERIFY QR (Admin Scan)
// ==========================
exports.verifyQR = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { qrToken } = req.body;

      const snapshot = await db
        .collection("orders")
        .where("qrToken", "==", qrToken)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          message: "Invalid QR"
        });
      }

      const doc = snapshot.docs[0];
      const order = doc.data();

      // ❌ Checks
      if (order.orderStatus === "completed") {
        return res.json({ success: false, message: "Already used" });
      }

      if (Date.now() > order.expiryTime) {
        return res.json({ success: false, message: "QR expired" });
      }

      // ✅ Mark completed
      await doc.ref.update({
        orderStatus: "completed"
      });

      res.json({
        success: true,
        message: "Order verified"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });
});