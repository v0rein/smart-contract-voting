// ============================================
// VoteAction Component
// Form voting + transaction feedback + Delegasi
// ============================================

import { useState } from "react";
import { formatError } from "../utils/helpers";

export default function VoteAction({
  account,
  hasVoted,
  selectedCandidate,
  candidates,
  onVote,
  onDelegate,
  votingOpen,
  votingStartTime,
  votingEndTime,
  isRegistered,
  delegatedTo,
}) {
  const [txStatus, setTxStatus] = useState(null); // null | "pending" | "success" | "failed"
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateStatus, setDelegateStatus] = useState(null);
  const [delegateError, setDelegateError] = useState(null);

  // Check if voting is closed manually
  const isVotingClosedManually = !votingOpen;

  // Check time bounds
  const nowStr = Math.floor(Date.now() / 1000);
  const isBeforeStart = votingStartTime > 0n && nowStr < Number(votingStartTime);
  const isDeadlinePassed = votingEndTime > 0n && nowStr > Number(votingEndTime);

  const canVote = isRegistered && !hasVoted && !delegatedTo && !isVotingClosedManually && !isBeforeStart && !isDeadlinePassed;

  const handleVote = async () => {
    if (selectedCandidate === null) return;

    try {
      setTxStatus("pending");
      setError(null);
      setTxHash(null);

      const tx = await onVote(selectedCandidate);
      setTxHash(tx.hash);
      setTxStatus("success");

      setTimeout(() => {
        setTxStatus(null);
        setTxHash(null);
      }, 5000);
    } catch (err) {
      setTxStatus("failed");
      setError(formatError(err));
    }
  };

  const handleDelegate = async (e) => {
    e.preventDefault();
    if (!delegateAddress.trim()) return;

    try {
      setDelegateStatus("pending");
      setDelegateError(null);
      await onDelegate(delegateAddress.trim());
      setDelegateStatus("success");
      setDelegateAddress("");
      setTimeout(() => setDelegateStatus(null), 3000);
    } catch (err) {
      setDelegateStatus("failed");
      setDelegateError(formatError(err));
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
          Vote & Delegasi
        </h2>
        {!isRegistered && (
          <span className="badge badge-warning">Belum Terdaftar</span>
        )}
      </div>

      {!isRegistered ? (
        <div className="vote-status vote-closed">
          <div className="vote-status-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Akses Ditolak</h3>
          <p>Anda belum terdaftar (whitelist) sebagai voter. Hubungi admin.</p>
        </div>
      ) : delegatedTo ? (
        <div className="vote-status vote-done">
          <div className="vote-status-icon success">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Suara Didelegasikan</h3>
          <p>Anda telah mendelegasikan suara ke:<br/><strong>{delegatedTo}</strong></p>
        </div>
      ) : hasVoted ? (
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
      ) : isVotingClosedManually ? (
        <div className="vote-status vote-closed">
          <div className="vote-status-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>Voting Ditutup</h3>
          <p>Sesi voting sedang tidak aktif.</p>
        </div>
      ) : isBeforeStart ? (
        <div className="vote-status vote-closed">
          <div className="vote-status-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>Voting Belum Dimulai</h3>
          <p>Sesi voting belum memasuki jadwal.</p>
        </div>
      ) : isDeadlinePassed ? (
        <div className="vote-status vote-closed">
          <div className="vote-status-icon warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>Voting Selesai</h3>
          <p>Waktu voting sudah berakhir.</p>
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
            disabled={selectedCandidate === null || txStatus === "pending" || !canVote}
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

          <hr style={{ margin: "20px 0", borderColor: "var(--border-color)", opacity: 0.5 }} />

          {/* Delegate Form */}
          <div className="delegate-section">
            <h4 style={{ marginBottom: "10px" }}>Atau Delegasikan Suara Anda</h4>
            <form onSubmit={handleDelegate} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Address voter lain..."
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                className="input"
                style={{ flex: 1 }}
                disabled={delegateStatus === "pending" || !canVote}
              />
              <button
                type="submit"
                className="btn btn-outline"
                disabled={!delegateAddress || delegateStatus === "pending" || !canVote}
              >
                {delegateStatus === "pending" ? <span className="spinner spinner-sm"></span> : "Delegasi"}
              </button>
            </form>
            {delegateStatus === "success" && <div className="tx-feedback tx-success compact">Delegasi berhasil!</div>}
            {delegateStatus === "failed" && <div className="tx-feedback tx-failed compact">{delegateError}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
