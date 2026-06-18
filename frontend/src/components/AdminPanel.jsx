// ============================================
// AdminPanel Component
// Panel admin: tambah kandidat, set deadline
// WRITE operations: addCandidate, setDeadline
// ============================================

import { useState } from "react";
import { formatError, formatTimestamp } from "../utils/helpers";

export default function AdminPanel({ isOwner, account, onAddCandidate, onSetDeadline, votingDeadline }) {
  const [candidateName, setCandidateName] = useState("");
  const [deadlineMinutes, setDeadlineMinutes] = useState("");

  const [addTxStatus, setAddTxStatus] = useState(null);
  const [addError, setAddError] = useState(null);

  const [deadlineTxStatus, setDeadlineTxStatus] = useState(null);
  const [deadlineError, setDeadlineError] = useState(null);

  if (!account || !isOwner) return null;

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    try {
      setAddTxStatus("pending");
      setAddError(null);
      await onAddCandidate(candidateName.trim());
      setAddTxStatus("success");
      setCandidateName("");
      setTimeout(() => setAddTxStatus(null), 3000);
    } catch (err) {
      setAddTxStatus("failed");
      setAddError(formatError(err));
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    const mins = parseInt(deadlineMinutes);
    if (isNaN(mins) || mins <= 0) return;

    try {
      setDeadlineTxStatus("pending");
      setDeadlineError(null);
      await onSetDeadline(mins);
      setDeadlineTxStatus("success");
      setDeadlineMinutes("");
      setTimeout(() => setDeadlineTxStatus(null), 3000);
    } catch (err) {
      setDeadlineTxStatus("failed");
      setDeadlineError(formatError(err));
    }
  };

  return (
    <div className="card admin-panel" id="admin-panel">
      <div className="card-header">
        <h2>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Admin Panel
        </h2>
        <span className="badge badge-admin">Owner</span>
      </div>

      <div className="admin-grid">
        {/* Add Candidate Form */}
        <div className="admin-section">
          <h3>Tambah Kandidat</h3>
          <form onSubmit={handleAddCandidate} className="admin-form">
            <div className="input-group">
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama kandidat..."
                className="input"
                disabled={addTxStatus === "pending"}
                id="input-candidate-name"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!candidateName.trim() || addTxStatus === "pending"}
                id="btn-add-candidate"
              >
                {addTxStatus === "pending" ? (
                  <span className="spinner spinner-sm"></span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
            </div>

            {addTxStatus === "success" && (
              <div className="tx-feedback tx-success compact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Kandidat berhasil ditambahkan!
              </div>
            )}
            {addTxStatus === "failed" && (
              <div className="tx-feedback tx-failed compact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {addError}
              </div>
            )}
          </form>
        </div>

        {/* Set Deadline Form */}
        <div className="admin-section">
          <h3>Set Deadline Voting</h3>
          <p className="admin-hint">
            Deadline saat ini: {formatTimestamp(votingDeadline)}
          </p>
          <form onSubmit={handleSetDeadline} className="admin-form">
            <div className="input-group">
              <input
                type="number"
                value={deadlineMinutes}
                onChange={(e) => setDeadlineMinutes(e.target.value)}
                placeholder="Durasi (menit)..."
                className="input"
                min="1"
                disabled={deadlineTxStatus === "pending"}
                id="input-deadline-minutes"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!deadlineMinutes || parseInt(deadlineMinutes) <= 0 || deadlineTxStatus === "pending"}
                id="btn-set-deadline"
              >
                {deadlineTxStatus === "pending" ? (
                  <span className="spinner spinner-sm"></span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </button>
            </div>

            {deadlineTxStatus === "success" && (
              <div className="tx-feedback tx-success compact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Deadline berhasil diatur!
              </div>
            )}
            {deadlineTxStatus === "failed" && (
              <div className="tx-feedback tx-failed compact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {deadlineError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
