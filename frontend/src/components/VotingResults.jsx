// ============================================
// VotingResults Component
// Visualisasi hasil voting + winner + statistik
// READ operation: getWinner, totalVoters, minimumQuorum
// ============================================

import { getCandidateColor, getTimeRemaining, formatTimestamp } from "../utils/helpers";
import { useState, useEffect } from "react";

export default function VotingResults({
  candidates,
  totalVoters,
  minimumQuorum,
  winner,
  votingDeadline,
  voteHistory,
  isLoading,
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(votingDeadline));
  const [showHistory, setShowHistory] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!votingDeadline || votingDeadline === 0n) return;

    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(votingDeadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [votingDeadline]);

  const quorumReached = totalVoters >= minimumQuorum;
  const quorumPercentage = minimumQuorum > 0 ? Math.min((totalVoters / minimumQuorum) * 100, 100) : 0;

  return (
    <div className="results-section" id="voting-results">
      {/* Stats Cards */}
      <div className="stats-grid">
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
            <span className="stat-value">{totalVoters}</span>
            <span className="stat-label">Total Voter</span>
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
                <span className="stat-label">Tanpa Deadline</span>
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
              <span className="winner-votes">{winner.voteCount} suara</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Bar Chart */}
      {candidates.length > 0 && totalVoters > 0 && (
        <div className="card" id="vote-chart">
          <div className="card-header">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Hasil Voting
            </h2>
          </div>
          <div className="chart-container">
            {candidates.map((candidate, index) => {
              const [color1, color2] = getCandidateColor(index);
              const percentage =
                totalVoters > 0 ? ((candidate.voteCount / totalVoters) * 100).toFixed(1) : 0;

              return (
                <div key={candidate.id} className="chart-row">
                  <span className="chart-label">{candidate.name}</span>
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
                      <span className="history-candidate">{candidateName}</span>
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
