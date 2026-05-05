import { useState } from "react";
import axios from "axios";

function Register({ onSuccess, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!username || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/register", { username, password });
      setSuccess("Account created! You can now log in.");
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || "Registration failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 10,
    padding: 8,
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>
      <h2>Create Account</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={inputStyle}
      />
      {error && <p style={{ color: "red", margin: "0 0 10px" }}>{error}</p>}
      {success && <p style={{ color: "green", margin: "0 0 10px" }}>{success}</p>}
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{ padding: "8px 16px", marginRight: 10 }}
      >
        {loading ? "Creating..." : "Register"}
      </button>
      <button
        onClick={onBack}
        style={{ padding: "8px 16px", background: "none", border: "none", color: "#555", cursor: "pointer" }}
      >
        Back to Login
      </button>
    </div>
  );
}

export default Register;