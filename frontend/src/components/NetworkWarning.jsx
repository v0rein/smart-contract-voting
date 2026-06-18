// ============================================
// NetworkWarning Component
// Peringatan jika network MetaMask tidak didukung
// ============================================

import { HARDHAT_CHAIN_ID, HARDHAT_CHAIN_ID_HEX } from "../utils/contract";

export default function NetworkWarning({ chainId, isCorrectNetwork }) {
  if (isCorrectNetwork || !chainId) return null;

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: HARDHAT_CHAIN_ID_HEX,
                chainName: "Hardhat Local",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          });
        } catch (addErr) {
          console.error("Gagal menambahkan network:", addErr);
        }
      }
    }
  };

  return (
    <div className="network-warning" id="network-warning">
      <div className="network-warning-content">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <strong>Network Tidak Didukung!</strong>
          <p>
            Saat ini terhubung ke chain ID: {chainId}. Harap ganti ke jaringan Hardhat Local (Chain ID: {HARDHAT_CHAIN_ID}).
          </p>
        </div>
        <button className="btn btn-warning btn-sm" onClick={switchNetwork} id="btn-switch-network">
          Switch ke Hardhat
        </button>
      </div>
    </div>
  );
}
