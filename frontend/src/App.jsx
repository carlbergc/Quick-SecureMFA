import { useState } from "react";
import Login from "./Login";
import MFA from "./MFA";
import Register from "./Register";

function App() {
  const [tempToken, setTempToken] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  if (sessionToken) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>
        <h2>Authenticated!</h2>
        <p>You are now securely logged in.</p>
      </div>
    );
  }

  if (tempToken) {
    return <MFA tempToken={tempToken} onSuccess={setSessionToken} />;
  }

  if (showRegister) {
    return (
      <Register
        onSuccess={() => setShowRegister(false)}
        onBack={() => setShowRegister(false)}
      />
    );
  }

  return <Login onSuccess={setTempToken} onRegister={() => setShowRegister(true)} />;
}

export default App;