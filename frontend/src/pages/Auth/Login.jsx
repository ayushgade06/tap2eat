import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

function Login({ setUser, setRole, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = (role) => {
    setUser({
      uid: `demo-${role}-123`,
      email: `${role}@demo.com`,
      displayName: `Demo ${role === "admin" ? "Admin" : "Student"}`
    });
    setRole(role);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          className="form-input"
          placeholder="your@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleLogin}
        disabled={loading}
        style={{ marginTop: "var(--space-3)" }}
      >
        {loading ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : "Sign In"}
      </button>

      <div style={{
        marginTop: "var(--space-6)",
        borderTop: "1px solid var(--border)",
        paddingTop: "var(--space-5)",
        textAlign: "center"
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "var(--space-4)" }}>
          Testing without Firebase?
        </p>
        <div className="flex gap-3" style={{ justifyContent: "center" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleBypass("student")}>
            Demo Student
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--border-accent)",
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)"
            }}
            onClick={() => handleBypass("admin")}
          >
            Demo Admin
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;