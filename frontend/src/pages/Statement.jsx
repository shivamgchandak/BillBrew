import "../styles/statement.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  ArrowLeft, Calendar, CreditCard, ExternalLink, Trash2, Info,
} from "lucide-react";
import {
  getStatement, removeStatement,
} from "../features/statements/statementsSlice";

export default function Statement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getStatement(id));
  }, [id, dispatch]);

  const statement = useSelector((s) => s.statements.selected);
  if (!statement) return null;

  const fmt = (n) =>
    typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

  const handleDelete = async () => {
    if (!confirm("Delete this statement? This cannot be undone.")) return;
    await dispatch(removeStatement(id));
    navigate("/dashboard");
  };

  return (
    <div className="statement-layout">
      <Sidebar />

      <div className="statement-main">
        <Topbar />

        <div className="statement-content">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={14} /> Back to dashboard
          </button>

          <div className="statement-card">
            <div className="statement-card__head">
              <div className="issuer-block">
                <div className="issuer__badge lg">
                  {(statement.issuer || "?").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2>{statement.issuerFull || statement.issuer || "Unknown issuer"}</h2>
                  <p>
                    {statement.cardNetwork ? `${statement.cardNetwork} · ` : ""}
                    Card ending •••• {statement.cardIdentifier || "----"}
                  </p>
                </div>
              </div>

              <div className="statement-card__actions">
                {statement.pdfUrl && (
                  <a
                    className="ghost-btn"
                    href={statement.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={14} /> View PDF
                  </a>
                )}
                <button className="ghost-btn danger" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <div className="statement-grid">
              <MetaTile
                icon={<Calendar size={14} />}
                label="Billing period"
                value={statement.billingCycle}
              />
              <MetaTile
                icon={<Calendar size={14} />}
                label="Statement date"
                value={statement.statementDate}
              />
              <MetaTile
                icon={<Calendar size={14} />}
                label="Payment due date"
                value={statement.dueDate}
                accent
              />
              <MetaTile
                icon={<CreditCard size={14} />}
                label="Cardholder"
                value={statement.cardholderName}
              />
            </div>

            <div className="amount-grid">
              <AmountTile
                label="Total payable"
                currency={statement.currency}
                amount={statement.totalAmount}
                emphasis
              />
              <AmountTile
                label="Minimum due"
                currency={statement.currency}
                amount={statement.minimumAmount}
              />
              <AmountTile
                label="Credit limit"
                currency={statement.currency}
                amount={statement.creditLimit}
                muted
              />
              <AmountTile
                label="Available credit"
                currency={statement.currency}
                amount={statement.availableCredit}
                muted
              />
            </div>

            <div className="statement-note">
              <Info size={14} />
              Extracted automatically from your uploaded PDF. Always verify
              numbers against the original statement before making payments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function MetaTile({ icon, label, value, accent }) {
    return (
      <div className={`meta-tile ${accent ? "meta-tile--accent" : ""}`}>
        <div className="meta-tile__label">{icon} {label}</div>
        <div className="meta-tile__value">{value || "—"}</div>
      </div>
    );
  }

  function AmountTile({ label, currency, amount, emphasis, muted }) {
    return (
      <div className={`amount-tile ${emphasis ? "amount-tile--emp" : ""} ${muted ? "amount-tile--muted" : ""}`}>
        <div className="amount-tile__label">{label}</div>
        <div className="amount-tile__value">
          {currency && <span className="cur">{currency}</span>}{" "}
          {fmt(amount)}
        </div>
      </div>
    );
  }
}
