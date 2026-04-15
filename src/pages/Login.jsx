import { useState } from "react";
import { loginUser, registerUser } from "../api/user";

export default function Login() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await registerUser({ username, email, password });
      setMessage(res.message);
    } catch (err) {
      setMessage(err?.detail || "Register error");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await loginUser({ username, password });
      setMessage(res.message);
    } catch (err) {
      setMessage(err?.detail || "Login error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login / Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin} style={{ marginLeft: "10px" }}>
        Login
      </button>

      <h3>{message}</h3>
    </div>
  );
}