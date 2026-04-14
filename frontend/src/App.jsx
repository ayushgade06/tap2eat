import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Routes, Route, Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LandingPage from "./pages/Auth/LandingPage";
import AuthModal from "./components/AuthModal";

import Student from "./pages/Student/Student";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ScanPage from "./pages/Admin/ScanPage";
import AdminMenu from "./pages/Admin/AdminMenu";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Guard: auth may be null if .env is missing
    if (!auth) {
      setLoading(false);
      return;
    }
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
          setUser(u);
          try {
            const docRef = doc(db, "users", u.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) setRole(snap.data().role);
          } catch (error) {
            console.error("Error fetching user role", error);
          }
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.error("Firebase auth init failed:", err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setRole(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0f1014" }}>
        <div className="loader" style={{ width: "48px", height: "48px", borderWidth: "4px" }}></div>
      </div>
    );
  }

  // 🔐 UNAUTHENTICATED SCROLL-DRIVEN LANDING PAGE
  if (!user) {
    return (
      <>
        <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          showRegister={showRegister}
          setShowRegister={setShowRegister}
        >
          {showRegister ? <Register /> : <Login setUser={setUser} setRole={setRole} onClose={() => setIsAuthModalOpen(false)} />}
        </AuthModal>
      </>
    );
  }

  // ✅ AUTHENTICATED MAIN APP (Dashboard Mode)
  return (
    <div style={{ padding: "40px 5%" }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "40px", 
        paddingBottom: "20px", 
        borderBottom: "1px solid var(--theme-border)",
        background: "var(--theme-bg)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        paddingTop: "20px"
      }}>
        <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)", fontFamily: "var(--font-display)" }}>Tap2Eat</h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {role && (
            <div className="glass-pill" style={{ color: "var(--theme-text)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--theme-accent)" }}></div>
              {role === "admin" ? "Admin" : "Student"}
            </div>
          )}
          <button className="btn-secondary" onClick={handleLogout} style={{ padding: "10px 20px", fontSize: "0.95rem", borderRadius: "100px" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* ✅ STRICT ROUTING */}
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
             <div style={{ textAlign: "center", padding: "100px 0" }}>
               <div className="loader" style={{ width: "40px", height: "40px" }}></div>
               <p style={{ marginTop: "20px", opacity: 0.7 }}>Preparing workspace...</p>
             </div>
           } />
        )}
      </Routes>
    </div>
  );
}

export default App;