import { useState, useEffect } from "react";
import { db, isOfflineMode } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADD_MENU_API = import.meta.env.VITE_ADD_MENU_API;
const TOGGLE_MENU_API = import.meta.env.VITE_TOGGLE_MENU_API;
const DELETE_MENU_API = import.meta.env.VITE_DELETE_MENU_API;

// Helper to handle fetch responses and provide better error messages
async function handleFetchResponse(res, actionName) {
  if (!res.ok) {
    let errorDetail = "";
    try {
      const text = await res.text();
      errorDetail = text.substring(0, 100); // Get first 100 chars of error page
    } catch (e) {
      errorDetail = res.statusText;
    }
    throw new Error(`${actionName} failed (Status ${res.status}): ${errorDetail}`);
  }
  
  try {
    return await res.json();
  } catch (err) {
    const text = await res.text();
    console.error(`JSON parse error for ${actionName}:`, text);
    throw new Error(`Invalid response format from server for ${actionName}. Expected JSON but received: ${text.substring(0, 50)}...`);
  }
}

function AdminMenu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOfflineMode) {
      setTimeout(() => {
        setMenuItems([
          { id: "1", name: "Artisan Pizza", price: 250, available: true },
          { id: "2", name: "Specialty Coffee", price: 120, available: true },
          { id: "3", name: "Morning Croissant", price: 90, available: true },
          { id: "4", name: "Fresh Salad", price: 180, available: false }
        ]);
      }, 500);
      return;
    }

    const q = query(collection(db, "menu"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setMenuItems(items);
    }, (error) => {
      console.error("Error fetching menu:", error);
      alert(`Error fetching menu: ${error.message}. Check Firestore Security Rules for read permissions.`);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) {
      alert("Please provide both item name and price.");
      return;
    }

    if (isOfflineMode) {
      setLoading(true);
      setTimeout(() => {
        setMenuItems([...menuItems, {
          id: `demo-item-${Date.now()}`,
          name: newItem.name.trim(),
          price: Number(newItem.price),
          available: true
        }]);
        setNewItem({ name: "", price: "" });
        setLoading(false);
      }, 500);
      return;
    }

    try {
      setLoading(true);
      if (!ADD_MENU_API) {
        throw new Error("Add Menu API URL is not configured in .env file. Please add VITE_ADD_MENU_API and restart the dev server.");
      }

      const res = await fetch(ADD_MENU_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItem.name.trim(), price: newItem.price })
      });
      
      const data = await handleFetchResponse(res, "Add Item");
      if (!data.success) throw new Error(data.message || "Failed to add item");
      setNewItem({ name: "", price: "" });
    } catch (err) {
      console.error("Error adding item:", err);
      alert(`Failed to add item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    if (isOfflineMode) {
      setMenuItems(menuItems.map(item => item.id === id ? { ...item, available: !currentStatus } : item));
      return;
    }
    try {
      if (!TOGGLE_MENU_API) {
        throw new Error("Toggle Menu API URL is not configured in .env file.");
      }

      const res = await fetch(TOGGLE_MENU_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, available: !currentStatus })
      });
      
      const data = await handleFetchResponse(res, "Update Availability");
      if (!data.success) throw new Error(data.message || "Failed to update availability");
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update availability: ${err.message}`);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    if (isOfflineMode) {
      setMenuItems(menuItems.filter(item => item.id !== id));
      return;
    }

    try {
      if (!DELETE_MENU_API) {
        throw new Error("Delete Menu API URL is not configured in .env file.");
      }

      const res = await fetch(DELETE_MENU_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      const data = await handleFetchResponse(res, "Delete Item");
      if (!data.success) throw new Error(data.message || "Failed to delete item");
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h2>Menu Management</h2>
          <p>Control what students can see and order</p>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="card" style={{ marginBottom: "var(--space-8)" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--space-5)" }}>Add New Item</h3>
        <form onSubmit={handleAddItem} className="menu-mgmt-form">
          <div style={{ flex: "2", minWidth: 200 }}>
            <label className="form-label">Item Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Cheese Pizza"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div style={{ flex: "1", minWidth: 100 }}>
            <label className="form-label">Price (₹)</label>
            <input
              className="form-input"
              type="number"
              placeholder="0"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Plus size={18} />
            {loading ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>

      {/* Menu Grid */}
      <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--space-5)" }}>
        Current Items ({menuItems.length})
      </h3>

      {menuItems.length === 0 ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem" }}>No items in the menu yet. Start by adding one above!</p>
        </div>
      ) : (
        <div className="menu-mgmt-grid">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.id}
              className="card card-compact menu-mgmt-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ opacity: item.available ? 1 : 0.7 }}
            >
              <div>
                <div className="menu-mgmt-card-header">
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{item.name}</h3>
                  </div>
                  <span className={`badge ${item.available ? "badge-success" : "badge-neutral"}`}>
                    {item.available ? "Available" : "Out of Stock"}
                  </span>
                </div>
                <div style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-display)",
                  marginTop: "var(--space-2)"
                }}>
                  ₹{item.price}
                </div>
              </div>

              <div className="menu-mgmt-card-actions">
                <button
                  onClick={() => toggleAvailability(item.id, item.available)}
                  className="toggle-switch-wrapper btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <div
                    className={`toggle-switch ${item.available ? "active" : ""}`}
                    style={{ display: "inline-block", marginRight: "var(--space-2)", verticalAlign: "middle" }}
                  />
                  {item.available ? "In Stock" : "Sold Out"}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default AdminMenu;