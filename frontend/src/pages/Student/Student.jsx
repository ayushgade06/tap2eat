import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db } from "../../firebase";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where 
} from "firebase/firestore";

const CREATE_API = import.meta.env.VITE_CREATE_API;
const VERIFY_API = import.meta.env.VITE_VERIFY_API;

const RAZORPAY_ORDER_API = import.meta.env.VITE_RAZORPAY_ORDER_API; 
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

function Student() {
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMenu, setFetchingMenu] = useState(true);

  // 🔥 Real-time listener for AVAILABLE menu items
  useEffect(() => {
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

  // 🟢 Add item
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // 🟢 Remove item
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // 🟢 Calculate total
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // 🔥 Listen for order status update (Fulfillment)
  useEffect(() => {
    if (!activeOrderId) return;
    
    const unsubscribe = onSnapshot(doc(db, "orders", activeOrderId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().orderStatus === "completed" && qrToken) {
        // Order was marked as completed by admin
        setQrToken("");
        setActiveOrderId(null);
        alert("Your order has been scanned and fulfilled by the admin! Enjoy your meal 🍔");
      }
    });

    return () => unsubscribe();
  }, [activeOrderId, qrToken]);

  // 🟢 Order flow
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Select at least one item from the menu!");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Order Firebase API
      const orderRes = await fetch(CREATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          items: cart,
          totalAmount: total
        })
      });

      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      // 2️⃣ Create Razorpay Order API calls
      const razorRes = await fetch(RAZORPAY_ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });

      const razorOrder = await razorRes.json();

      if (!razorOrder.id) {
          alert("Could not initialize payment gateway. Please try again.");
          setLoading(false);
          return;
      }

      // 3️⃣ Open Razorpay Checkout window
      const options = {
        key: RAZORPAY_KEY,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Tap2Eat",
        description: "Food Order",
        order_id: razorOrder.id,

        handler: async function (response) {
          // 4️⃣ Verify Payment (backend)
          setLoading(true); // resume loading state during verification
          try {
              const verifyRes = await fetch(VERIFY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  ...response
                })
              });

              const verifyData = await verifyRes.json();

              if (verifyData.qrToken) {
                setQrToken(verifyData.qrToken);
                setActiveOrderId(orderId);
                setCart([]); // clear cart on success
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
        
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        },

        prefill: {
          email: auth.currentUser.email
        },

        theme: {
          color: "#ff6b6b"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Menu Today</h2>
      </div>

      {/* 🟢 MENU */}
      {fetchingMenu ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="loader" style={{ margin: "auto" }}></div>
          <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Loading delicious menu...</p>
        </div>
      ) : menu.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px" }}>
          <p>The canteen menu is empty right now. Check back soon! 🥣</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menu.map((item) => (
            <div className="menu-card" key={item.id}>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>{item.emoji || "🍲"}</div>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <div className="menu-price">₹{item.price}</div>
              <button className="btn btn-secondary" onClick={() => addToCart(item)} style={{ padding: "8px 20px", fontSize: "0.9rem" }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🟡 CART */}
      {cart.length > 0 && (
        <div className="cart-section">
          <h2>Your Selection ({cart.length})</h2>
          
          <div style={{ margin: "20px 0" }}>
            {cart.map((item, index) => (
              <div className="cart-item" key={index}>
                <span style={{ fontSize: "1.1rem" }}>{item.emoji || "🍲"} {item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span>₹{item.price}</span>
                  <button onClick={() => removeFromCart(index)} style={{ cursor: "pointer", background: "none", border: "none", color: "var(--primary)", fontSize: "1.2rem", padding: "0 5px" }} title="Remove item">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-total">
            Total Amount: ₹{total}
          </div>

          {/* 🔵 ORDER BUTTON */}
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <button className="btn" onClick={handleOrder} disabled={loading} style={{ padding: "14px 40px", fontSize: "1.1rem" }}>
              {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : "Place Order & Pay with Razorpay"}
            </button>
          </div>
        </div>
      )}

      {!cart.length && !qrToken && !fetchingMenu && menu.length > 0 && (
        <div className="empty-state">
          <p>Your cart is empty. Pick something delicious above!</p>
        </div>
      )}

      {/* 🔴 QR CODE DISPLAY */}
      {qrToken && (
        <div style={{ textAlign: "center" }}>
          <div className="qr-container">
            <h3 style={{ color: "var(--primary)", marginBottom: "20px" }}>Order Confirmed! 🎉</h3>
            <p style={{ marginBottom: "20px", color: "var(--text-muted)", maxWidth: "250px" }}>
              Show this QR code at the counter to collect your food
            </p>
            <div style={{ background: "white", padding: "15px", borderRadius: "10px", border: "1px solid #eee", display: "inline-block" }}>
              <QRCodeCanvas value={qrToken} size={200} />
            </div>
            <button className="btn btn-outline" style={{ marginTop: "25px" }} onClick={() => setQrToken("")}>
              Done / New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;