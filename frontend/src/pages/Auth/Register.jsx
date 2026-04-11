import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        role
      });
      // automatically jumps to logged-in via onAuthStateChanged
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Create Account</h2>

      <div className="input-group">
        <label className="input-label">Email Address</label>
        <input 
          className="input-field" 
          placeholder="student@college.edu" 
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
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Select Role</label>
        <select className="input-field" onChange={(e) => setRole(e.target.value)} defaultValue="student">
          <option value="student">Student</option>
          <option value="admin">Canteen Admin</option>
        </select>
      </div>

      <button className="btn" style={{ width: "100%", marginTop: "10px" }} onClick={handleRegister} disabled={loading}>
        {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : "Create Account"}
      </button>
    </>
  );
}

export default Register;