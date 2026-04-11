import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, isOfflineMode } from "../../firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from "firebase/firestore";

function AdminMenu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  // 🔥 Real-time listener for menu items
  useEffect(() => {
    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
      setTimeout(() => {
        setMenuItems([
          { id: "1", name: "Artisan Pizza", price: 250, emoji: "🍕", available: true },
          { id: "2", name: "Specialty Coffee", price: 120, emoji: "☕", available: true },
          { id: "3", name: "Morning Croissant", price: 90, emoji: "🥐", available: true },
          { id: "4", name: "Fresh Salad", price: 180, emoji: "🥗", available: false }
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
    });

    return () => unsubscribe();
  }, []);

  // ➕ Add New Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim() || !newItem.price) {
      alert("Please provide both item name and price.");
      return;
    }

    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
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
      await addDoc(collection(db, "menu"), {
        name: newItem.name.trim(),
        price: Number(newItem.price),
        available: true,
        createdAt: new Date().toISOString()
      });
      setNewItem({ name: "", price: "" });
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Toggle Availability
  const toggleAvailability = async (id, currentStatus) => {
    if (isOfflineMode) {
      // OFFLINE DEMO BYPASS
      setMenuItems(menuItems.map(item => item.id === id ? { ...item, available: !currentStatus } : item));
      return;
    }
    try {
      const itemRef = doc(db, "menu", id);
      await updateDoc(itemRef, {
        available: !currentStatus
      });
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update availability.");
    }
  };

  // 🗑️ Delete Item
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    if (isOfflineMode) {
       // OFFLINE DEMO BYPASS
       setMenuItems(menuItems.filter(item => item.id !== id));
       return;
    }

    try {
      await deleteDoc(doc(db, "menu", id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="admin-menu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ margin: 0 }}>Menu Management 🍽️</h2>
          <p style={{ color: "var(--text-muted)", margin: "5px 0 0 0" }}>Control what students can see and order</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          Back to Orders
        </button>
      </div>

      {/* 📝 Add Item Form */}
      <div style={{ 
        background: "rgba(255,255,255,0.6)", 
        padding: "25px", 
        borderRadius: "20px", 
        marginBottom: "40px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Add New Menu Item</h3>
        <form onSubmit={handleAddItem} style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2", minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Item Name</label>
            <input 
              type="text" 
              placeholder="e.g. Cheese Pizza"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #ddd" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "100px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Price (₹)</label>
            <input 
              type="number" 
              placeholder="0"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #ddd" }}
            />
          </div>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ padding: "12px 30px" }}
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>

      {/* 📋 Menu Grid */}
      <h3 style={{ marginBottom: "20px" }}>Current Menu Items ({menuItems.length})</h3>
      
      {menuItems.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px" }}>
          <p style={{ fontSize: "1.2rem" }}>No items in the menu yet. Start by adding one above! 🍕</p>
        </div>
      ) : (
        <div className="menu-grid" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "20px" 
        }}>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className="order-card" 
              style={{ 
                opacity: item.available ? 1 : 0.7,
                borderLeft: `5px solid ${item.available ? "var(--secondary)" : "#ccc"}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{item.name}</h3>
                  <span style={{ 
                    background: item.available ? "#e6fcf5" : "#f1f3f5", 
                    color: item.available ? "#099268" : "#868e96",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "700"
                  }}>
                    {item.available ? "AVAILABLE" : "OUT OF STOCK"}
                  </span>
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--primary)", marginBottom: "20px" }}>
                  ₹{item.price}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", paddingTop: "15px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <button 
                  onClick={() => toggleAvailability(item.id, item.available)}
                  className={`btn ${item.available ? "btn-outline" : "btn-secondary"}`}
                  style={{ flex: 1, padding: "8px", fontSize: "0.85rem" }}
                >
                  {item.available ? "Mark Out of Stock" : "Mark Available"}
                </button>
                <button 
                  onClick={() => deleteItem(item.id)}
                  style={{ 
                    padding: "8px 15px", 
                    background: "#fff0f0", 
                    color: "#e03131", 
                    border: "none", 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminMenu;
