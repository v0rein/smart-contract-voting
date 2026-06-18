# VoteChain - Decentralized Voting dApp

## Deskripsi

**VoteChain** adalah Decentralized Application (dApp) untuk sistem voting on-chain yang transparan, aman, dan tidak dapat dimanipulasi. Setiap suara tercatat secara permanen di blockchain Ethereum. Aplikasi ini menggunakan smart contract Solidity sebagai backend dan React sebagai frontend, terintegrasi melalui ethers.js dan MetaMask wallet.

## Anggota Kelompok

| Nama | NRP | Kontribusi |
|------|-----|------------|
| Dionisius Marcell Putra Indranto | 5027231044 | Smart Contract + Frontend + Integrasi Web3 |

## Tech Stack

- **Smart Contract:** Solidity ^0.8.20 + Hardhat
- **Frontend:** React + Vite
- **Web3 Library:** ethers.js v6
- **Wallet:** MetaMask
- **Testing:** Chai + Hardhat Toolbox

## Fitur

### Fitur Wajib ✅

- [x] **Connect Wallet** — Detect MetaMask, request connection, display address
- [x] **Daftar Kandidat** (Read) — Menampilkan semua kandidat dengan progress bar voting
- [x] **Hasil Voting** (Read) — Visualisasi chart hasil voting + pemenang
- [x] **Vote Kandidat** (Write) — User bisa memilih kandidat pilihan
- [x] **Tambah Kandidat** (Write) — Admin/owner bisa menambah kandidat baru
- [x] **Set Deadline** (Write) — Admin bisa mengatur batas waktu voting
- [x] **Double Vote Prevention** — UI feedback jika sudah pernah voting
- [x] **Loading States** — Spinner saat transaksi pending
- [x] **Error Handling** — Pesan error user-friendly
- [x] **Network Detection** — Warning jika MetaMask di network yang salah
- [x] **Responsive Design** — Mobile-friendly layout

### Fitur Bonus 🌟

- [x] **Dark Mode** — Default dark theme premium
- [x] **Countdown Deadline** — Timer real-time sisa waktu voting
- [x] **Event Listening** — Real-time update saat ada vote baru via smart contract events
- [x] **Transaction History** — Riwayat voting dari blockchain events
- [x] **Loading Skeleton** — Skeleton loading animation
- [x] **Admin Panel** — Panel khusus owner untuk manage voting

## Smart Contract Details

### State Variables (6)

| Variable | Type | Deskripsi |
|----------|------|-----------|
| `owner` | `address` | Pemilik contract |
| `votingDeadline` | `uint256` | Batas waktu voting (UNIX timestamp) |
| `minimumQuorum` | `uint256` | Jumlah minimum voter |
| `totalVoters` | `uint256` | Total voter yang sudah vote |
| `candidates` | `Candidate[]` | Array kandidat (struct) |
| `hasVoted` | `mapping(address => bool)` | Tracking voter |

### Functions (6)

| Function | Akses | Jenis | Deskripsi |
|----------|-------|-------|-----------|
| `addCandidate(name)` | onlyOwner | Write | Menambah kandidat baru |
| `vote(candidateId)` | public | Write | Melakukan voting |
| `setDeadline(minutes)` | onlyOwner | Write | Set deadline voting |
| `getCandidateCount()` | view | Read | Jumlah kandidat |
| `getCandidate(id)` | view | Read | Detail kandidat |
| `getWinner()` | view | Read | Pemenang voting |

### Events (3)

- `CandidateAdded(uint256 candidateId, string name)`
- `Voted(address voter, uint256 candidateId)`
- `DeadlineSet(uint256 deadline)`

### Modifiers (2)

- `onlyOwner` — Hanya pemilik contract
- `votingOpen` — Voting harus masih dalam periode

## Cara Menjalankan

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git

### 1. Clone Repository

```bash
git clone [url-repo]
cd [nama-folder]
```

### 2. Install Dependencies

```bash
# Root folder (smart contract)
npm install

# Frontend folder
cd frontend
npm install
```

### 3. Jalankan Local Blockchain

```bash
# Terminal 1
npx hardhat node
```

### 4. Deploy Smart Contract

```bash
# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Update Contract Address

Copy address dari output deploy, lalu paste ke `frontend/src/utils/contract.js`:

```javascript
export const CONTRACT_ADDRESS = "PASTE_ADDRESS_DI_SINI";
```

### 6. Import Account ke MetaMask

1. Copy private key dari output `npx hardhat node`
2. Buka MetaMask → Import Account → Paste private key
3. Tambah network: Localhost 8545 (Chain ID: 31337)

### 7. Jalankan Frontend

```bash
cd frontend
npm run dev
```

### 8. Buka Browser

```
http://localhost:5173
```

## Contract Address

- **Local:** Diisi setelah deploy (`npx hardhat run scripts/deploy.js --network localhost`)

## Screenshot

> _Diisi setelah aplikasi berjalan_

## Demo

> _Link video demo atau GIF_
