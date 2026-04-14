import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, isOfflineMode } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Settings, ScanLine, Clock, Package } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
      setTimeout(() => {
        setOrders([
          { id: "demo-ord-101", totalAmount: 370, items: [{name: "Artisan Pizza"}, {name: "Specialty Coffee"}] },
          { id: "demo-ord-102", totalAmount: 180, items: [{name: "Fresh Salad"}] }
        ]);
        setLoading(false);
      }, 800);
      return;
    }

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "40px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", fontSize: "2.5rem" }}>
            Kitchen Hub <Package color="var(--theme-accent)" />
          </h2>
          <p style={{ opacity: 0.6, fontSize: "1.2rem", marginTop: "10px" }}>Manage live orders and fulfillment</p>
        </div>
        
        <div style={{ display: "flex", gap: "15px" }}>
          <button className="btn-secondary" onClick={() => navigate("/admin/menu")}>
            <Settings size={18} /> Manage Menu
          </button>
          
          <button className="btn-primary" onClick={() => navigate("/admin/scan")} style={{ padding: "14px 28px" }}>
            <ScanLine size={18} /> Scan Token
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ background: "rgba(255,107,107,0.1)", padding: "20px", borderRadius: "20px" }}>
              <Clock size={40} color="var(--theme-accent)" />
            </div>
            <div>
              <p style={{ opacity: 0.6, margin: 0, fontSize: "1.1rem" }}>Pending Fulfillment</p>
              <h3 style={{ margin: 0, fontSize: "3rem", fontWeight: 800 }}>{orders.length}</h3>
            </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Active Queue</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {loading ? (
            <div className="glass-panel" style={{ textAlign: "center" }}><div className="loader"></div></div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
               <p style={{ opacity: 0.6, fontSize: "1.2rem" }}>Queue is empty. Kitchen is resting.</p>
            </div>
          ) : (
            orders.map((order, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel" 
                key={order.id}
                style={{ padding: "25px", borderLeft: "4px solid var(--theme-accent)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--theme-border)", paddingBottom: "15px", marginBottom: "15px" }}>
                  <span style={{ fontFamily: "monospace", opacity: 0.6 }}>#{order.id.substring(0, 8).toUpperCase()}</span>
                  <span style={{ fontWeight: "800", color: "var(--theme-accent)", fontSize: "1.3rem" }}>₹{order.totalAmount}</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--theme-accent)" }}></div>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                  <span className="glass-pill" style={{ opacity: 0.8, fontSize: "0.9rem" }}>Awaiting QR Scan</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;