import { useState } from "react";
import axios from "axios";

function Login({ onSuccess, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        username,
        password,
      });
      onSuccess(res.data.temp_token);
    } catch (err) {
      setError("Invalid username or password.");
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
      <h2>Quick MFA Login</h2>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin} style={{ padding: "8px 16px" }}>
        Login
      </button>
      <p style={{ marginTop: 16, fontSize: 14, color: "#555" }}>
        Don't have an account?{" "}
        <span
          onClick={onRegister}
          style={{ color: "#0066cc", cursor: "pointer", textDecoration: "underline" }}
        >
          Create one
        </span>
      </p>
    </div>
  );
}

export default Login;