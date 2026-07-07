import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, FileText, ChevronDown } from "lucide-react";
import { getStatements } from "../../features/statements/statementsSlice";
import "../../styles/sidebar.scss";
import logo from "../../assets/logo.svg";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { list: statements, loading } = useSelector(
    (state) => state.statements
  );

  useEffect(() => {
    dispatch(getStatements());
  }, [dispatch]);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="BillBrew" />
        <span><b>Bill</b>Brew</span>
      </div>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__item ${isActive("/dashboard") ? "is-active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button
          className="sidebar__item sidebar__item--toggle"
          onClick={() => setOpen((prev) => !prev)}
        >
          <FileText size={16} />
          <span>Statements</span>
          <ChevronDown
            size={14}
            className={open ? "chev open" : "chev"}
          />
        </button>

        {open && (
          <div className="sidebar__dropdown">
            {loading && (
              <div className="sidebar__dropdown-item muted">Loading…</div>
            )}

            {!loading && statements.length === 0 && (
              <div className="sidebar__dropdown-item muted">
                No statements yet
              </div>
            )}

            {!loading &&
              statements.map((s) => (
                <button
                  key={s._id}
                  className={`sidebar__dropdown-item ${
                    location.pathname === `/statements/${s._id}` ? "is-active" : ""
                  }`}
                  onClick={() => navigate(`/statements/${s._id}`)}
                >
                  <span className="dot" />
                  {s.issuer || "Unknown"} • {s.cardIdentifier || "XXXX"}
                </button>
              ))}
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <small>BillBrew · v1.0</small>
      </div>
    </aside>
  );
}
