import { useEffect, useState } from "react";
import { db, isOfflineMode } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Package,
  AlertTriangle
} from "lucide-react";

function formatOrderDate(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return `${day} ${month} — ${time}`;
}

function isToday(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function AdminDashboard() {
  const [allOrders, setAllOrders] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOfflineMode) {
      const now = Date.now();
      setTimeout(() => {
        setAllOrders([
          {
            id: "demo-ord-101",
            userId: "user_abc12345",
            totalAmount: 370,
            items: [
              { name: "Artisan Pizza", price: 250 },
              { name: "Specialty Coffee", price: 120 }
            ],
            paymentStatus: "success",
            orderStatus: "pending",
            createdAt: now - 600000,
            expiryTime: now + 1200000,
            qrToken: "demo-qr-101"
          },
          {
            id: "demo-ord-102",
            userId: "user_def67890",
            totalAmount: 180,
            items: [{ name: "Fresh Salad", price: 180 }],
            paymentStatus: "success",
            orderStatus: "pending",
            createdAt: now - 300000,
            expiryTime: now + 1500000,
            qrToken: "demo-qr-102"
          },
          {
            id: "demo-ord-103",
            userId: "user_ghi11223",
            totalAmount: 290,
            items: [
              { name: "Morning Croissant", price: 90 },
              { name: "Morning Croissant", price: 90 },
              { name: "Masala Chai", price: 40 },
              { name: "Specialty Coffee", price: 120 }
            ],
            paymentStatus: "success",
            orderStatus: "completed",
            createdAt: now - 3600000,
            expiryTime: now - 1800000,
            qrToken: "demo-qr-103"
          },
          {
            id: "demo-ord-104",
            userId: "user_jkl44556",
            totalAmount: 150,
            items: [{ name: "Grilled Sandwich", price: 150 }],
            paymentStatus: "success",
            orderStatus: "completed",
            createdAt: now - 5400000,
            expiryTime: now - 3600000,
            qrToken: "demo-qr-105"
          },
          {
            id: "demo-ord-105",
            userId: "user_mno77889",
            totalAmount: 250,
            items: [{ name: "Artisan Pizza", price: 250 }],
            paymentStatus: "success",
            orderStatus: "expired",
            createdAt: now - 7200000,
            expiryTime: now - 5400000,
            qrToken: "demo-qr-104"
          }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAllOrders(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        alert(`Error fetching live orders: ${error.message}. Please check Firestore Security Rules.`);
        setLoading(false);
      }
    );

    // Listen to users for emails
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const map = {};
        snapshot.forEach((doc) => {
          map[doc.id] = doc.data().email;
        });
        setUserEmails(map);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, []);

  const pendingOrders = allOrders.filter((o) => o.orderStatus === "pending");
  const completedOrders = allOrders.filter((o) => o.orderStatus === "completed");
  const expiredOrders = allOrders.filter((o) => o.orderStatus === "expired");

  const todayOrders = allOrders.filter((o) => isToday(o.createdAt));
  const completedToday = completedOrders.filter((o) => isToday(o.createdAt));
  const expiredToday = expiredOrders.filter((o) => isToday(o.createdAt));
  const revenueToday = completedToday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const recentOrders = allOrders.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="admin-page-header">
        <div></div>
        <div>
          <h2>
            <LayoutDashboard size={28} color="var(--accent)" />
            Dashboard
          </h2>
          <p>Overview of your canteen operations</p>
        </div>
        <div></div>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats-grid">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card dashboard-stat-card dashboard-stat-accent"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--accent-soft)" }}>
              <ShoppingBag size={22} color="var(--accent)" />
            </div>
            <span className="dashboard-stat-badge">Today</span>
          </div>
          <div className="dashboard-stat-number">{todayOrders.length}</div>
          <div className="dashboard-stat-label">Total Orders</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card dashboard-stat-card dashboard-stat-warning"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--warning-soft)" }}>
              <Clock size={22} color="var(--warning)" />
            </div>
            <span className="dashboard-stat-badge dashboard-stat-badge-live">Live</span>
          </div>
          <div className="dashboard-stat-number">{pendingOrders.length}</div>
          <div className="dashboard-stat-label">Pending Orders</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card dashboard-stat-card dashboard-stat-success"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--success-soft)" }}>
              <CheckCircle2 size={22} color="var(--success)" />
            </div>
            <span className="dashboard-stat-badge">Today</span>
          </div>
          <div className="dashboard-stat-number">{completedToday.length}</div>
          <div className="dashboard-stat-label">Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card dashboard-stat-card dashboard-stat-danger"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--danger-soft)" }}>
              <AlertTriangle size={22} color="var(--danger)" />
            </div>
            <span className="dashboard-stat-badge">Today</span>
          </div>
          <div className="dashboard-stat-number">{expiredToday.length}</div>
          <div className="dashboard-stat-label">Expired</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card dashboard-stat-card dashboard-stat-revenue"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--accent-secondary-soft)" }}>
              <IndianRupee size={22} color="var(--accent-secondary)" />
            </div>
            <span className="dashboard-stat-badge">Today</span>
          </div>
          <div className="dashboard-stat-number">₹{revenueToday.toFixed(2)}</div>
          <div className="dashboard-stat-label">Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card dashboard-stat-card"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrap" style={{ background: "var(--accent-soft)" }}>
              <TrendingUp size={22} color="var(--accent)" />
            </div>
            <span className="dashboard-stat-badge">All Time</span>
          </div>
          <div className="dashboard-stat-number">₹{totalRevenue.toFixed(2)}</div>
          <div className="dashboard-stat-label">Total Revenue</div>
        </motion.div>
      </div>

      {/* Two Column Layout: Status Breakdown + Recent Orders */}
      <div className="dashboard-grid-2col">
        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card dashboard-breakdown-card"
        >
          <h3 className="dashboard-section-title">
            <Package size={20} color="var(--accent)" />
            Order Breakdown
          </h3>
          <div className="dashboard-breakdown-list">
            <div className="dashboard-breakdown-row">
              <div className="dashboard-breakdown-info">
                <div className="dashboard-breakdown-dot" style={{ background: "var(--warning)" }} />
                <span>Pending</span>
              </div>
              <div className="dashboard-breakdown-bar-wrap">
                <div
                  className="dashboard-breakdown-bar"
                  style={{
                    width: `${allOrders.length > 0 ? (pendingOrders.length / allOrders.length) * 100 : 0}%`,
                    background: "var(--warning)"
                  }}
                />
              </div>
              <span className="dashboard-breakdown-count">{pendingOrders.length}</span>
            </div>
            <div className="dashboard-breakdown-row">
              <div className="dashboard-breakdown-info">
                <div className="dashboard-breakdown-dot" style={{ background: "var(--success)" }} />
                <span>Completed</span>
              </div>
              <div className="dashboard-breakdown-bar-wrap">
                <div
                  className="dashboard-breakdown-bar"
                  style={{
                    width: `${allOrders.length > 0 ? (completedOrders.length / allOrders.length) * 100 : 0}%`,
                    background: "var(--success)"
                  }}
                />
              </div>
              <span className="dashboard-breakdown-count">{completedOrders.length}</span>
            </div>
            <div className="dashboard-breakdown-row">
              <div className="dashboard-breakdown-info">
                <div className="dashboard-breakdown-dot" style={{ background: "var(--danger)" }} />
                <span>Expired</span>
              </div>
              <div className="dashboard-breakdown-bar-wrap">
                <div
                  className="dashboard-breakdown-bar"
                  style={{
                    width: `${allOrders.length > 0 ? (expiredOrders.length / allOrders.length) * 100 : 0}%`,
                    background: "var(--danger)"
                  }}
                />
              </div>
              <span className="dashboard-breakdown-count">{expiredOrders.length}</span>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: "var(--space-5)" }}
            onClick={() => navigate("/admin/orders")}
          >
            View All Orders <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card dashboard-recent-card"
        >
          <h3 className="dashboard-section-title">
            <Clock size={20} color="var(--accent)" />
            Recent Activity
          </h3>
          <div className="dashboard-recent-list">
            {loading ? (
              <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                <div className="loader" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                No orders yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="dashboard-recent-item">
                  <div className="dashboard-recent-icon-wrap">
                    {order.orderStatus === "completed" ? (
                      <CheckCircle2 size={16} color="var(--success)" />
                    ) : order.orderStatus === "expired" ? (
                      <XCircle size={16} color="var(--danger)" />
                    ) : (
                      <Clock size={16} color="var(--warning)" />
                    )}
                  </div>
                  <div className="dashboard-recent-info">
                    <div className="dashboard-recent-title">
                      {(order.items || []).map((i) => i.name).join(", ")}
                    </div>
                    <div className="dashboard-recent-meta">
                      {formatOrderDate(order.createdAt)} • {userEmails[order.userId] || order.userId?.substring(0, 8) || "Guest"}
                    </div>
                  </div>
                  <div className="dashboard-recent-right">
                    <span className="dashboard-recent-amount">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                    <span className={`badge ${
                      order.orderStatus === "completed" ? "badge-success" :
                      order.orderStatus === "expired" ? "badge-danger" : "badge-warning"
                    }`}>
                      {order.orderStatus === "completed" ? "Done" :
                       order.orderStatus === "expired" ? "Expired" : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: "var(--space-5)" }}
            onClick={() => navigate("/admin/orders")}
          >
            Manage Orders <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;