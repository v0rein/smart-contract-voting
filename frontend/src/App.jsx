// ============================================
// App.jsx - Main Application
// Voting dApp - Sistem Voting On-Chain
// ============================================

import { useState } from "react";
import { useContract } from "./hooks/useContract";
import ConnectWallet from "./components/ConnectWallet";
import NetworkWarning from "./components/NetworkWarning";
import CandidateList from "./components/CandidateList";
import VoteAction from "./components/VoteAction";
import VotingResults from "./components/VotingResults";
import AdminPanel from "./components/AdminPanel";
import ThemeToggle from "./components/ThemeToggle";
import { CONTRACT_ADDRESS, getNetworkName } from "./utils/contract";
import { truncateAddress } from "./utils/helpers";
import "./App.css";

function App() {
  const {
    account,
    isOwner,
    chainId,
    isCorrectNetwork,
    isConnecting,
    error,
    isLoading,
    candidates,
    totalVoters,
    hasVoted,
    minimumQuorum,
    winner,
    voteHistory,
    votingOpen,
    votingStartTime,
    votingEndTime,
    registeredVotersCount,
    isRegistered,
    delegatedTo,
    connectWallet,
    disconnectWallet,
    vote,
    delegateVote,
    addCandidate,
    setVotingStatusAction,
    setVotingPeriodAction,
    registerVoterAction,
    setMinimumQuorumAction,
    setVoterWeightAction,
    setError,
  } = useContract();

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>

      {/* Network Warning */}
      <NetworkWarning chainId={chainId} isCorrectNetwork={isCorrectNetwork} />

      {/* Header */}
      <header className="header" id="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M7 10l3 3 7-7" />
              </svg>
            </div>
            <div>
              <h1>VoteChain</h1>
              <span className="logo-subtitle">Decentralized Voting</span>
            </div>
          </div>

          <div className="header-right">
            {account && (
              <div className="header-meta">
                {isOwner && <span className="badge badge-admin">Admin</span>}
                <span className="network-badge">
                  <span className={`dot ${isCorrectNetwork ? "dot-green" : "dot-red"}`}></span>
                  {isCorrectNetwork ? getNetworkName(chainId) : "Wrong Network"}
                </span>
                <ThemeToggle />
              </div>
            )}
            {!account && (
              <div className="header-meta">
                <ThemeToggle />
              </div>
            )}
            <ConnectWallet
              account={account}
              isConnecting={isConnecting}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
            />
          </div>
        </div>
      </header>

      {/* Global Error */}
      {error && (
        <div className="container">
          <div className="global-error" id="global-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main container">
        {!account ? (
          /* Landing / Not Connected State */
          <div className="hero" id="hero">
            <div className="hero-content">
              <div className="hero-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                On-Chain Voting
              </div>
              <h2 className="hero-title">
                Voting <span className="gradient-text">Transparan</span> &amp;{" "}
                <span className="gradient-text">Terdesentralisasi</span>
              </h2>
              <p className="hero-desc">
                Sistem voting berbasis blockchain yang transparan, aman, dan tidak dapat dimanipulasi.
                Setiap suara tercatat secara permanen di blockchain.
              </p>
              <button className="btn btn-primary btn-lg btn-glow" onClick={connectWallet} id="btn-hero-connect">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <circle cx="18" cy="16" r="1" />
                </svg>
                Connect MetaMask
              </button>
              <div className="hero-features">
                <div className="hero-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Aman &amp; Trustless
                </div>
                <div className="hero-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Transparan
                </div>
                <div className="hero-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Anti Double-Vote
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Connected State - Dashboard */
          <div className="dashboard" id="dashboard">
            {/* Voting Results (Stats + Chart + History) */}
            <VotingResults
              candidates={candidates}
              totalVoters={totalVoters}
              minimumQuorum={minimumQuorum}
              winner={winner}
              votingOpen={votingOpen}
              votingStartTime={votingStartTime}
              votingEndTime={votingEndTime}
              registeredVotersCount={registeredVotersCount}
              voteHistory={voteHistory}
              isLoading={isLoading}
            />

            {/* Two-column layout: Candidates + Vote */}
            <div className="voting-layout">
              <CandidateList
                candidates={candidates}
                totalVoters={totalVoters}
                isLoading={isLoading}
                hasVoted={hasVoted}
                account={account}
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
              />

              <VoteAction
                account={account}
                hasVoted={hasVoted}
                selectedCandidate={selectedCandidate}
                candidates={candidates}
                onVote={vote}
                onDelegate={delegateVote}
                votingOpen={votingOpen}
                votingStartTime={votingStartTime}
                votingEndTime={votingEndTime}
                isRegistered={isRegistered}
                delegatedTo={delegatedTo}
              />
            </div>

            {/* Admin Panel (Owner Only) */}
            <AdminPanel
              isOwner={isOwner}
              account={account}
              votingOpen={votingOpen}
              votingStartTime={votingStartTime}
              votingEndTime={votingEndTime}
              minimumQuorum={minimumQuorum}
              onAddCandidate={addCandidate}
              onSetVotingStatus={setVotingStatusAction}
              onSetVotingPeriod={setVotingPeriodAction}
              onRegisterVoter={registerVoterAction}
              onSetMinimumQuorum={setMinimumQuorumAction}
              onSetVoterWeight={setVoterWeightAction}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <span>VoteChain dApp © 2025</span>
          <span className="footer-contract">
            Contract: {truncateAddress(CONTRACT_ADDRESS)}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
