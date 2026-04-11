import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Student from "./pages/Student/Student";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ScanPage from "./pages/Admin/ScanPage";
import AdminMenu from "./pages/Admin/AdminMenu";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const docRef = doc(db, "users", u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setRole(snap.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <div className="loader" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary)", width: "40px", height: "40px" }}></div>
      </div>
    );
  }

  // 🔐 AUTH SCREEN
  if (!user) {
    return (
      <div className="glass-panel" style={{ maxWidth: "450px", margin: "auto" }}>
        <h1>Tap2Eat 🍔</h1>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "var(--text-muted)" }}>
          Premium Campus Dining Experience
        </p>

        {showRegister ? <Register /> : <Login setUser={setUser} />}

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {showRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          </span>
          <span className="nav-link" onClick={() => setShowRegister(!showRegister)}>
            {showRegister ? "Login here" : "Register here"}
          </span>
        </div>
      </div>
    );
  }

  // ✅ MAIN APP
  return (
    <div className="glass-panel" style={{ padding: "0 40px 40px" }}>
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Tap2Eat 🍔</h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {role && (
            <div className="user-badge">
              {role === "admin" ? "👨‍🍳 Admin" : "🎓 Student"}
            </div>
          )}
          <button className="btn btn-danger" onClick={handleLogout} style={{ padding: "8px 20px", fontSize: "0.9rem" }}>
            Logout
          </button>
        </div>
      </header>

      {/* ✅ STRICT ROUTING TO FIX ADMIN DISAPPEARANCE BUG */}
      <Routes>
        {role === "student" && (
          <>
            <Route path="/" element={<Student />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {role === "admin" && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/scan" element={<ScanPage />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
        
        {/* Loading fallback while role is being fetched if user is authenticated */}
        {!role && (
           <Route path="*" element={
             <div style={{ textAlign: "center", padding: "40px 0" }}>
               <div className="loader" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary)" }}></div>
               <p style={{ marginTop: "15px" }}>Loading your workspace...</p>
             </div>
           } />
        )}
      </Routes>
    </div>
  );
}

export default App;