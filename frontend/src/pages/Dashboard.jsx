import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/dashboard.scss";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import UploadStatementModal from "../components/UploadStatementModal";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStatements } from "../features/statements/statementsSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getStatements());
  }, [dispatch]);

const { list } = useSelector((state) => state.statements);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard__main">
        <Topbar />

        <div className="dashboard__content">

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

          <div className="dashboard__table-card">
            <div className="dashboard__table">
              <div className="dashboard__table-head">
                <span>Sr. No</span>
                <span>Card Company</span>
                <span>Card No.</span>
                <span>Action</span>
              </div>

              {list.map((s, index) => (
                <div className="dashboard__row" key={s._id}>
                  <span>{index + 1}</span>
                  <span>{s.issuer}</span>
                  <span className="card-chip">{s.cardIdentifier}</span>
                  <button
                className="link-btn"
                onClick={() => navigate(`/statements/${s._id}`)}
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
          onSuccess={(id) => {
            setShowModal(false);
            navigate(`/statements/${id}`);
          }}
        />
      )}
    </div>
  );
}