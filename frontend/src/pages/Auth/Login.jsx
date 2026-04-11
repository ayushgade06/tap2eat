import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

function Login({ setUser }) {
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

  return (
    <>
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Welcome Back</h2>

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

      <button className="btn" style={{ width: "100%", marginTop: "10px" }} onClick={handleLogin} disabled={loading}>
        {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : "Login"}
      </button>
    </>
  );
}

export default Login;