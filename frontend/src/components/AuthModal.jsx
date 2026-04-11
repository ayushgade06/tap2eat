import { Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ isOpen, onClose, showRegister, setShowRegister, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      >
        <motion.div 
          className="glass-panel"
          style={{ width: "100%", maxWidth: "480px", position: "relative" }}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button 
            onClick={onClose}
            className="btn-icon-only"
            style={{ position: "absolute", top: "20px", right: "20px", width: "40px", height: "40px" }}
          >
            <X size={20} />
          </button>
          
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Shield size={48} color="var(--theme-accent)" style={{ marginBottom: "16px" }} />
            </motion.div>
            <h2>{showRegister ? "Join tap2eat" : "Welcome Back"}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>
              Secure access to campus dining
            </p>
          </div>

          {children}

          <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.95rem" }}>
            <span style={{ opacity: 0.6 }}>
              {showRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <span 
              className="nav-link" 
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
