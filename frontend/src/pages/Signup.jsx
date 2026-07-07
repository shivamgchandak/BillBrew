import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import "../styles/auth.scss";
import logo from "../assets/logo.svg";
import {
  requestSignupOtp,
  verifySignupOtp,
  resendSignupOtp,
} from "../api";
import { authSuccess } from "../features/auth/authSlice";

/**
 * Two-step signup:
 *   1. Collect name/email/password → POST /signup/request-otp
 *   2. Enter 6-digit code from email → POST /signup/verify-otp
 */
export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await requestSignupOtp(form);
      setStep("otp");
      setInfo(`We sent a 6-digit code to ${form.email}.`);
      setCooldown(30);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  const changeOtp = (i, v) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const keyOtp = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const pasteOtp = (e) => {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const arr = Array(6).fill("");
    text.split("").forEach((d, i) => (arr[i] = d));
    setOtp(arr);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setBusy(true);
    try {
      const { data } = await verifySignupOtp({ email: form.email, code });
      dispatch(
        authSuccess({
          user: { id: data._id, name: data.name, email: data.email },
          token: data.token,
        })
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      await resendSignupOtp({ email: form.email });
      setInfo("A new code is on its way.");
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend");
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <Link to="/" className="auth__brand">
          <img src={logo} alt="BillBrew" />
          <span><b>Bill</b>Brew</span>
        </Link>

        {step === "form" ? (
          <>
            <h2 className="auth__title">Create your account</h2>
            <p className="auth__subtitle">
              Start brewing clean statement data in under a minute.
            </p>

            <form onSubmit={submitForm} className="auth__form">
              {error && <div className="auth__error">{error}</div>}

              <div className="auth__field">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Shivam Chandak"
                  required
                  value={form.name}
                  onChange={change}
                />
              </div>

              <div className="auth__field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={change}
                />
              </div>

              <div className="auth__field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={change}
                />
              </div>

              <button className="auth__btn" disabled={busy}>
                {busy ? "Sending code…" : "Send verification code"}
              </button>
            </form>

            <p className="auth__footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth__title">Verify your email</h2>
            <p className="auth__subtitle">
              Enter the 6-digit code we sent to <strong>{form.email}</strong>.
            </p>

            <form onSubmit={submitOtp} className="auth__form">
              {info && <div className="auth__info">{info}</div>}
              {error && <div className="auth__error">{error}</div>}

              <div className="otp__group" onPaste={pasteOtp}>
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={v}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(e) => changeOtp(i, e.target.value)}
                    onKeyDown={(e) => keyOtp(i, e)}
                  />
                ))}
              </div>

              <div className="otp__meta">
                <span>Code expires in 10 minutes</span>
                <button
                  type="button"
                  onClick={resend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>

              <button className="auth__btn" disabled={busy}>
                {busy ? "Verifying…" : "Verify & create account"}
              </button>

              <button
                type="button"
                className="link-btn"
                style={{ alignSelf: "center" }}
                onClick={() => { setStep("form"); setError(""); setInfo(""); }}
              >
                ← Change email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
