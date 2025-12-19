import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.scss";
import { signup } from "../api";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate("/login");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <h2 className="auth__title">Create Account</h2>
        <p className="auth__subtitle">
          Create your Credo account to manage your statements
        </p>

        <form onSubmit={handleSubmit} className="auth__form">
          <div className="auth__field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Shivam Chandak"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

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
            Create Account
          </button>
        </form>

        <p className="auth__footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}