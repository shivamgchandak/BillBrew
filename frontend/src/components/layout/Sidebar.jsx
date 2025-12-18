import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/sidebar.scss";
import logo from "../../assets/logo.png";

const statements = [
  { id: 1, bank: "HDFC Bank", card: "XX57" },
  { id: 2, bank: "RBL Bank", card: "XX12" },
  { id: 3, bank: "HSBC", card: "XX88" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="logo" />
        <span>Credo</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <button
          className="sidebar__item"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        {/* Statements Dropdown */}
        <button
          className="sidebar__item"
          onClick={() => setOpen((prev) => !prev)}
        >
          Statements
        </button>

        {open && (
          <div className="sidebar__dropdown">
            {statements.map((s) => (
              <button
                key={s.id}
                className="sidebar__dropdown-item"
                onClick={() => navigate(`/statements/${s.id}`)}
              >
                {s.bank} • {s.card}
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}