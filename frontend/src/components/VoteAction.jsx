// ============================================
// VoteAction Component
// Form voting + transaction feedback
// WRITE operation: vote(candidateId)
// ============================================

import { useState } from "react";
import { formatError } from "../utils/helpers";

export default function VoteAction({
  account,
  hasVoted,
  selectedCandidate,
  candidates,
  onVote,
  votingDeadline,
}) {
  const [txStatus, setTxStatus] = useState(null); // null | "pending" | "success" | "failed"
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Check if voting is closed
  const isDeadlinePassed =
    votingDeadline && votingDeadline !== 0n && Number(votingDeadline) * 1000 < Date.now();

  const handleVote = async () => {
    if (selectedCandidate === null) return;

    try {
      setTxStatus("pending");
      setError(null);
      setTxHash(null);

      const tx = await onVote(selectedCandidate);
      setTxHash(tx.hash);
      setTxStatus("success");

      // Auto-clear success after 5 seconds
      setTimeout(() => {
        setTxStatus(null);
        setTxHash(null);
      }, 5000);
    } catch (err) {
      setTxStatus("failed");
      setError(formatError(err));
    }
  };

  const selectedCandidateName =
    selectedCandidate !== null ? candidates.find((c) => c.id === selectedCandidate)?.name : null;

  if (!account) {
    return (
      <div className="card" id="vote-action">
        <div className="card-header">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 10l3 3 7-7" />
            </svg>
            Vote
          </h2>
        </div>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <circle cx="18" cy="16" r="1" />
          </svg>
          <p>Connect wallet terlebih dahulu untuk melakukan voting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" id="vote-action">
      <div className="card-header">
        <h2>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 10l3 3 7-7" />
          </svg>
          Vote
        </h2>
      </div>

      {hasVoted ? (
        <div className="vote-status vote-done">
          <div className="vote-status-icon success">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3>Anda Sudah Voting!</h3>
          <p>Terima kasih, suara Anda sudah tercatat di blockchain.</p>
        </div>
      ) : isDeadlinePassed ? (
        <div className="vote-status vote-closed">
          <div className="vote-status-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>Voting Ditutup</h3>
          <p>Deadline voting sudah terlewat.</p>
        </div>
      ) : (
        <div className="vote-form">
          <div className="vote-selection">
            {selectedCandidate !== null ? (
              <p className="selected-text">
                Kandidat terpilih: <strong>{selectedCandidateName}</strong>
              </p>
            ) : (
              <p className="hint-text">Klik kandidat di atas untuk memilih</p>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg btn-glow btn-full"
            onClick={handleVote}
            disabled={selectedCandidate === null || txStatus === "pending"}
            id="btn-vote"
          >
            {txStatus === "pending" ? (
              <>
                <span className="spinner"></span>
                Memproses Transaksi...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                Kirim Vote
              </>
            )}
          </button>

          {/* Transaction Feedback */}
          {txStatus === "success" && (
            <div className="tx-feedback tx-success" id="tx-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <strong>Vote Berhasil!</strong>
                {txHash && <p className="tx-hash">TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>}
              </div>
            </div>
          )}

          {txStatus === "failed" && (
            <div className="tx-feedback tx-failed" id="tx-failed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <div>
                <strong>Vote Gagal</strong>
                <p>{error}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setTxStatus(null); setError(null); }}>
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
