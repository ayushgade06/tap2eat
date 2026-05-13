import { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db, isOfflineMode } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Timer,
  ReceiptText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

function formatExpiryTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function getTimeRemaining(expiryTime) {
  const diff = expiryTime - Date.now();
  if (diff <= 0) return null;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { minutes, seconds, total: diff };
}

function groupItems(items) {
  const map = {};
  items.forEach((item) => {
    const key = item.name;
    if (map[key]) {
      map[key].qty += 1;
    } else {
      map[key] = { name: item.name, price: item.price, qty: 1 };
    }
  });
  return Object.values(map);
}

function CountdownTimer({ expiryTime }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(expiryTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getTimeRemaining(expiryTime);
      setRemaining(r);
      if (!r) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (!remaining) {
    return (
      <span className="countdown-badge countdown-expired">
        <XCircle size={14} />
        Expired
      </span>
    );
  }

  const isUrgent = remaining.total < 300000;

  return (
    <span className={`countdown-badge ${isUrgent ? "countdown-urgent" : ""}`}>
      <Timer size={14} />
      {remaining.minutes}m {remaining.seconds.toString().padStart(2, "0")}s remaining
    </span>
  );
}

function OrderCard({ order }) {
  const items = groupItems(order.items || []);
  const now = Date.now();
  const isPending = order.orderStatus === "pending";
  const isCompleted = order.orderStatus === "completed";
  const isExpired =
    order.orderStatus === "expired" || (isPending && now > order.expiryTime);
  const showQR = isPending && now < order.expiryTime;

  const statusLabel = isCompleted
    ? "Collected"
    : isExpired
    ? "Expired"
    : "Pending";

  const statusClass = isCompleted
    ? "status-completed"
    : isExpired
    ? "status-expired"
    : "status-pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      layout
      className={`card order-history-card ${statusClass}`}
    >
      <div className="order-history-header">
        <div className="order-history-meta">
          <span className="font-mono order-history-id">
            #{(order.id || "").substring(0, 8).toUpperCase()}
          </span>
          <span className="order-history-date">
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
        <span className={`badge ${
          isCompleted ? "badge-success" : isExpired ? "badge-danger" : "badge-warning"
        }`}>
          {isCompleted && <CheckCircle2 size={12} />}
          {isExpired && <XCircle size={12} />}
          {isPending && !isExpired && <Clock size={12} />}
          {statusLabel}
        </span>
      </div>

      <div className="order-history-items">
        {items.map((item, idx) => (
          <div key={idx} className="order-history-item-row">
            <span className="order-history-item-name">
              {item.name} {item.qty > 1 && <span className="order-history-item-qty">x{item.qty}</span>}
            </span>
            <span className="order-history-item-price">
              ₹{(item.price * item.qty).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      <div className="order-history-total-row">
        <span>Total</span>
        <span className="order-history-total-value">₹{order.totalAmount}</span>
      </div>

      {showQR && (
        <div className="order-qr-section">
          <div className="order-qr-container">
            <QRCodeCanvas value={order.qrToken} size={160} level="H" includeMargin={true} />
          </div>
          <div className="order-qr-info">
            <p className="order-qr-valid">
              Valid till: <strong>{formatExpiryTime(order.expiryTime)}</strong>
            </p>
            <CountdownTimer expiryTime={order.expiryTime} />
          </div>
        </div>
      )}

      {isExpired && (
        <div className="order-qr-expired-banner">
          <XCircle size={18} />
          <span>QR Expired — This order can no longer be collected</span>
        </div>
      )}

      {isCompleted && (
        <div className="order-qr-completed-banner">
          <CheckCircle2 size={18} />
          <span>Order Collected — Enjoy your meal!</span>
        </div>
      )}
    </motion.div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOfflineMode) {
      const now = Date.now();
      setTimeout(() => {
        setOrders([
          {
            id: "demo-001abc",
            items: [
              { name: "Artisan Pizza", price: 250 },
              { name: "Artisan Pizza", price: 250 },
              { name: "Specialty Coffee", price: 120 }
            ],
            totalAmount: 620,
            paymentStatus: "success",
            orderStatus: "pending",
            createdAt: now - 600000,
            expiryTime: now + 1200000,
            qrToken: "demo-token-active-001"
          },
          {
            id: "demo-002def",
            items: [
              { name: "Grilled Sandwich", price: 150 },
              { name: "Masala Chai", price: 40 }
            ],
            totalAmount: 190,
            paymentStatus: "success",
            orderStatus: "completed",
            createdAt: now - 7200000,
            expiryTime: now - 5400000,
            qrToken: "demo-token-completed-002"
          },
          {
            id: "demo-003ghi",
            items: [
              { name: "Fresh Salad", price: 180 }
            ],
            totalAmount: 180,
            paymentStatus: "success",
            orderStatus: "expired",
            createdAt: now - 86400000,
            expiryTime: now - 84600000,
            qrToken: "demo-token-expired-003"
          }
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    const user = auth?.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setOrders(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="app-content my-orders-page">
      <div className="my-orders-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          Back to Menu
        </button>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <ReceiptText size={28} color="var(--accent)" />
            My Orders
          </h2>
          <p style={{ marginTop: "var(--space-2)" }}>
            View your order history and access active QR codes
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div className="loader loader-lg" />
          <p className="text-muted" style={{ marginTop: "var(--space-4)" }}>
            Loading your orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card my-orders-empty"
        >
          <ShoppingBag size={56} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <h3 style={{ marginTop: "var(--space-5)", fontSize: "1.3rem" }}>
            No orders yet
          </h3>
          <p style={{ marginTop: "var(--space-2)", maxWidth: 340, margin: "var(--space-2) auto 0" }}>
            Your order history will appear here once you place your first order.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-6)" }}
            onClick={() => navigate("/")}
          >
            Browse Menu
          </button>
        </motion.div>
      ) : (
        <div className="orders-grid">
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
