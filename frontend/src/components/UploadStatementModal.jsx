import { useState } from "react";
import "../styles/upload-modal.scss";
import { uploadStatement } from "../api";

export default function UploadStatementModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || loading) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const { data } = await uploadStatement(formData);
      onSuccess(data._id);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Upload Statement</h3>

        <input
          type="file"
          accept="application/pdf"
          disabled={loading}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="primary-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "Uploading…" : "Upload"}
        </button>

        <button
          className="link-btn cancel"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}