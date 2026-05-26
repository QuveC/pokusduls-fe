import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/user";
import "../App.css";

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: "Lemah" };
  if (score <= 3) return { level: 2, label: "Sedang" };
  return { level: 3, label: "Kuat" };
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setMessage({ text: "Username tidak boleh kosong", type: "error" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setMessage({ text: "Masukkan email yang valid", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Password minimal 6 karakter", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await registerUser({ username, email, password });
      setMessage({
        text: res.message || "Registrasi berhasil! Mengalihkan ke halaman login...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const errMsg = err?.detail || err?.message || "Registrasi gagal. Coba lagi.";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-background">
        <div className="orb" /><div className="orb" /><div className="orb" /><div className="orb" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-icon"><ShieldIcon /></div>
            <h1>PokusDuls</h1>
            <p>Buat akun baru</p>
          </div>
          <form className="login-form" onSubmit={handleRegister}>
            <div className="input-group">
              <span className="input-icon"><UserIcon /></span>
              <input id="input-username" type="text" placeholder="Username" value={username}
                onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="input-group">
              <span className="input-icon"><MailIcon /></span>
              <input id="input-email" type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="input-group">
              <span className="input-icon"><LockIcon /></span>
              <input id="input-password" type={showPassword ? "text" : "password"} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && (
              <>
                <div className="password-strength">
                  <div className={`bar ${passwordStrength.level >= 1 ? passwordStrength.level === 1 ? "weak" : passwordStrength.level === 2 ? "medium" : "strong" : ""}`} />
                  <div className={`bar ${passwordStrength.level >= 2 ? passwordStrength.level === 2 ? "medium" : "strong" : ""}`} />
                  <div className={`bar ${passwordStrength.level >= 3 ? "strong" : ""}`} />
                </div>
                <span className={`password-strength-text ${passwordStrength.level === 1 ? "weak" : passwordStrength.level === 2 ? "medium" : "strong"}`}>
                  Kekuatan password: {passwordStrength.label}
                </span>
              </>
            )}
            {message.text && (
              <div className={`login-message ${message.type}`}>{message.text}</div>
            )}
            <button id="btn-submit" type="submit" className="login-submit" disabled={loading}>
              <span>{loading ? <span className="spinner" /> : "Daftar"}</span>
            </button>
          </form>
          <div className="login-footer">
            <p>Sudah punya akun? <Link to="/">Masuk di sini</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
