import { Link } from "react-router-dom";
import {
  Lock, Sparkles, Globe2, FileText, ShieldCheck, Search,
} from "lucide-react";
import "../styles/home.scss";
import logo from "../assets/logo.svg";

export default function Home() {
  return (
    <section className="home">
      <nav className="home__navbar">
        <Link to="/" className="home__brand">
          <img src={logo} alt="BillBrew logo" />
          <span className="home__brand-name">
            <span>Bill</span>Brew
          </span>
        </Link>

        <Link to="/login" className="home__nav-btn">
          Get started
        </Link>
      </nav>

      <div className="home__container">
        <div>
          <span className="home__badge">
            <Sparkles size={14} /> Credit card statements, brewed clean
          </span>

          <h1 className="home__title">
            One upload.<br />
            <span>All the details.</span>
          </h1>

          <p className="home__subtitle">
            Upload any bank statement — from HDFC to Chase to Emirates NBD —
            and BillBrew instantly extracts the issuer, dates, amounts and
            balances. Password-protected PDFs? No problem.
          </p>

          <div className="home__actions">
            <Link to="/signup" className="primary-btn">
              Create free account
            </Link>
            <Link to="/login" className="secondary-btn">
              Sign in
            </Link>
          </div>

          <p className="home__banks">
            Works with any issuer worldwide · INR, USD, AED, EUR, GBP…
          </p>

          <div className="home__features">
            <div className="home__feature">
              <div className="icon"><Globe2 size={20} /></div>
              <h3>Any bank, any currency</h3>
              <p>
                Not limited to a hard-coded list — statements from any issuer
                and any currency are parsed into the same clean shape.
              </p>
            </div>
            <div className="home__feature">
              <div className="icon"><Lock size={20} /></div>
              <h3>Password-protected PDFs</h3>
              <p>
                Encrypted statement? BillBrew detects it and prompts for the
                password in-flow — no manual decryption needed.
              </p>
            </div>
            <div className="home__feature">
              <div className="icon"><FileText size={20} /></div>
              <h3>All your statements in one place</h3>
              <p>
                Every parsed statement is saved to your dashboard with a
                one-click link back to the original PDF.
              </p>
            </div>
            <div className="home__feature">
              <div className="icon"><Sparkles size={20} /></div>
              <h3>Structured output</h3>
              <p>
                Issuer, network, cycle, due date, totals, minimum, credit
                limit — ready for your dashboards or workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
