import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BrandLogo from "./BrandLogo";

export default function AppLayout({ role, onLogout, children }) {
  return (
    <div className="app-layout">
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <BrandLogo />
        </div>

        <div className="app-topbar-actions">
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
      </header>

      {children}
    </div>
  );
}
