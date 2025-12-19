import "../styles/statement.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getStatement } from "../features/statements/statementsSlice";

export default function Statement() {
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getStatement(id));
  }, [id]);

  const statement = useSelector((s) => s.statements.selected);
  if (!statement) return null;

  return (
    <div className="statement-layout">
      <Sidebar />

      <div className="statement-main">
        <Topbar />

        <div className="statement-content">
          <div className="statement-card">

            <div className="card-header">
              <h2>{statement.issuer} Bank</h2>
            </div>

            <span className="card-last">•••• {statement.cardIdentifier}</span>

            <div className="card-meta">
              <div>
                <span>Billing Period</span>
                <strong>{statement.billingCycle}</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>{statement.dueDate}</strong>
              </div>
            </div>

            <div className="card-amounts">
              <div className="amount-box">
                <span>Total Payable <strong>{statement.currency}</strong></span>
                <strong>{statement.totalAmount}</strong>
              </div>

              <div className="amount-box secondary">
                <span>Minimum Due <strong>{statement.currency}</strong></span>
                <strong>{statement.minimumAmount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}