// ============================================
// HELPER FUNCTIONS
// Fungsi utility untuk format, error handling, dll
// ============================================

/**
 * Truncate alamat wallet untuk display
 * Contoh: 0x1234...5678
 */
export function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Parse error dari MetaMask / ethers.js menjadi pesan user-friendly
 */
export function formatError(error) {
  const msg = error?.reason || error?.message || String(error);

  // Common smart contract errors
  if (msg.includes("Hanya owner")) return "Akses ditolak: hanya owner yang bisa melakukan ini.";
  if (msg.includes("sudah pernah voting")) return "Anda sudah pernah melakukan voting.";
  if (msg.includes("Kandidat tidak valid")) return "Kandidat yang dipilih tidak valid.";
  if (msg.includes("sudah ditutup")) return "Voting sudah ditutup (melewati deadline).";
  if (msg.includes("tidak boleh kosong")) return "Nama kandidat tidak boleh kosong.";
  if (msg.includes("Quorum belum")) return "Quorum belum tercapai, voting masih berlangsung.";
  if (msg.includes("Belum ada kandidat")) return "Belum ada kandidat terdaftar.";

  // MetaMask / wallet errors
  if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED"))
    return "Transaksi dibatalkan oleh pengguna.";
  if (msg.includes("insufficient funds")) return "Saldo tidak cukup untuk transaksi.";
  if (msg.includes("nonce")) return "Error nonce — coba reset akun di MetaMask Settings.";

  // Generic
  if (msg.length > 120) return msg.slice(0, 120) + "...";
  return msg;
}

/**
 * Hitung sisa waktu dari deadline UNIX timestamp
 * Returns: { days, hours, minutes, seconds, expired }
 */
export function getTimeRemaining(deadlineTimestamp) {
  if (!deadlineTimestamp || deadlineTimestamp === 0n) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, noDeadline: true };
  }

  const deadline = Number(deadlineTimestamp) * 1000; // Convert to ms
  const now = Date.now();
  const diff = deadline - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, noDeadline: false };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
    noDeadline: false,
  };
}

/**
 * Format timestamp ke readable date
 */
export function formatTimestamp(timestamp) {
  if (!timestamp || timestamp === 0n) return "Tidak ada deadline";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Generate warna gradient berdasarkan index
 */
const CANDIDATE_COLORS = [
  ["#8B5CF6", "#6D28D9"], // Violet
  ["#06B6D4", "#0891B2"], // Cyan
  ["#F59E0B", "#D97706"], // Amber
  ["#10B981", "#059669"], // Emerald
  ["#EC4899", "#DB2777"], // Pink
  ["#3B82F6", "#2563EB"], // Blue
  ["#EF4444", "#DC2626"], // Red
  ["#14B8A6", "#0D9488"], // Teal
];

export function getCandidateColor(index) {
  return CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];
}

/**
 * Generate initials dari nama
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
