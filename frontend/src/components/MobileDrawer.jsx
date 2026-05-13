import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  ScanLine,
  Sparkles,
  ReceiptText,
  Sun,
  Moon
} from "lucide-react";

const studentNavItems = [
  { path: "/", icon: Sparkles, label: "Menu" },
  { path: "/my-orders", icon: ReceiptText, label: "My Orders" },
];

const adminNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/orders", icon: ClipboardList, label: "Orders" },
  { path: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
  { path: "/admin/scan", icon: ScanLine, label: "Scan" },
];

export default function MobileDrawer({ role, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("tap2eat-theme", nextTheme);
    setTheme(nextTheme);
  };

  const navItems = role === "admin" ? adminNavItems : studentNavItems;

  const handleNav = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      <button
        className="drawer-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        ref={drawerRef}
        className={`mobile-drawer ${isOpen ? "open" : ""}`}
      >
        <div className="drawer-header">
          <div className="drawer-role-chip">
            <div className="drawer-role-dot" />
            {role === "admin" ? "Admin" : "Student"}
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`drawer-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="drawer-footer">
          <button
            className="drawer-nav-item drawer-theme-btn"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            className="drawer-nav-item drawer-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
