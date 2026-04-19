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
      await setDoc(doc(db, "users", res.user.uid), { email, role });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          className="form-input"
          placeholder="student@college.edu"
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Select Role</label>
        <select
          className="form-input"
          onChange={(e) => setRole(e.target.value)}
          defaultValue="student"
        >
          <option value="student">Student</option>
          <option value="admin">Canteen Admin</option>
        </select>
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleRegister}
        disabled={loading}
        style={{ marginTop: "var(--space-3)" }}
      >
        {loading ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : "Create Account"}
      </button>
    </>
  );
}

export default Register;