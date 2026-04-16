import { useState, useCallback } from "react";
import { loginUser, registerUser } from "../api/user";
import "../App.css";

// Simple SVG icons as components (no imports needed)
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

// Password strength calculator
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

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const clearMessage = () => {
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const resetForm = useCallback(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMessage({ text: "", type: "" });
    resetForm();
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
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
        text: res.message || "Registrasi berhasil! Silakan login.",
        type: "success",
      });
      clearMessage();
      // Switch to login tab after successful registration
      setTimeout(() => {
        setActiveTab("login");
        setEmail("");
      }, 2000);
    } catch (err) {
      setMessage({
        text: err?.detail || err?.message || "Terjadi kesalahan saat registrasi",
        type: "error",
      });
      clearMessage();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setMessage({ text: "Username tidak boleh kosong", type: "error" });
      return;
    }
    if (!password.trim()) {
      setMessage({ text: "Password tidak boleh kosong", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await loginUser({ username, password });
      setMessage({
        text: res.message || "Login berhasil! Selamat datang.",
        type: "success",
      });
      clearMessage();
    } catch (err) {
      setMessage({
        text: err?.detail || err?.message || "Username atau password salah",
        type: "error",
      });
      clearMessage();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated background orbs */}
      <div className="login-background">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Brand section */}
          <div className="login-brand">
            <div className="brand-icon">
              <ShieldIcon />
            </div>
            <h1>PokusDuls</h1>
            <p>
              {activeTab === "login"
                ? "Masuk ke akun Anda"
                : "Buat akun baru"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="login-tabs">
            <button
              id="tab-login"
              className={activeTab === "login" ? "active" : ""}
              onClick={() => handleTabSwitch("login")}
              type="button"
            >
              Masuk
            </button>
            <button
              id="tab-register"
              className={activeTab === "register" ? "active" : ""}
              onClick={() => handleTabSwitch("register")}
              type="button"
            >
              Daftar
            </button>
          </div>

          {/* Form */}
          <form
            className="login-form"
            onSubmit={activeTab === "login" ? handleLogin : handleRegister}
          >
            {/* Username */}
            <div className="input-group">
              <span className="input-icon">
                <UserIcon />
              </span>
              <input
                id="input-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Email (register only) */}
            {activeTab === "register" && (
              <div className="input-group" style={{ animation: "messageSlide 0.3s ease" }}>
                <span className="input-icon">
                  <MailIcon />
                </span>
                <input
                  id="input-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password */}
            <div className="input-group">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                id="input-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password strength (register only) */}
            {activeTab === "register" && password && (
              <>
                <div className="password-strength">
                  <div
                    className={`bar ${passwordStrength.level >= 1 ? (passwordStrength.level === 1 ? "weak" : passwordStrength.level === 2 ? "medium" : "strong") : ""}`}
                  />
                  <div
                    className={`bar ${passwordStrength.level >= 2 ? (passwordStrength.level === 2 ? "medium" : "strong") : ""}`}
                  />
                  <div
                    className={`bar ${passwordStrength.level >= 3 ? "strong" : ""}`}
                  />
                </div>
                <span
                  className={`password-strength-text ${passwordStrength.level === 1 ? "weak" : passwordStrength.level === 2 ? "medium" : "strong"}`}
                >
                  Kekuatan password: {passwordStrength.label}
                </span>
              </>
            )}

            {/* Message feedback */}
            {message.text && (
              <div className={`login-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Submit button */}
            <button
              id="btn-submit"
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading ? (
                  <span className="spinner" />
                ) : activeTab === "login" ? (
                  "Masuk"
                ) : (
                  "Daftar"
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            {activeTab === "login" ? (
              <p>
                Belum punya akun?{" "}
                <a onClick={() => handleTabSwitch("register")}>Daftar di sini</a>
              </p>
            ) : (
              <p>
                Sudah punya akun?{" "}
                <a onClick={() => handleTabSwitch("login")}>Masuk di sini</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}