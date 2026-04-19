import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, ScanLine } from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Orders" },
  { path: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
  { path: "/admin/scan", icon: ScanLine, label: "Scan" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="admin-sidebar">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <item.icon size={22} />
          </button>
        ))}
      </nav>

      <nav className="admin-bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
