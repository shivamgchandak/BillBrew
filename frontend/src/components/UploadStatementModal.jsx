import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, Lock } from "lucide-react";
import "../styles/upload-modal.scss";
import { uploadStatement } from "../api";

/**
 * Upload flow:
 *   1. User picks a PDF (drag/drop or file input).
 *   2. Click "Brew statement" → POST /statements/upload.
 *   3. If the server responds 423 PDF_PASSWORD_REQUIRED, we reveal a
 *      password input and retry with the password attached.
 */
export default function UploadStatementModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const pickFile = (f) => {
    setError("");
    setNeedsPassword(false);
    setPassword("");
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("PDF must be smaller than 10 MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleUpload = async () => {
    if (!file || loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await uploadStatement(file, password || undefined);
      onSuccess(data._id);
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message;
      if (code === "PDF_PASSWORD_REQUIRED") {
        setNeedsPassword(true);
        setError("This PDF is password-protected. Enter the password to continue.");
      } else if (code === "PDF_PASSWORD_INCORRECT") {
        setNeedsPassword(true);
        setError("Incorrect password. Please try again.");
      } else {
        setError(msg || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const prettySize = file
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Upload a statement</h3>
          <button className="modal__close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>
        <p className="modal__sub">
          Drop a PDF from any bank — we'll brew it into clean data.
        </p>

        {!file ? (
          <label
            className={`dropzone ${dragOver ? "is-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="dropzone__icon">
              <UploadCloud size={28} />
            </div>
            <div className="dropzone__title">Drop PDF here</div>
            <div className="dropzone__hint">
              or <span>browse</span> · max 10&nbsp;MB
            </div>
          </label>
        ) : (
          <div className="filecard">
            <div className="filecard__icon"><FileText size={20} /></div>
            <div className="filecard__meta">
              <div className="filecard__name">{file.name}</div>
              <div className="filecard__sub">{prettySize} · PDF</div>
            </div>
            <button
              className="filecard__x"
              onClick={() => { setFile(null); setNeedsPassword(false); setPassword(""); setError(""); }}
              disabled={loading}
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {needsPassword && (
          <div className="pwdrow">
            <label>
              <Lock size={14} /> PDF password
            </label>
            <input
              type="password"
              value={password}
              autoFocus
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUpload(); }}
              disabled={loading}
            />
          </div>
        )}

        {error && <div className="modal__error">{error}</div>}

        <div className="modal__actions">
          <button className="ghost-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={handleUpload}
            disabled={!file || loading || (needsPassword && !password)}
          >
            {loading ? "Brewing…" : needsPassword ? "Unlock & brew" : "Brew statement"}
          </button>
        </div>
      </div>
    </div>
  );
}
