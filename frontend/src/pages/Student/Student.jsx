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
import { ShoppingBag, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Plus, Minus, ReceiptText } from "lucide-react";

const CREATE_API = import.meta.env.VITE_CREATE_API;
const VERIFY_API = import.meta.env.VITE_VERIFY_API;
const RAZORPAY_ORDER_API = import.meta.env.VITE_RAZORPAY_ORDER_API;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

export default function Student() {
  const SGST_RATE = 0.025;
  const CGST_RATE = 0.025;
  const PLATFORM_FEE_RATE = 0.01;

  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMenu, setFetchingMenu] = useState(true);
  const [currentView, setCurrentView] = useState("menu");

  useEffect(() => {
    if (isOfflineMode) {
      setTimeout(() => {
        setMenu([
          { id: "1", name: "Artisan Pizza", price: 250, emoji: "🍕", available: true },
          { id: "2", name: "Specialty Coffee", price: 120, emoji: "☕", available: true },
          { id: "3", name: "Morning Croissant", price: 90, emoji: "🥐", available: true },
          { id: "4", name: "Fresh Salad", price: 180, emoji: "🥗", available: true },
          { id: "5", name: "Grilled Sandwich", price: 150, emoji: "🥪", available: true },
          { id: "6", name: "Masala Chai", price: 40, emoji: "🍵", available: true }
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

  const getCartMap = () => {
    const map = {};
    cart.forEach((item) => {
      if (map[item.id]) {
        map[item.id].qty += 1;
      } else {
        map[item.id] = { ...item, qty: 1 };
      }
    });
    return Object.values(map);
  };

  const addToCart = (item) => setCart([...cart, item]);

  const removeOneFromCart = (itemId) => {
    const idx = cart.findIndex((c) => c.id === itemId);
    if (idx !== -1) {
      const newCart = [...cart];
      newCart.splice(idx, 1);
      setCart(newCart);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const sgst = Number((subtotal * SGST_RATE).toFixed(2));
  const cgst = Number((subtotal * CGST_RATE).toFixed(2));
  const platformFee = Number((subtotal * PLATFORM_FEE_RATE).toFixed(2));
  const grandTotal = Number((subtotal + sgst + cgst + platformFee).toFixed(2));
  const cartGrouped = getCartMap();
  const cartQtyMap = cart.reduce((map, item) => {
    map[item.id] = (map[item.id] || 0) + 1;
    return map;
  }, {});

  const formatINR = (value) => `₹${value.toFixed(2)}`;

  useEffect(() => {
    if (!activeOrderId || isOfflineMode) return;
    const unsubscribe = onSnapshot(doc(db, "orders", activeOrderId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().orderStatus === "completed" && qrToken) {
        setQrToken("");
        setActiveOrderId(null);
        alert("Your order has been scanned and fulfilled by the admin! Enjoy your meal.");
      }
    });
    return () => unsubscribe();
  }, [activeOrderId, qrToken]);

  const handleOrder = async () => {
    if (cart.length === 0) return;

    if (isOfflineMode) {
      setLoading(true);
      setTimeout(() => {
        setQrToken(`demo-qr-${Date.now()}`);
        setActiveOrderId(`demo-order-${Date.now()}`);
        setCart([]);
        setCurrentView("menu");
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      setLoading(true);
      const orderRes = await fetch(CREATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid, items: cart, totalAmount: grandTotal })
      });
      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      const razorRes = await fetch(RAZORPAY_ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal })
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
              setCurrentView("menu");
            } else {
              alert("Payment verification failed");
            }
          } catch (e) {
            console.error(e);
            alert("Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: function () { setLoading(false); } },
        prefill: { email: auth.currentUser.email },
        theme: { color: "#FF6A3D" }
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
      <div className="app-content">
        <div className="qr-view">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="card qr-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle2 size={56} color="var(--accent-secondary)" style={{ margin: "0 auto var(--space-4)", display: "block" }} />
            </motion.div>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>Order Confirmed!</h2>
            <p style={{ marginBottom: "var(--space-6)" }}>Present this code at the pickup counter.</p>

            <div className="qr-code-container">
              <QRCodeCanvas value={qrToken} size={200} />
            </div>

            <button className="btn btn-secondary btn-block" onClick={() => setQrToken("")}>
              Start New Order
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const CartContent = () => (
    <>
      <div className="cart-header">
        <ReceiptText size={24} color="var(--accent)" />
        <h2>Current Order</h2>
        {cart.length > 0 && (
          <span className="badge badge-accent" style={{ marginLeft: "auto" }}>
            {cart.length}
          </span>
        )}
      </div>

      <div style={{ minHeight: 120 }}>
        <AnimatePresence>
          {cartGrouped.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cart-empty"
            >
              <ShoppingBag size={32} style={{ marginBottom: "var(--space-3)", opacity: 0.3 }} />
              <p>Your tray is empty.</p>
            </motion.div>
          )}
          {cartGrouped.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
              className="cart-item"
            >
              <div className="cart-item-info">
                <span style={{ fontSize: "1.25rem" }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{formatINR(item.price)} each</div>
                </div>
              </div>
              <div className="cart-item-actions">
                <button
                  className="btn-icon"
                  style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)" }}
                  onClick={() => removeOneFromCart(item.id)}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", minWidth: 20, textAlign: "center" }}>
                  {item.qty}
                </span>
                <button
                  className="btn-icon"
                  style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)" }}
                  onClick={() => addToCart(menu.find((m) => m.id === item.id) || item)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <motion.div layout>
          <div className="cart-bill card-compact">
            <div className="cart-bill-row">
              <span>Items Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="cart-bill-row">
              <span>SGST (2.5%)</span>
              <span>{formatINR(sgst)}</span>
            </div>
            <div className="cart-bill-row">
              <span>CGST (2.5%)</span>
              <span>{formatINR(cgst)}</span>
            </div>
            <div className="cart-bill-row">
              <span>Platform Fee (1%)</span>
              <span>{formatINR(platformFee)}</span>
            </div>
            <div className="cart-total">
              <span>Total Payable</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={handleOrder}
            disabled={loading}
          >
            {loading ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (
              <>Pay & Get QR <ArrowRight size={18} /></>
            )}
          </button>
        </motion.div>
      )}
    </>
  );

  return (
    <div className={`app-content ${currentView === "menu" && cart.length > 0 ? "has-cart-bottom-bar" : ""}`}>
      {currentView === "menu" && (
        <div className="student-menu-area">
          <div className="student-header-row">
            <div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                Today's Menu <Sparkles size={24} color="var(--accent)" />
              </h2>
              <p style={{ fontSize: "1rem", marginTop: "var(--space-2)" }}>Select items, review your bill, and pay to generate your pickup QR.</p>
            </div>
          </div>

          {fetchingMenu ? (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div className="loader loader-lg" />
            </div>
          ) : menu.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <p>The menu is currently being updated. Check back shortly.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {menu.map((item) => (
                <motion.div
                  key={item.id}
                  className="card card-interactive menu-card"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="menu-card-emoji">{item.emoji || "🍲"}</div>
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-price">{formatINR(item.price)}</div>
                  {cartQtyMap[item.id] ? (
                    <div className="menu-qty-controls">
                      <button
                        className="menu-qty-btn"
                        onClick={() => removeOneFromCart(item.id)}
                        aria-label={`Remove one ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="menu-qty-value">{cartQtyMap[item.id]}</span>
                      <button
                        className="menu-qty-btn"
                        onClick={() => addToCart(item)}
                        aria-label={`Add one ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-secondary btn-sm btn-block"
                    >
                      <Plus size={16} /> Add
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === "menu" && cart.length > 0 && (
        <button className="cart-bottom-bar" onClick={() => setCurrentView("cart")}> 
          <div className="cart-bottom-bar-meta">
            <span className="cart-bottom-bar-count"><ShoppingBag size={16} /> {cart.length} item{cart.length > 1 ? "s" : ""}</span>
            <span className="cart-bottom-bar-total">{formatINR(grandTotal)}</span>
          </div>
          <span className="cart-bottom-bar-action">View Cart <ArrowRight size={16} /></span>
        </button>
      )}

      {currentView === "cart" && (
        <div className="cart-page-wrap">
          <div className="cart-page-header">
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentView("menu")}>
              <ArrowLeft size={16} /> Back To Menu
            </button>
          </div>
          <div className="card cart-panel cart-page-panel">
            <CartContent />
          </div>
        </div>
      )}
    </div>
  );
}