# VoteChain - Decentralized Voting dApp

**VoteChain** adalah aplikasi pemilihan suara (voting) masa depan yang berbasis **Blockchain**.

Aplikasi ini memastikan setiap suara yang masuk tidak bisa dimanipulasi, dihapus, atau diubah oleh siapa pun, bahkan oleh pembuat aplikasinya! Semua data bersifat transparan dan tersimpan secara permanen di jaringan blockchain Ethereum. Aplikasi ini menggunakan _smart contract_ Solidity sebagai _backend_ dan React sebagai _frontend_, terintegrasi melalui ethers.js dan MetaMask wallet.

---

## 🌟 Mengapa Memilih VoteChain?

- **Anti-Kecurangan:** Menggunakan teknologi _Smart Contract_ di jaringan Ethereum, membuat sistem ini tidak bisa di-hack secara konvensional.
- **Satu Orang, Satu Suara:** Integrasi dengan _MetaMask_ memastikan satu dompet digital hanya bisa memilih satu kali.
- **Transparan:** Hasil perolehan suara dapat dilihat secara langsung _(real-time)_ oleh semua orang secara publik.
- **Desain Premium:** Tampilan visual _Dark Mode_ modern yang responsif di HP maupun Laptop.

---

## 🚀 Coba Langsung! (Live Demo)

Aplikasi ini sudah di-_deploy_ ke Internet dan menggunakan jaringan publik **Sepolia Testnet**. Anda bisa mencobanya langsung:

👉 **[VoteChain DAPP](https://votechain-dapp.netlify.app/)** 👈

**Persiapan untuk mencoba:**

1. Install _extension_ **MetaMask** di browser Chrome/Edge/Firefox Anda.
2. Buat akun MetaMask dan ubah jaringannya ke **Sepolia Testnet**.
3. Dapatkan koin Ethereum gratis untuk testing dari [Sepolia Faucet](https://sepoliafaucet.com/).
4. Buka website di atas dan klik **Connect Wallet**!

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

- **Smart Contract:** Solidity ^0.8.20 + Hardhat v2 (Ignition Module)
- **Frontend / Tampilan:** React.js + Vite + Vanilla CSS
- **Web3 Integrasi:** ethers.js v6
- **Wallet Provider:** MetaMask

---

## ✨ Fitur Aplikasi

### Fitur Wajib ✅

- [x] **Connect Wallet** — Deteksi MetaMask, minta persetujuan koneksi, dan tampilkan alamat dompet.
- [x] **Daftar Kandidat** (Read) — Menampilkan semua kandidat lengkap dengan _progress bar_ jumlah suara.
- [x] **Hasil Voting** (Read) — Visualisasi hasil akhir voting dan indikator pemenang.
- [x] **Vote Kandidat** (Write) — Pengguna bisa memberikan suaranya ke kandidat pilihan.
- [x] **Tambah Kandidat** (Write) — Hanya _Admin/Owner_ yang bisa menambah kandidat baru.
- [x] **Set Deadline** (Write) — Admin bisa mengatur batas durasi waktu berjalannya pemilihan.
- [x] **Double Vote Prevention** — Perlindungan dari sistem agar satu akun MetaMask tidak bisa _vote_ dua kali.
- [x] **Loading States** — _Spinner_ animasi saat menunggu transaksi diproses oleh _miners_ di blockchain.
- [x] **Error Handling** — Pesan kesalahan yang mudah dimengerti pengguna saat transaksi gagal.
- [x] **Network Detection** — Peringatan otomatis jika MetaMask pengguna salah jaringan.
- [x] **Responsive Design** — Tampilan tetap rapi di layar HP maupun laptop.

### Fitur Bonus 🌟

- [x] **Dark Mode** — Tema gelap yang elegan dan premium.
- [x] **Countdown Deadline** — Penghitung waktu mundur _(timer real-time)_ sisa waktu voting.
- [x] **Event Listening** — Pembaruan suara _real-time_ tanpa perlu _refresh_ halaman (otomatis mendengarkan _event_ dari blockchain).
- [x] **Transaction History** — Log riwayat alamat dompet mana saja yang telah memberikan suara.
- [x] **Loading Skeleton** — Animasi _skeleton loading_ ala aplikasi modern sebelum data selesai dimuat.
- [x] **Admin Panel Khusus** — Halaman manajemen lengkap khusus untuk _owner_ (tambah kandidat, set quorum, set bobot suara, ubah deadline).
- [x] **Weighted Voting** — Admin bisa memberikan hak suara "lebih" kepada _address_ tertentu.

---

## 🏗️ Arsitektur Smart Contract (Technical Details)

Bagi Anda yang ingin memahami logika di balik _Smart Contract_ aplikasi ini:

### State Variables

| Variable         | Type          | Deskripsi                                                                     |
| ---------------- | ------------- | ----------------------------------------------------------------------------- |
| `owner`          | `address`     | Alamat pemilik/pembuat _contract_ (Admin)                                     |
| `votingDeadline` | `uint256`     | Batas waktu voting (UNIX timestamp)                                           |
| `minimumQuorum`  | `uint256`     | Jumlah minimum voter agar pemilihan dianggap sah                              |
| `totalVoters`    | `uint256`     | Total keseluruhan orang yang sudah memberikan suara                           |
| `candidates`     | `Candidate[]` | Array berisi data _struct_ kandidat (nama & jumlah suara)                     |
| `hasVoted`       | `mapping`     | _Mapping_ dari alamat pengguna `address` ke status `bool` (apakah sudah vote) |
| `voterWeights`   | `mapping`     | _Mapping_ bobot suara khusus per pengguna (default: 1)                        |

### Functions

| Function                       | Akses     | Jenis | Deskripsi                                                       |
| ------------------------------ | --------- | ----- | --------------------------------------------------------------- |
| `addCandidate(name)`           | onlyOwner | Write | Menambah daftar kandidat                                        |
| `vote(candidateId)`            | public    | Write | Melakukan voting                                                |
| `setDeadline(minutes)`         | onlyOwner | Write | Menetapkan durasi voting (dalam menit dari sekarang)            |
| `setMinimumQuorum(val)`        | onlyOwner | Write | Mengubah syarat batas minimum partisipan pemilu                 |
| `setVoterWeight(addr, weight)` | onlyOwner | Write | Memberi bobot suara tertentu ke _voter_ VIP                     |
| `getCandidateCount()`          | public    | Read  | Mengetahui jumlah kandidat yang terdaftar                       |
| `getAllCandidates()`           | public    | Read  | Mengambil seluruh data kandidat sekaligus (optimasi akses)      |
| `getWinner()`                  | public    | Read  | Menghitung dan mengembalikan nama pemenang jika quorum tercapai |

### Events (Web3 Listener)

- `CandidateAdded(uint256 candidateId, string name)`
- `Voted(address voter, uint256 candidateId, uint256 weight)`
- `DeadlineSet(uint256 deadline)`

---

## 📝 Panduan Menjalankan di Komputer Sendiri (Localhost)

Jika Anda ingin membongkar kode dan menjalankan aplikasi ini secara lokal (di komputer Anda sendiri), ikuti langkah-langkah mudah berikut:

### Persiapan Awal

Pastikan komputer Anda sudah terinstal:

- **Node.js** (Minimal versi 18)
- **MetaMask** (Ekstensi Browser)

### 1. Download Kode

```bash
git clone [url-repo]
cd smart-contract
```

### 2. Install Kebutuhan Modul (Dependencies)

Buka terminal dan ketik:

```bash
# Install modul untuk Smart Contract
npm install

# Masuk ke folder frontend dan install modul untuk Web
cd frontend
npm install
cd ..
```

### 3. Nyalakan "Blockchain Lokal" di Komputer

Buka terminal baru, dan jalankan perintah ini (biarkan tetap menyala):

```bash
npx hardhat node
```

_Ini akan membuat jaringan blockchain bohongan di komputer Anda dan memberikan Anda 20 akun berisikan 10.000 ETH gratis untuk uji coba._

### 4. Tanam (Deploy) Smart Contract

Buka terminal baru lainnya, dan jalankan Hardhat Ignition:

```bash
npm run deploy
```

_Proses ini akan mencetak "Contract Address" (seperti `0x5FbDB...`). Salin teks tersebut._

### 5. Hubungkan Contract ke Frontend

Buka file `frontend/src/utils/contract.js` menggunakan Notepad/VSCode. Cari variabel `HARDHAT_CONTRACT_ADDRESS` dan paste Contract Address yang Anda salin tadi ke dalamnya.

### 6. Jalankan Website

Di terminal, jalankan perintah ini:

```bash
cd frontend
npm run dev
```

Buka `http://localhost:5173` di browser Anda!

_(Jangan lupa di MetaMask Anda, tambahkan jaringan Localhost 8545 dan masukkan salah satu Private Key yang diberikan di langkah 3 agar Anda punya saldo untuk voting)._

---

## 🌐 Panduan Deploy Website ke Netlify

Jika Anda ingin mempublikasikan website ini agar bisa diakses orang lain, **Netlify** adalah pilihan yang sangat tepat! Ada dua cara yang bisa Anda lakukan:

### Opsi 1: Deploy Otomatis via GitHub (Sangat Disarankan)

Cara ini membuat website Anda akan otomatis diperbarui setiap kali Anda melakukan `git push`.

1. _Push_ seluruh folder project ini ke _repository_ **GitHub** Anda.
2. Buka **[app.netlify.com](https://app.netlify.com)** dan _Login_ menggunakan akun GitHub Anda.
3. Klik tombol **"Add new site"** > **"Import an existing project"**.
4. Pilih **GitHub**, lalu cari dan pilih _repository_ VoteChain Anda.
5. Pada bagian **Build settings**, isikan persis seperti ini:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
6. Klik **Deploy site** dan tunggu beberapa saat. Website Anda kini online!

### Opsi 2: Deploy Instan Manual (Tanpa GitHub)

Gunakan cara ini jika Anda hanya ingin _deploy_ cepat tanpa mengunggah kode ke GitHub.

1. Buka folder `frontend` di terminal Anda.
2. Ketik perintah: `npm run build`
3. Komputer akan membuat sebuah folder baru bernama **`dist`** di dalam folder `frontend`.
4. Buka website **[Netlify Drop](https://app.netlify.com/drop)**.
5. Tarik (_drag_) dan lepas (_drop_) folder **`dist`** tersebut ke dalam lingkaran di halaman Netlify.
6. Voila! Website Anda langsung online. Anda bisa mengubah nama tautannya di menu _Site Settings_.

---

## 👨‍💻 Pengembang

**Dionisius Marcell Putra Indranto**  
NRP: 5027231044  
_Tugas Minggu ke-12 Mata Kuliah Teknologi Blockchain._
