import "../styles/statement.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const formatAmount = (amount) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function Statement() {
  return (
    <div className="statement-layout">
      <Sidebar />

      <div className="statement-main">
        <Topbar />

        <div className="statement-content">
          <div className="statement-card">
            {/* Top */}
            <div className="card-header">
              <h2>HDFC Bank</h2>
              <span className="card-last">•••• 6628</span>
            </div>

            <p className="card-holder">Shivam Chandak</p>

            {/* Meta */}
            <div className="card-meta">
              <div>
                <span>Billing Period</span>
                <strong>18 Oct 2025 – 19 Nov 2025</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>07 Dec 2025</strong>
              </div>
            </div>

            {/* Amounts */}
            <div className="card-amounts">
              <div className="amount-box">
                <span>Total Payable</span>
                <strong>{formatAmount(24626)}</strong>
              </div>

              <div className="amount-box secondary">
                <span>Minimum Due</span>
                <strong>{formatAmount(1240)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}