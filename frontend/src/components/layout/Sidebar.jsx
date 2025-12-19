import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStatements } from "../../features/statements/statementsSlice";
import "../../styles/sidebar.scss";
import logo from "../../assets/logo.png";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { list: statements, loading } = useSelector(
    (state) => state.statements
  );

  useEffect(() => {
    dispatch(getStatements());
  }, [dispatch]);

  return (
    <aside className="sidebar">

      <div className="sidebar__brand" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="logo" />
        <span>Credo</span>
      </div>

      <nav className="sidebar__nav">
        <button
          className="sidebar__item"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        <button
          className="sidebar__item"
          onClick={() => setOpen((prev) => !prev)}
        >
          Statements
        </button>

        {open && (
          <div className="sidebar__dropdown">
            {loading && (
              <div className="sidebar__dropdown-item">Loading...</div>
            )}

            {!loading && statements.length === 0 && (
              <div className="sidebar__dropdown-item">
                No statements found
              </div>
            )}

            {!loading &&
              statements.map((s) => (
                <button
                  key={s._id}
                  className="sidebar__dropdown-item"
                  onClick={() => navigate(`/statements/${s._id}`)}
                >
                  {s.issuer || "Unknown"} • {s.cardIdentifier || "XXXX"}
                </button>
              ))}
          </div>
        )}
      </nav>
    </aside>
  );
}