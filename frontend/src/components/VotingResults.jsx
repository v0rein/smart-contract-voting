// ============================================
// VotingResults Component
// Visualisasi hasil voting + winner + statistik
// ============================================

import { getCandidateColor, getTimeRemaining, formatTimestamp } from "../utils/helpers";
import { useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";

export default function VotingResults({
  candidates,
  totalVoters,
  minimumQuorum,
  winner,
  votingOpen,
  votingStartTime,
  votingEndTime,
  registeredVotersCount,
  voteHistory,
  isLoading,
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(votingEndTime));
  const [showHistory, setShowHistory] = useState(false);

  // Countdown timer for end time
  useEffect(() => {
    if (!votingEndTime || votingEndTime === 0n) return;

    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(votingEndTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndTime]);

  const quorumReached = totalVoters >= minimumQuorum;
  const quorumPercentage = minimumQuorum > 0 ? Math.min((totalVoters / minimumQuorum) * 100, 100) : 0;

  // Cek waktu
  const nowStr = Math.floor(Date.now() / 1000);
  const isBeforeStart = votingStartTime > 0n && nowStr < Number(votingStartTime);
  const isDeadlinePassed = votingEndTime > 0n && nowStr > Number(votingEndTime);

  // Hitung total semua vote untuk percentage (bukan berdasarkan jumlah voter, melainkan akumulasi bobot)
  const totalVotesCount = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div className="results-section" id="voting-results">
      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {isLoading ? (
          <SkeletonLoader type="stat" count={4} />
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{totalVoters} / {registeredVotersCount}</span>
                <span className="stat-label">Voter Berpartisipasi</span>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${quorumReached ? "green" : "amber"}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  {quorumReached && <polyline points="22 4 12 14.01 9 11.01" />}
                </svg>
              </div>
              <div className="stat-data">
                <span className="stat-value">{totalVoters}/{minimumQuorum}</span>
                <span className="stat-label">Quorum {quorumReached ? "✓" : "(belum)"}</span>
              </div>
              <div className="stat-bar">
                <div
                  className={`stat-bar-fill ${quorumReached ? "green" : "amber"}`}
                  style={{ width: `${quorumPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${votingOpen && !isDeadlinePassed ? "cyan" : "red"}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
              </div>
              <div className="stat-data">
                <span className={`stat-value ${!votingOpen || isDeadlinePassed ? "expired-text" : ""}`}>
                  {!votingOpen ? "Ditutup" : isBeforeStart ? "Belum Mulai" : isDeadlinePassed ? "Selesai" : "Buka"}
                </span>
                <span className="stat-label">Status Sesi</span>
              </div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${timeLeft.expired ? "red" : timeLeft.noDeadline ? "blue" : "cyan"}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="stat-data">
                {timeLeft.noDeadline ? (
                  <>
                    <span className="stat-value">∞</span>
                    <span className="stat-label">Tanpa Batas Waktu</span>
                  </>
                ) : isBeforeStart ? (
                  <>
                    <span className="stat-value">Tunggu</span>
                    <span className="stat-label">Mulai: {formatTimestamp(votingStartTime)}</span>
                  </>
                ) : timeLeft.expired ? (
                  <>
                    <span className="stat-value expired-text">Berakhir</span>
                    <span className="stat-label">Voting Ditutup</span>
                  </>
                ) : (
                  <>
                    <span className="stat-value countdown">
                      {timeLeft.hours.toString().padStart(2, "0")}:
                      {timeLeft.minutes.toString().padStart(2, "0")}:
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </span>
                    <span className="stat-label">Sisa Waktu</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Winner Card */}
      {winner && (
        <div className="card winner-card" id="winner-card">
          <div className="winner-glow"></div>
          <div className="winner-content">
            <div className="winner-trophy">🏆</div>
            <div>
              <span className="winner-label">Pemenang Sementara</span>
              <h3 className="winner-name">{winner.name}</h3>
              <span className="winner-votes">{winner.voteCount} suara (termasuk bobot)</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Bar Chart */}
      {candidates.length > 0 && totalVotesCount > 0 && (
        <div className="card" id="vote-chart">
          <div className="card-header">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Hasil Perolehan Suara
            </h2>
          </div>
          <div className="chart-container">
            {candidates.map((candidate, index) => {
              const [color1, color2] = getCandidateColor(index);
              const percentage =
                totalVotesCount > 0 ? ((candidate.voteCount / totalVotesCount) * 100).toFixed(1) : 0;

              return (
                <div key={candidate.id} className="chart-row">
                  <div className="chart-label-group">
                    <span className="chart-label">{candidate.name}</span>
                    <span className="chart-sublabel">{candidate.voteCount} suara</span>
                  </div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${color1}, ${color2})`,
                      }}
                    ></div>
                  </div>
                  <span className="chart-value">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vote History / Transaction History */}
      {voteHistory.length > 0 && (
        <div className="card" id="vote-history">
          <div className="card-header">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Riwayat Voting
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowHistory(!showHistory)}
              id="btn-toggle-history"
            >
              {showHistory ? "Sembunyikan" : `Tampilkan (${voteHistory.length})`}
            </button>
          </div>

          {showHistory && (
            <div className="history-list">
              {voteHistory.map((h, i) => {
                const candidateName = candidates.find((c) => c.id === h.candidateId)?.name || `#${h.candidateId}`;
                return (
                  <div key={i} className="history-item">
                    <div className="history-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="history-details">
                      <span className="history-voter">{h.voter.slice(0, 6)}...{h.voter.slice(-4)}</span>
                      <span className="history-arrow">→</span>
                      <span className="history-candidate">{candidateName} <small>(Bobot: {h.weight})</small></span>
                    </div>
                    <span className="history-block">Block #{h.blockNumber}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
