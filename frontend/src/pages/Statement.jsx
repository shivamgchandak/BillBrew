import "../styles/statement.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ExternalLink, Trash2, Info, RotateCw, Paperclip, Wifi,
} from "lucide-react";
import {
  getStatement, removeStatement,
} from "../features/statements/statementsSlice";

export default function Statement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    dispatch(getStatement(id));
  }, [id, dispatch]);

  const statement = useSelector((s) => s.statements.selected);
  if (!statement) return null;

  const fmt = (n) =>
    typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";

  const fmtDateTime = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const cur = statement.currency || "INR";
  const digits = statement.cardLast4 || statement.cardLast2 || "----";
  const bank = statement.issuerFull || statement.issuer || "Unknown Bank";
  const holder = statement.cardholderName || "Cardholder";

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

          {/* ---- Credit card ---- */}
          <div className="cardstage">
            <div
              className={`ccard ${flipped ? "is-flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
            >
              {/* Front */}
              <div className="ccard__face ccard__front">
                <div className="ccard__top">
                  <span className="ccard__digits">•••• {digits}</span>
                  <span className="ccard__bank">{bank}</span>
                </div>

                <div className="ccard__mid">
                  <div className="ccard__chiprow">
                    <div className="ccard__chip" />
                    <Wifi className="ccard__wave" size={18} />
                  </div>
                  <div className="ccard__name">{holder}</div>
                </div>

                <div className="ccard__bottom">
                  <div className="ccard__cell">
                    <label>Due date</label>
                    <span>{statement.dueDate || "—"}</span>
                  </div>
                  <div className="ccard__cell ccard__cell--center">
                    <label>Billing period</label>
                    <span>{statement.billingCycle || "—"}</span>
                  </div>
                  <div className="ccard__cell ccard__cell--right">
                    <label>Statement due</label>
                    <span><span className="cur">{cur}</span>{fmt(statement.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div className="ccard__face ccard__back">
                <div className="ccard__stripe" />
                <div className="ccard__backbody">
                  <div className="ccard__backtitle">Statement summary</div>

                  <div className="ccard__backgrid">
                    <BCell label="Minimum due" value={fmt(statement.minimumAmount)} cur={cur} />
                    <BCell label="Credit limit" value={fmt(statement.creditLimit)} cur={cur} />
                    <BCell label="Available credit" value={fmt(statement.availableCredit)} cur={cur} />
                    <BCell label="Statement date" value={statement.statementDate || "—"} />
                    <BCell
                      label="Added to BillBrew"
                      value={fmtDateTime(statement.uploadedAt || statement.createdAt)}
                    />
                  </div>

                  <div className="ccard__actions">
                    {statement.pdfUrl ? (
                      <a
                        className="ccard__attach"
                        href={statement.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Paperclip size={14} /> View statement.pdf
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <div className="ccard__attach is-empty">
                        <Paperclip size={14} /> No file attached
                      </div>
                    )}

                    <button
                      className="ccard__delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flip-row">
              <button
                className={`flip-btn ${flipped ? "is-flipped" : ""}`}
                onClick={() => setFlipped((f) => !f)}
              >
                <RotateCw size={14} />
                {flipped ? "Show card front" : "Flip for statement details"}
              </button>
            </div>
          </div>

          <div className="statement-note">
            <Info size={14} />
            Extracted automatically from your uploaded PDF. Always verify
            numbers against the original statement before making payments.
          </div>
        </div>
      </div>
    </div>
  );

  function BCell({ label, value, cur }) {
    return (
      <div className="ccard__bcell">
        <label>{label}</label>
        <span>{cur && value !== "—" && <span className="cur">{cur}</span>}{value}</span>
      </div>
    );
  }
}
