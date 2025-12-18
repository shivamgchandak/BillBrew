import { useState } from "react";
import "../styles/upload-modal.scss";

export default function UploadStatementModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleUpload = () => {
    if (!file) return;

    // 🔴 Mock logic
    // Assume PDFs with "secure" in name need password
    if (file.name.toLowerCase().includes("secure")) {
      setNeedsPassword(true);
    } else {
      onSuccess();
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) return;
    onSuccess();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Upload Statement</h3>

        {!needsPassword ? (
          <>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button className="primary-btn" onClick={handleUpload}>
              Upload
            </button>
          </>
        ) : (
          <>
            <p>This PDF is password protected</p>

            <input
              type="password"
              placeholder="Enter PDF password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={handlePasswordSubmit}>
              Submit Password
            </button>
          </>
        )}

        <button className="link-btn cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}