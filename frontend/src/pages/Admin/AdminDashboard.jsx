import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 🔥 Real-time listener for pending orders
    const q = query(
      collection(db, "orders"),
      where("paymentStatus", "==", "success"),
      where("orderStatus", "==", "created")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setOrders(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ margin: 0, textAlign: "left" }}>Incoming Orders</h2>
          <p style={{ color: "var(--text-muted)", margin: "5px 0 0 0", textAlign: "left" }}>Manage orders securely</p>
        </div>
        
        {/* 🔘 Dashboard Controls */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/menu")}
            style={{ padding: "14px 28px", fontSize: "1.1rem" }}
          >
            🍽️ Manage Menu
          </button>
          
          <button
            className="btn"
            onClick={() => navigate("/admin/scan")}
            style={{ padding: "14px 28px", fontSize: "1.1rem" }}
          >
            📷 Scan Student QR
          </button>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.4)", padding: "20px", borderRadius: "16px", marginBottom: "20px", display: "inline-block" }}>
        <h3 style={{ margin: 0 }}>📦 Pending Orders to fulfill: <span style={{ color: "var(--primary)", fontSize: "1.6rem" }}>{orders.length}</span></h3>
      </div>

      {/* 📋 Orders List */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
             <p>No pending orders at the moment. You're all caught up! ✨</p>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px", marginBottom: "15px" }}>
                <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>#{order.id.substring(0, 8).toUpperCase()}</span>
                <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "1.2rem" }}>₹{order.totalAmount}</span>
              </div>
              
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {order.items?.map((item, index) => (
                  <li key={index} style={{ padding: "5px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{item.emoji || "🔸"} {item.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>₹{item.price}</span>
                  </li>
                ))}
              </ul>
              
              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed rgba(0,0,0,0.1)", textAlign: "right" }}>
                <span style={{ background: "#e2e8f0", padding: "5px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}>Paid, waiting for scan</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;