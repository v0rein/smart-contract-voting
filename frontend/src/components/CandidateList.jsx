// ============================================
// CandidateList Component
// Daftar kandidat dengan progress bar voting
// READ operation: getCandidateCount + getCandidate
// ============================================

import { getCandidateColor, getInitials } from "../utils/helpers";

export default function CandidateList({
  candidates,
  totalVoters,
  isLoading,
  hasVoted,
  account,
  selectedCandidate,
  onSelectCandidate,
}) {
  if (isLoading) {
    return (
      <div className="card" id="candidate-list">
        <div className="card-header">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Daftar Kandidat
          </h2>
        </div>
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="card" id="candidate-list">
        <div className="card-header">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Daftar Kandidat
          </h2>
        </div>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p>Belum ada kandidat terdaftar</p>
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(...candidates.map((c) => c.voteCount), 1);

  return (
    <div className="card" id="candidate-list">
      <div className="card-header">
        <h2>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Daftar Kandidat
        </h2>
        <span className="badge">{candidates.length} kandidat</span>
      </div>

      <div className="candidate-grid">
        {candidates.map((candidate, index) => {
          const [color1, color2] = getCandidateColor(index);
          const percentage = totalVoters > 0 ? ((candidate.voteCount / totalVoters) * 100).toFixed(1) : 0;
          const isSelected = selectedCandidate === candidate.id;
          const isLeading = candidate.voteCount === maxVotes && candidate.voteCount > 0;

          return (
            <div
              key={candidate.id}
              className={`candidate-card ${isSelected ? "selected" : ""} ${!hasVoted && account ? "clickable" : ""}`}
              onClick={() => {
                if (!hasVoted && account) onSelectCandidate(candidate.id);
              }}
              id={`candidate-${candidate.id}`}
            >
              {isLeading && (
                <div className="leading-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  Leading
                </div>
              )}

              <div className="candidate-avatar" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}>
                {getInitials(candidate.name)}
              </div>

              <div className="candidate-info">
                <h3 className="candidate-name">{candidate.name}</h3>
                <div className="candidate-votes">
                  <span className="vote-count">{candidate.voteCount}</span>
                  <span className="vote-label">suara</span>
                  {totalVoters > 0 && <span className="vote-percentage">({percentage}%)</span>}
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color1}, ${color2})`,
                  }}
                ></div>
              </div>

              {isSelected && (
                <div className="selected-indicator">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
