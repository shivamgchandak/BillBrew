import { Link } from "react-router-dom";
import "../styles/home.scss";
import logo from "../assets/logo.png";
import hero from "../assets/hero.png";

export default function Home() {
  return (
    <section className="home">

      {/* Navbar */}
      <nav className="home__navbar">
        <Link to="/" className="home__brand">
          <img src={logo} alt="Credo Logo" className="home__logo" />
          <span className="home__brand-name">Credo</span>
        </Link>

        <Link to="/login" className="home__nav-btn">
          Get Started
        </Link>
      </nav>

      {/* Main Content */}
      <div className="home__container">
        <div className="home__content">
          <span className="home__badge">Introducing Credo</span>

          <h1 className="home__title">
            Credit card statements,
            <br />
            <span>made simple.</span>
          </h1>

          <div>
            <img className="home__image" src={hero} alt="Credo preview" />
          </div>

          <div className="home__actions">
            <Link to="/login" className="primary-btn">
              Login
            </Link>
            <Link to="/signup" className="secondary-btn">
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}