import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db, isOfflineMode } from "../../firebase";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, X, Sparkles, CheckCircle2 } from "lucide-react";

const CREATE_API = import.meta.env.VITE_CREATE_API;
const VERIFY_API = import.meta.env.VITE_VERIFY_API;
const RAZORPAY_ORDER_API = import.meta.env.VITE_RAZORPAY_ORDER_API; 
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

export default function Student() {
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMenu, setFetchingMenu] = useState(true);

  // Real-time listener for AVAILABLE menu items
  useEffect(() => {
    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
      setTimeout(() => {
        setMenu([
          { id: "1", name: "Artisan Pizza", price: 250, emoji: "🍕", available: true },
          { id: "2", name: "Specialty Coffee", price: 120, emoji: "☕", available: true },
          { id: "3", name: "Morning Croissant", price: 90, emoji: "🥐", available: true },
          { id: "4", name: "Fresh Salad", price: 180, emoji: "🥗", available: true }
        ]);
        setFetchingMenu(false);
      }, 800);
      return;
    }

    const q = query(collection(db, "menu"), where("available", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setMenu(items);
      setFetchingMenu(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (item) => setCart([...cart, item]);
  
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Order Fulfillment Listener
  useEffect(() => {
    if (!activeOrderId || isOfflineMode) return;
    const unsubscribe = onSnapshot(doc(db, "orders", activeOrderId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().orderStatus === "completed" && qrToken) {
        setQrToken("");
        setActiveOrderId(null);
        alert("Your order has been scanned and fulfilled by the admin! Enjoy your meal 🍔");
      }
    });
    return () => unsubscribe();
  }, [activeOrderId, qrToken]);

  const handleOrder = async () => {
    if (cart.length === 0) return;

    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
      setLoading(true);
      setTimeout(() => {
        setQrToken(`demo-qr-${Date.now()}`);
        setActiveOrderId(`demo-order-${Date.now()}`);
        setCart([]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      setLoading(true);

      const orderRes = await fetch(CREATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid, items: cart, totalAmount: total })
      });
      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      const razorRes = await fetch(RAZORPAY_ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });
      const razorOrder = await razorRes.json();

      if (!razorOrder.id) {
          alert("Could not initialize payment gateway.");
          setLoading(false);
          return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Tap2Eat",
        description: "Premium Campus Dining",
        order_id: razorOrder.id,
        handler: async function (response) {
          setLoading(true); 
          try {
              const verifyRes = await fetch(VERIFY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, ...response })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.qrToken) {
                setQrToken(verifyData.qrToken);
                setActiveOrderId(orderId);
                setCart([]); 
              } else {
                alert("Payment verification failed");
              }
          } catch(e) {
              console.error(e);
              alert("Payment verification failed");
          } finally {
              setLoading(false);
          }
        },
        modal: { ondismiss: function() { setLoading(false); } },
        prefill: { email: auth.currentUser.email },
        theme: { color: "#ff6b6b" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (qrToken) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="glass-panel" 
          style={{ textAlign: "center", maxWidth: "400px", width: "100%" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{ marginBottom: "20px" }}
          >
            <CheckCircle2 size={64} color="var(--theme-accent)" style={{ margin: "0 auto", filter: "drop-shadow(0 0 10px rgba(255,107,107,0.5))" }} />
          </motion.div>
          <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>Order Ready</h2>
          <p style={{ opacity: 0.7, marginBottom: "30px" }}>Present this code at the pickup counter.</p>
          
          <div style={{ background: "white", padding: "20px", borderRadius: "20px", display: "inline-block", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
            <QRCodeCanvas value={qrToken} size={220} />
          </div>

          <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setQrToken("")}>
            Done / Start New Order
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
      
      {/* 🟢 MENU GRID AREA */}
      <div style={{ flex: "1 1 600px", display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
            Today's Menu <Sparkles color="var(--theme-accent)" />
          </h2>
          <p style={{ opacity: 0.6, fontSize: "1.1rem" }}>Curated selections freshly prepared.</p>
        </div>

        {fetchingMenu ? (
          <div style={{ padding: "100px 0", textAlign: "center" }}>
            <div className="loader"></div>
          </div>
        ) : menu.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ opacity: 0.6, fontSize: "1.2rem" }}>The menu is currently being updated. Please check back shortly.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {menu.map((item) => (
              <motion.div 
                key={item.id}
                className="glass-panel"
                whileHover={{ y: -5, boxShadow: "var(--theme-glow)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ padding: "24px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{item.emoji || "🍲"}</div>
                <h3 style={{ fontSize: "1.3rem", margin: "0 0 8px 0" }}>{item.name}</h3>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--theme-accent)", marginBottom: "20px" }}>
                  ₹{item.price}
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  className="btn-secondary" 
                  style={{ marginTop: "auto", padding: "10px", width: "100%", fontSize: "0.95rem" }}
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 🟡 PREMIUM CART SIDEBAR */}
      <div style={{ flex: "1 1 350px", position: "sticky", top: "100px" }}>
        <div className="glass-panel" style={{ padding: "30px", borderTop: "4px solid var(--theme-accent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
            <ShoppingBag size={28} color="var(--theme-accent)" />
            <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Your Order</h2>
          </div>

          <div style={{ minHeight: "150px" }}>
            <AnimatePresence>
              {cart.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: "40px 0", textAlign: "center", opacity: 0.5 }}
                >
                  <p>Your tray is empty.</p>
                </motion.div>
              )}
              {cart.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--theme-border)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{item.emoji}</span>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ opacity: 0.8 }}>₹{item.price}</span>
                    <button 
                      onClick={() => removeFromCart(index)} 
                      style={{ background: "none", border: "none", color: "var(--theme-text)", opacity: 0.5, cursor: "pointer", display: "flex" }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {cart.length > 0 && (
            <motion.div layout style={{ marginTop: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.4rem", fontWeight: 800, marginBottom: "20px" }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              
              <button 
                className="btn-primary" 
                onClick={handleOrder} 
                disabled={loading} 
                style={{ width: "100%", padding: "18px" }}
              >
                {loading ? <div className="loader"></div> : (
                  <>Checkout <ArrowRight size={20} /></>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}