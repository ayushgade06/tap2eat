import { useEffect, useState } from "react";
import { db, isOfflineMode } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Package,
  IndianRupee,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

function formatOrderDate(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return `${day} ${month} ${year} — ${time}`;
}

function groupItems(items) {
  const map = {};
  (items || []).forEach((item) => {
    const key = item.name;
    if (map[key]) {
      map[key].qty += 1;
    } else {
      map[key] = { name: item.name, price: item.price, qty: 1 };
    }
  });
  return Object.values(map);
}

function isToday(timestamp) {
  const orderDate = new Date(timestamp);
  const today = new Date();
  return (
    orderDate.getDate() === today.getDate() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getFullYear() === today.getFullYear()
  );
}

function AdminOrderCard({ order, index }) {
  const items = groupItems(order.items);
  const isPending = order.orderStatus === "pending";
  const isCompleted = order.orderStatus === "completed";
  const isExpired = order.orderStatus === "expired";

  const statusLabel = isCompleted
    ? "Collected"
    : isExpired
    ? "Expired"
    : "Pending";

  const borderClass = isCompleted
    ? "admin-order-completed"
    : isExpired
    ? "admin-order-expired"
    : "admin-order-pending";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ delay: index * 0.03 }}
      layout
      className={`card card-compact admin-order-card ${borderClass}`}
    >
      <div className="admin-order-header">
        <div className="admin-order-header-left">
          <span className="admin-order-id-label">ID:</span>
          <span className="font-mono admin-order-id">
            {(order.id || "").substring(0, 8).toUpperCase()}
          </span>
          <span className="admin-order-date">
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
        <div className="admin-order-header-right">
          <span className="admin-order-amount">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
          <span className={`badge ${
            isCompleted ? "badge-success" : isExpired ? "badge-danger" : "badge-warning"
          }`}>
            {isCompleted && <CheckCircle2 size={12} />}
            {isExpired && <XCircle size={12} />}
            {isPending && <Clock size={12} />}
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="admin-order-user">
        <span className="admin-order-user-label">Student:</span>
        <span className="admin-order-user-id">
          {order.userEmail || (order.userId ? `ID: ${order.userId.substring(0, 8)}...` : "Guest")}
        </span>
      </div>

      <div className="admin-order-items">
        {items.map((item, idx) => (
          <div key={idx} className="admin-order-item-row">
            <span>{item.name}</span>
            {item.qty > 1 && <span className="admin-order-item-qty">x{item.qty}</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AdminOrders() {
  const [allOrders, setAllOrders] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

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

    // Listen to orders
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
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
        setRefreshing(false);
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
      },
      (error) => {
        console.error("Error fetching users for emails:", error);
        if (error.code === 'permission-denied') {
          console.warn("Permission denied for 'users' collection. Admin cannot see student emails until Rules are updated.");
        }
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, []);

  const ordersWithEmails = allOrders.map(order => ({
    ...order,
    userEmail: userEmails[order.userId] || null
  }));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const pendingOrders = ordersWithEmails.filter((o) => o.orderStatus === "pending");
  const completedOrders = ordersWithEmails.filter((o) => o.orderStatus === "completed");
  const expiredOrders = ordersWithEmails.filter((o) => o.orderStatus === "expired");

  const completedToday = completedOrders.filter((o) => isToday(o.createdAt));
  const expiredToday = expiredOrders.filter((o) => isToday(o.createdAt));
  const revenueToday = completedToday.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const tabs = [
    { key: "pending", label: "Pending", count: pendingOrders.length },
    { key: "completed", label: "Completed", count: completedOrders.length },
    { key: "expired", label: "Expired", count: expiredOrders.length }
  ];

  const activeOrders =
    activeTab === "pending"
      ? pendingOrders
      : activeTab === "completed"
      ? completedOrders
      : expiredOrders;

  const emptyMessage =
    activeTab === "pending"
      ? "No pending orders — Kitchen is resting ✨"
      : activeTab === "completed"
      ? "No completed orders yet"
      : "No expired orders";

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
            Order Management
          </h2>
          <p>Track and manage all orders in realtime</p>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          title="Refresh orders"
        >
          <RefreshCw size={18} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="admin-stat-grid admin-stat-grid-4">
        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--warning-soft)" }}>
            <Clock size={28} color="var(--warning)" />
          </div>
          <div>
            <div className="admin-stat-value">{pendingOrders.length}</div>
            <div className="admin-stat-label">Pending</div>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--success-soft)" }}>
            <CheckCircle2 size={28} color="var(--success)" />
          </div>
          <div>
            <div className="admin-stat-value">{completedToday.length}</div>
            <div className="admin-stat-label">Completed Today</div>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--danger-soft)" }}>
            <AlertTriangle size={28} color="var(--danger)" />
          </div>
          <div>
            <div className="admin-stat-value">{expiredToday.length}</div>
            <div className="admin-stat-label">Expired Today</div>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "var(--accent-secondary-soft)" }}>
            <IndianRupee size={28} color="var(--accent-secondary)" />
          </div>
          <div>
            <div className="admin-stat-value">₹{revenueToday.toFixed(2)}</div>
            <div className="admin-stat-label">Revenue Today</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`admin-tab-count ${
                tab.key === "pending" ? "tab-count-warning" :
                tab.key === "completed" ? "tab-count-success" :
                "tab-count-danger"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="order-list">
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div className="loader loader-lg" />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "1.1rem" }}>{emptyMessage}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeOrders.map((order, i) => (
              <AdminOrderCard key={order.id} order={order} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export default AdminOrders;
