import { useEffect, useState } from "react";
import { db, isOfflineMode } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Clock, Package, IndianRupee, RefreshCw } from "lucide-react";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const setupOrdersListener = () => {
    setLoading(true);
    
    if (isOfflineMode) {
      setTimeout(() => {
        setOrders([
          { id: "demo-ord-101", totalAmount: 370, items: [{ name: "Artisan Pizza" }, { name: "Specialty Coffee" }] },
          { id: "demo-ord-102", totalAmount: 180, items: [{ name: "Fresh Salad" }] },
          { id: "demo-ord-103", totalAmount: 290, items: [{ name: "Morning Croissant" }, { name: "Masala Chai" }] }
        ]);
        setLoading(false);
      }, 500);
      return () => {};
    }

    const q = query(
      collection(db, "orders"),
      where("paymentStatus", "==", "success"),
      where("orderStatus", "==", "created")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setOrders(list);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = setupOrdersListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div></div>
        <div>
          <h2>
            <Package size={28} color="var(--accent)" />
            Kitchen Hub
          </h2>
          <p>Manage live orders and fulfillment</p>
        </div>
        <button 
          className="btn btn-sm btn-ghost" 
          onClick={handleRefresh}
          disabled={refreshing || loading}
          title="Refresh orders"
        >
          <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid">
        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--accent-soft)" }}>
            <Clock size={28} color="var(--accent)" />
          </div>
          <div>
            <div className="admin-stat-value">{orders.length}</div>
            <div className="admin-stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--accent-secondary-soft)" }}>
            <IndianRupee size={28} color="var(--accent-secondary)" />
          </div>
          <div>
            <div className="admin-stat-value">₹{totalRevenue}</div>
            <div className="admin-stat-label">Pending Revenue</div>
          </div>
        </div>
      </div>

      {/* Order Queue */}
      <div>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "var(--space-5)" }}>Active Queue</h3>

        <div className="order-list">
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <div className="loader loader-lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "1.1rem" }}>Queue is empty. Kitchen is resting ✨</p>
            </div>
          ) : (
            orders.map((order, i) => (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card card-compact order-card-item"
                key={order.id}
              >
                <div className="order-card-header">
                  <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 800, color: "var(--accent)", fontSize: "1.15rem", fontFamily: "var(--font-display)" }}>
                    ₹{order.totalAmount}
                  </span>
                </div>

                <div className="order-items-grid">
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "flex-end" }}>
                  <span className="badge badge-warning">Awaiting QR Scan</span>
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