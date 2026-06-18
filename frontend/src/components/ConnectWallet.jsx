// ============================================
// ConnectWallet Component
// Tombol connect MetaMask + display address
// ============================================

import { truncateAddress } from "../utils/helpers";

export default function ConnectWallet({ account, isConnecting, onConnect, onDisconnect }) {
  if (account) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-dot"></div>
          <span className="wallet-address">{truncateAddress(account)}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onDisconnect} id="btn-disconnect">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-primary btn-glow"
      onClick={onConnect}
      disabled={isConnecting}
      id="btn-connect-wallet"
    >
      {isConnecting ? (
        <>
          <span className="spinner spinner-sm"></span>
          Connecting...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <circle cx="18" cy="16" r="1" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
