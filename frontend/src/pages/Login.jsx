import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.scss";
import { useDispatch } from "react-redux";
import { login } from "../api";
import { authSuccess } from "../features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      dispatch(
        authSuccess({
          user: {
            id: data._id,
            name: data.name,
            email: data.email,
          },
          token: data.token,
        })
      );
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
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

        <div>
            <p>Demo credentials for assignment output</p>
            <p>Email: <code>test@gmail.com</code></p>
            <p>Password: <code>test1234</code></p>
        </div>

      </div>
    </div>
  );
}