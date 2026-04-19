import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LandingPage from "./pages/Auth/LandingPage";
import AuthModal from "./components/AuthModal";
import AppLayout from "./components/AppLayout";
import AdminSidebar from "./components/AdminSidebar";

import Student from "./pages/Student/Student";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ScanPage from "./pages/Admin/ScanPage";
import AdminMenu from "./pages/Admin/AdminMenu";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
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
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: "var(--space-4)"
      }}>
        <div className="loader loader-lg" />
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>Loading...</p>
      </div>
    );
  }

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
          {showRegister
            ? <Register />
            : <Login setUser={setUser} setRole={setRole} onClose={() => setIsAuthModalOpen(false)} />
          }
        </AuthModal>
      </>
    );
  }

  return (
    <AppLayout role={role} onLogout={handleLogout}>
      {role === "student" && (
        <Routes>
          <Route path="/" element={<Student />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      {role === "admin" && (
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-main">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin/scan" element={<ScanPage />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}

      {!role && (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="loader loader-lg" />
          <p className="text-muted" style={{ marginTop: "var(--space-5)" }}>Preparing workspace...</p>
        </div>
      )}
    </AppLayout>
  );
}

export default App;