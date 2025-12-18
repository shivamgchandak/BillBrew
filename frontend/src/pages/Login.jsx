import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.scss";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: connect backend auth later
    console.log("Login data:", formData);

    // Temporary success redirect
    navigate("/dashboard");
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <h2 className="auth__title">Login</h2>
        <p className="auth__subtitle">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="auth__form">
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

          <button type="submit" className="auth__btn">
            Login
          </button>
        </form>

        <p className="auth__footer">
          Don’t have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}