import { useState } from "react";
import axios from "axios";

function MFA({ tempToken, onSuccess }) {
  const [codeSent, setCodeSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/generate-code", {
        temp_token: tempToken,
      });
      setCodeSent(true);
      setError("");
    } catch (err) {
      setError("Failed to send code. Try again.");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/verify-totp", {
        temp_token: tempToken,
        totp_token: enteredCode,
      });
      onSuccess(res.data.session_token);
    } catch (err) {
      setError("Invalid or expired code. Try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>
      <h2>Verify Your Identity</h2>
      <p>Click the button below to send a code to your QuickMFA app.</p>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: "8px 16px", marginBottom: 20 }}>
        {loading ? "Sending..." : "Send Code to App"}
      </button>
      {codeSent && <p style={{ color: "green" }}>Code sent! Check your QuickMFA app.</p>}
      <input
        placeholder="Enter code from app"
        value={enteredCode}
        onChange={(e) => setEnteredCode(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleVerify} style={{ padding: "8px 16px" }}>
        Verify
      </button>
    </div>
  );
}

export default MFA;