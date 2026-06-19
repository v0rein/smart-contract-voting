// ============================================
// AdminPanel Component
// Panel admin: tambah kandidat, set deadline, quorum, pause, reset, close early
// ============================================

import { useState } from "react";
import { formatError, formatTimestamp } from "../utils/helpers";

export default function AdminPanel({
  isOwner,
  account,
  votingOpen,
  votingStartTime,
  votingEndTime,
  minimumQuorum,
  onAddCandidate,
  onSetVotingStatus,
  onSetVotingPeriod,
  onRegisterVoter,
  onSetMinimumQuorum,
  onSetVoterWeight,
}) {
  const [candidateName, setCandidateName] = useState("");
  const [quorumInput, setQuorumInput] = useState("");
  const [voterAddress, setVoterAddress] = useState("");
  const [weightAddress, setWeightAddress] = useState("");
  const [weightValue, setWeightValue] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");

  const [txStatus, setTxStatus] = useState({});
  const [txError, setTxError] = useState({});

  if (!account || !isOwner) return null;

  const handleAction = async (actionName, asyncFunc) => {
    try {
      setTxStatus((prev) => ({ ...prev, [actionName]: "pending" }));
      setTxError((prev) => ({ ...prev, [actionName]: null }));
      await asyncFunc();
      setTxStatus((prev) => ({ ...prev, [actionName]: "success" }));
      setTimeout(() => setTxStatus((prev) => ({ ...prev, [actionName]: null })), 3000);
    } catch (err) {
      setTxStatus((prev) => ({ ...prev, [actionName]: "failed" }));
      setTxError((prev) => ({ ...prev, [actionName]: formatError(err) }));
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
        {/* Toggle Voting Status */}
        <div className="admin-section">
          <h3>Status Voting</h3>
          <p className="admin-hint">Status: {votingOpen ? "Buka" : "Tutup"}</p>
          <div className="admin-form">
            <button
              onClick={() => handleAction("toggle", () => onSetVotingStatus(!votingOpen))}
              className={`btn ${votingOpen ? "btn-danger" : "btn-primary"}`}
              disabled={txStatus.toggle === "pending"}
              style={{ width: "100%" }}
            >
              {txStatus.toggle === "pending" ? (
                <span className="spinner spinner-sm"></span>
              ) : votingOpen ? (
                "Tutup Voting"
              ) : (
                "Buka Voting"
              )}
            </button>
            {txStatus.toggle === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.toggle === "failed" && <div className="tx-feedback tx-failed compact">{txError.toggle}</div>}
          </div>
        </div>

        {/* Set Voting Period Form */}
        <div className="admin-section">
          <h3>Periode Voting (Opsional)</h3>
          <p className="admin-hint">
            Mulai: {votingStartTime > 0n ? formatTimestamp(votingStartTime) : "Belum diset"}<br />
            Berakhir: {votingEndTime > 0n ? formatTimestamp(votingEndTime) : "Belum diset"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const startTS = Math.floor(new Date(startPeriod).getTime() / 1000);
              const endTS = Math.floor(new Date(endPeriod).getTime() / 1000);
              handleAction("period", () => onSetVotingPeriod(startTS, endTS));
            }}
            className="admin-form"
          >
            <div className="input-group" style={{ flexDirection: "column", gap: "10px" }}>
              <input
                type="datetime-local"
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
                className="input"
                disabled={txStatus.period === "pending"}
                required
              />
              <input
                type="datetime-local"
                value={endPeriod}
                onChange={(e) => setEndPeriod(e.target.value)}
                className="input"
                disabled={txStatus.period === "pending"}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!startPeriod || !endPeriod || txStatus.period === "pending"}
              >
                {txStatus.period === "pending" ? <span className="spinner spinner-sm"></span> : "Set Periode"}
              </button>
            </div>
            {txStatus.period === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.period === "failed" && <div className="tx-feedback tx-failed compact">{txError.period}</div>}
          </form>
        </div>

        {/* Add Candidate Form */}
        <div className="admin-section">
          <h3>Tambah Kandidat</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("addCandidate", async () => {
                await onAddCandidate(candidateName.trim());
                setCandidateName("");
              });
            }}
            className="admin-form"
          >
            <div className="input-group">
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama kandidat..."
                className="input"
                disabled={txStatus.addCandidate === "pending"}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!candidateName.trim() || txStatus.addCandidate === "pending"}
              >
                {txStatus.addCandidate === "pending" ? <span className="spinner spinner-sm"></span> : "Add"}
              </button>
            </div>
            {txStatus.addCandidate === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.addCandidate === "failed" && <div className="tx-feedback tx-failed compact">{txError.addCandidate}</div>}
          </form>
        </div>

        {/* Register Voter Form */}
        <div className="admin-section">
          <h3>Daftar Voter (Whitelist)</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("register", async () => {
                await onRegisterVoter(voterAddress.trim());
                setVoterAddress("");
              });
            }}
            className="admin-form"
          >
            <div className="input-group">
              <input
                type="text"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                placeholder="0xAddress..."
                className="input"
                disabled={txStatus.register === "pending"}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!voterAddress.trim() || txStatus.register === "pending"}
              >
                {txStatus.register === "pending" ? <span className="spinner spinner-sm"></span> : "Daftar"}
              </button>
            </div>
            {txStatus.register === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.register === "failed" && <div className="tx-feedback tx-failed compact">{txError.register}</div>}
          </form>
        </div>

        {/* Set Quorum Form */}
        <div className="admin-section">
          <h3>Ubah Quorum</h3>
          <p className="admin-hint">Quorum saat ini: {minimumQuorum} voters</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("quorum", async () => {
                await onSetMinimumQuorum(parseInt(quorumInput));
                setQuorumInput("");
              });
            }}
            className="admin-form"
          >
            <div className="input-group">
              <input
                type="number"
                value={quorumInput}
                onChange={(e) => setQuorumInput(e.target.value)}
                placeholder="Jumlah minimum..."
                className="input"
                min="0"
                disabled={txStatus.quorum === "pending"}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!quorumInput || parseInt(quorumInput) < 0 || txStatus.quorum === "pending"}
              >
                {txStatus.quorum === "pending" ? <span className="spinner spinner-sm"></span> : "Update"}
              </button>
            </div>
            {txStatus.quorum === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.quorum === "failed" && <div className="tx-feedback tx-failed compact">{txError.quorum}</div>}
          </form>
        </div>

        {/* Set Voter Weight Form */}
        <div className="admin-section">
          <h3>Set Bobot Voter</h3>
          <p className="admin-hint">Beri bobot ekstra pada voter (default: 1)</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("weight", async () => {
                await onSetVoterWeight(weightAddress.trim(), parseInt(weightValue));
                setWeightAddress("");
                setWeightValue("");
              });
            }}
            className="admin-form"
          >
            <div className="input-group" style={{ flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                value={weightAddress}
                onChange={(e) => setWeightAddress(e.target.value)}
                placeholder="0xAddress..."
                className="input"
                disabled={txStatus.weight === "pending"}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="Bobot..."
                  className="input"
                  min="1"
                  disabled={txStatus.weight === "pending"}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!weightAddress || !weightValue || parseInt(weightValue) <= 0 || txStatus.weight === "pending"}
                >
                  {txStatus.weight === "pending" ? <span className="spinner spinner-sm"></span> : "Update"}
                </button>
              </div>
            </div>
            {txStatus.weight === "success" && <div className="tx-feedback tx-success compact">Sukses!</div>}
            {txStatus.weight === "failed" && <div className="tx-feedback tx-failed compact">{txError.weight}</div>}
          </form>
        </div>

      </div>
    </div>
  );
}
