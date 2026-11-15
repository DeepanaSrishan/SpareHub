import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Shield,
  X,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { getApiError } from "../../utils/getApiError";

function getHomeRoute(role) {
  const normalized = role?.replace(/^ROLE_/, "")?.toUpperCase();
  switch (normalized) {
    case "MANAGER":
      return "/manager/dashboard";
    case "SALES_STAFF":
      return "/sales/dashboard";
    case "INVENTORY_STAFF":
      return "/inventory/dashboard";
    default:
      return "/";
  }
}

export default function ShowroomAuthCard({ isOpen, onClose }) {
  const [form, setForm] = useState({
    email: localStorage.getItem("sparehub_remember_email") || "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("sparehub_remember_email"))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem("sparehub_remember_email", form.email.trim());
      } else {
        localStorage.removeItem("sparehub_remember_email");
      }

      const user = await login(form);
      const requestedPage = location.state?.from;
      navigate(requestedPage || getHomeRoute(user.role), { replace: true });
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Login failed. Please verify your email and password."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="showroom-auth-modal-overlay" onClick={onClose}>
        <motion.div
          className="showroom-auth-card"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="showroom-login-heading"
        >
          {/* Close button */}
          <button
            type="button"
            className="showroom-auth-close"
            onClick={onClose}
            aria-label="Close sign in dialog"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="showroom-auth-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "grid",
                  placeItems: "center",
                  color: "#10b981",
                }}
              >
                <CarFront size={18} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981", letterSpacing: "0.08em" }}>
                SPAREHUB ENTERPRISE
              </span>
            </div>
            <h2 id="showroom-login-heading">Sign In</h2>
            <p>Access your automotive inventory and ordering portal.</p>
          </div>

          {/* Success Message Banner */}
          {message && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: "0.84rem",
                marginBottom: "16px",
              }}
              role="status"
            >
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: "0.84rem",
                marginBottom: "16px",
              }}
              role="alert"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="showroom-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="showroom-input-group">
              <label className="showroom-input-label" htmlFor="showroom-email">
                Email Address
                {fieldErrors.email && (
                  <span style={{ color: "#f87171", fontSize: "0.76rem", marginLeft: "8px" }}>
                    {fieldErrors.email}
                  </span>
                )}
              </label>
              <div className="showroom-input-wrapper">
                <Mail size={18} className="showroom-input-icon" />
                <input
                  id="showroom-email"
                  type="email"
                  name="email"
                  className="showroom-input"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="showroom-input-group">
              <label className="showroom-input-label" htmlFor="showroom-password">
                Password
                {fieldErrors.password && (
                  <span style={{ color: "#f87171", fontSize: "0.76rem", marginLeft: "8px" }}>
                    {fieldErrors.password}
                  </span>
                )}
              </label>
              <div className="showroom-input-wrapper">
                <Lock size={18} className="showroom-input-icon" />
                <input
                  id="showroom-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="showroom-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={submitting}
                  style={{ paddingRight: "42px" }}
                  required
                />
                <button
                  type="button"
                  className="showroom-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                marginTop: "2px",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#94a3b8" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={submitting}
                  style={{ accentColor: "#38bdf8", cursor: "pointer" }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "#10b981",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="showroom-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="cinematic-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} style={{ marginLeft: "4px", opacity: 0.8 }} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer: Register Link */}
          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              fontSize: "0.84rem",
              color: "#94a3b8",
            }}
          >
            <span>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: "#10b981",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div
            className="showroom-auth-modal-overlay"
            style={{ zIndex: 60 }}
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              className="showroom-auth-card"
              style={{ width: "min(400px, 100%)" }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={20} style={{ color: "#10b981" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#10b981" }}>
                    SECURITY RECOVERY
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{ background: "transparent", border: 0, color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800 }}>
                Password Reset
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "#94a3b8", lineHeight: "1.5" }}>
                To reset your SpareHub account credentials, please email our administrative support at{" "}
                <strong style={{ color: "#10b981" }}>support@sparehub.lk</strong> with your verified enterprise email.
              </p>

              <button
                type="button"
                className="showroom-submit-btn"
                onClick={() => setShowForgotModal(false)}
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
