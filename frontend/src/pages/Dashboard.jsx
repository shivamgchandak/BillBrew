import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/dashboard.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import UploadStatementModal from "../components/UploadStatementModal";

const statements = [
  {
    id: 1,
    person: "Shivam Chandak",
    bank: "HDFC Bank",
    card: "XX57",
  },
  {
    id: 2,
    person: "Shivam Chandak",
    bank: "RBL Bank",
    card: "XX12",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard__main">
        <Topbar />

        <div className="dashboard__content">
          {/* Header */}
          <div className="dashboard__header">
            <div>
              <h2>Statements</h2>
              <p>Manage your uploaded credit card statements</p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowModal(true)}
            >
              + Upload Statement
            </button>
          </div>

          {/* Table Card */}
          <div className="dashboard__table-card">
            <div className="dashboard__table">
              <div className="dashboard__table-head">
                <span>Sr. No</span>
                <span>Person Name</span>
                <span>Card Company</span>
                <span>Card No.</span>
                <span>Action</span>
              </div>

              {statements.map((s, index) => (
                <div className="dashboard__row" key={s.id}>
                  <span>{index + 1}</span>
                  <span>{s.person}</span>
                  <span>{s.bank}</span>
                  <span className="card-chip">{s.card}</span>
                  <button
                    className="link-btn"
                    onClick={() => navigate(`/statements/${s.id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <UploadStatementModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            navigate("/statements/1"); // mock redirect
          }}
        />
      )}
    </div>
  );
}