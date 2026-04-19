import { Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ isOpen, onClose, showRegister, setShowRegister, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="card"
          style={{ width: "100%", maxWidth: 460, position: "relative" }}
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          <button
            className="btn-icon"
            onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            >
              <div style={{
                width: 64, height: 64,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto var(--space-4)"
              }}>
                <Shield size={32} color="var(--accent)" />
              </div>
            </motion.div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>
              {showRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={{ fontSize: "0.95rem" }}>
              Secure access to campus dining
            </p>
          </div>

          {children}

          <div style={{
            textAlign: "center",
            marginTop: "var(--space-8)",
            paddingTop: "var(--space-5)",
            borderTop: "1px solid var(--border)",
            fontSize: "0.9rem"
          }}>
            <span style={{ color: "var(--text-muted)" }}>
              {showRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <span
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister ? "Sign in instead" : "Create one now"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}