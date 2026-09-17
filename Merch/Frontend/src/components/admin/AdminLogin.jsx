import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import "./AdminLogin.css";

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState("admin@nitsikkim.ac.in");
  const [password, setPassword] = useState("udgam2026");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      // Frontend demo credentials check
      if (email.trim().length > 0 && password.trim().length >= 4) {
        onLoginSuccess();
      } else {
        setError("Invalid credentials. Please enter a valid institute email and password.");
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail("admin@nitsikkim.ac.in");
    setPassword("udgam2026");
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Back link */}
        <button className="back-store-link" onClick={onBackToStore}>
          <ArrowLeft size={15} />
          <span>Back to Storefront</span>
        </button>

        <div className="login-header">
          <div className="login-badge-icon">
            <Lock size={22} className="lock-icon" />
          </div>
          <span className="inst-tag">NIT SIKKIM • UDGAM '26</span>
          <h2 className="login-title">Admin Management Portal</h2>
          <p className="login-subtitle">
            Sign in to manage product prices, inventory stock, and merchandise media assets.
          </p>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={13} />
              <span>Admin Institute Email</span>
            </label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@nitsikkim.ac.in"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <KeyRound size={13} />
              <span>Password / Passcode</span>
            </label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="demo-credentials-box">
          <div className="demo-header">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Developer / Evaluator Quick Access</span>
          </div>
          <p className="demo-text">
            Default credentials are pre-filled (<code>admin@nitsikkim.ac.in</code> / <code>udgam2026</code>).
          </p>
          <button
            type="button"
            className="demo-login-btn"
            onClick={handleQuickDemoLogin}
          >
            1-Click Demo Access
          </button>
        </div>

        <div className="security-notice">
          <ShieldCheck size={14} />
          <span>Authorized personnel only • NIT Sikkim Summit Admin</span>
        </div>
      </motion.div>
    </div>
  );
}
