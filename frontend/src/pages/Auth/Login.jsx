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
    setUser({ uid: `demo-${role}-123`, email: `${role}@demo.com`, displayName: `Demo ${role === 'admin' ? 'Admin' : 'Student'}` });
    setRole(role);
    if(onClose) onClose();
  };

  return (
    <>
      <div className="input-group">
        <label className="input-label">Email Address</label>
        <input 
          className="input-field" 
          placeholder="your@email.com" 
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Password</label>
        <input 
          className="input-field" 
          type="password" 
          placeholder="••••••••" 
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>

      <button className="btn-primary" style={{ width: "100%", marginTop: "10px" }} onClick={handleLogin} disabled={loading}>
        {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : "Sign In"}
      </button>

      <div style={{ marginTop: "30px", borderTop: "1px solid var(--theme-border)", paddingTop: "20px", textAlign: "center" }}>
        <p style={{ opacity: 0.6, fontSize: "0.9rem", marginBottom: "15px" }}>Testing without Firebase?</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn-secondary" style={{ padding: "10px 15px", fontSize: "0.9rem" }} onClick={() => handleBypass('student')}>
            Demo Student
          </button>
          <button className="btn-secondary" style={{ padding: "10px 15px", fontSize: "0.9rem", borderColor: "var(--theme-accent)", color: "var(--theme-accent)" }} onClick={() => handleBypass('admin')}>
            Demo Admin
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;