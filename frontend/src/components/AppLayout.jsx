import { LogOut, ReceiptText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import BrandLogo from "./BrandLogo";
import MobileDrawer from "./MobileDrawer";

export default function AppLayout({ role, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <BrandLogo />
        </div>

        {/* Desktop actions — hidden on mobile */}
        <div className="app-topbar-actions desktop-only">
          {role === "student" && (
            <button
              className={`btn btn-ghost btn-sm topbar-orders-btn ${location.pathname === "/my-orders" ? "active" : ""}`}
              onClick={() => navigate("/my-orders")}
            >
              <ReceiptText size={16} />
              My Orders
            </button>
          )}
          {role && (
            <div className="chip">
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)"
              }} />
              {role === "admin" ? "Admin" : "Student"}
            </div>
          )}
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Mobile drawer toggle — hidden on desktop */}
        {role && (
          <div className="mobile-only">
            <MobileDrawer role={role} onLogout={onLogout} />
          </div>
        )}
      </header>

      {children}
    </div>
  );
}
