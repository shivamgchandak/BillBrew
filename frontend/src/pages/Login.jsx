import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import "../styles/auth.scss";
import logo from "../assets/logo.svg";
import { login } from "../api";
import { authSuccess } from "../features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await login(formData);
      dispatch(
        authSuccess({
          user: { id: data._id, name: data.name, email: data.email },
          token: data.token,
        })
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <Link to="/" className="auth__brand">
          <img src={logo} alt="BillBrew" />
          <span><b>Bill</b>Brew</span>
        </Link>

        <h2 className="auth__title">Welcome back</h2>
        <p className="auth__subtitle">Sign in to keep brewing your statements.</p>

        <form onSubmit={handleSubmit} className="auth__form">
          {error && <div className="auth__error">{error}</div>}

          <div className="auth__field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth__field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="auth__btn" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth__footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
