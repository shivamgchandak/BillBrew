import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, FileText, ChevronRight, Search, CreditCard } from "lucide-react";
import "../styles/dashboard.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import UploadStatementModal from "../components/UploadStatementModal";
import { getStatements } from "../features/statements/statementsSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(getStatements());
  }, [dispatch]);

  const { list, loading } = useSelector((state) => state.statements);

  const filtered = list.filter((s) =>
    [s.issuer, s.cardIdentifier, s.currency, s.dueDate]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const totalDue = list.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const currency = list[0]?.currency || "";

  const fmt = (n) =>
    typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard__main">
        <Topbar />

        <div className="dashboard__content">
          <div className="dashboard__header">
            <div>
              <h2>Your statements</h2>
              <p>All the credit-card statements you've brewed so far.</p>
            </div>

            <button className="primary-btn" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Upload statement
            </button>
          </div>

          <div className="dashboard__stats">
            <div className="stat">
              <div className="stat__label">Statements</div>
              <div className="stat__value">{list.length}</div>
            </div>
            <div className="stat">
              <div className="stat__label"><CreditCard size={12} /> Cards tracked</div>
              <div className="stat__value">
                {new Set(list.map((s) => s.cardIdentifier).filter(Boolean)).size}
              </div>
            </div>
            <div className="stat stat--accent">
              <div className="stat__label">Total across all cards</div>
              <div className="stat__value">
                {currency && <span className="cur">{currency}</span>} {fmt(totalDue)}
              </div>
            </div>
          </div>

          <div className="dashboard__toolbar">
            <div className="dashboard__search">
              <Search size={14} />
              <input
                placeholder="Search issuer, card, currency…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard__table-card">
            <div className="dashboard__table-head">
              <span>#</span>
              <span>Issuer</span>
              <span>Card</span>
              <span>Due date</span>
              <span>Total due</span>
              <span></span>
            </div>

            {loading && (
              <div className="dashboard__empty">Loading…</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="dashboard__empty">
                <FileText size={22} />
                <p>No statements match your search.</p>
                <button className="secondary-btn" onClick={() => setShowModal(true)}>
                  <Plus size={14} /> Upload your first statement
                </button>
              </div>
            )}

            {filtered.map((s, i) => (
              <div
                className="dashboard__row"
                key={s._id}
                onClick={() => navigate(`/statements/${s._id}`)}
              >
                <span className="num">{i + 1}</span>
                <span className="issuer">
                  <span className="issuer__badge">
                    {(s.issuer || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    <strong>{s.issuer || "Unknown"}</strong>
                    {s.cardNetwork && <em>{s.cardNetwork}</em>}
                  </span>
                </span>
                <span className="card-chip">•••• {s.cardIdentifier || "----"}</span>
                <span>{s.dueDate || "—"}</span>
                <span>
                  {s.currency ? <em className="cur">{s.currency}</em> : null} {fmt(s.totalAmount)}
                </span>
                <ChevronRight size={16} className="row__chev" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <UploadStatementModal
          onClose={() => setShowModal(false)}
          onSuccess={(id) => {
            setShowModal(false);
            navigate(`/statements/${id}`);
          }}
        />
      )}
    </div>
  );
}
