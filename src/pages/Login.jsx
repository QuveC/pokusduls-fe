import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/user";
import "../App.css";

const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LogoIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setMessage({ text: "Username atau email tidak boleh kosong", type: "error" });
      return;
    }
    if (!password.trim()) {
      setMessage({ text: "Password tidak boleh kosong", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await loginUser({ username: identifier, password });
      localStorage.setItem("pokus-token", res.token);
      localStorage.setItem("pokus-user-id", res.user_id);
      setMessage({ text: res.message || "Login berhasil! Selamat datang.", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const errMsg = err?.detail || err?.message || "Login gagal. Periksa username dan password.";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {}
      <div className="auth-bg">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>

      <div className="auth-layout">
        <div className="auth-card">

          {}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <LogoIcon />
            </div>
            <h1>PokusDuls</h1>
            <p>Masuk untuk melanjutkan belajar</p>
          </div>

          {}
          <form className="auth-form" onSubmit={handleLogin}>

            {}
            <div className="auth-field">
              <label className="auth-field-label">Username atau Email</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  id="input-identifier"
                  type="text"
                  placeholder="Username atau email..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {}
            <div className="auth-field">
              <label className="auth-field-label">Password</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {}
            {message.text && (
              <div className={`auth-alert ${message.type}`}>
                {message.type === "success" ? <CheckIcon /> : <AlertIcon />}
                <span>{message.text}</span>
              </div>
            )}

            {}
            <button
              id="btn-submit"
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              <span>
                {loading ? <span className="auth-spinner" /> : "Masuk"}
              </span>
            </button>
          </form>

          {}
          <div className="auth-divider">atau</div>

          {}
          <div className="auth-footer">
            <p>Belum punya akun? <Link to="/register">Daftar di sini</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
