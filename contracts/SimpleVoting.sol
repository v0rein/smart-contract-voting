// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleVoting
 * @dev Sistem voting sederhana untuk pemilihan (ketua kelas, proposal, dll)
 * @notice Contract ini memungkinkan owner membuat kandidat dan user melakukan voting
 */
contract SimpleVoting {
    // ========================
    // STATE VARIABLES
    // ========================

    /// @dev Alamat pemilik contract (yang membuat contract)
    address public owner;

    /// @dev Batas waktu voting (dalam UNIX timestamp)
    uint256 public votingDeadline;

    /// @dev Jumlah minimum voter agar hasil voting valid (quorum)
    uint256 public minimumQuorum;

    /// @dev Total jumlah voter yang sudah melakukan voting
    uint256 public totalVoters;

    /// @dev Struct untuk menyimpan data kandidat
    struct Candidate {
        string name;        // Nama kandidat
        uint256 voteCount;  // Jumlah suara yang diterima
    }

    /// @dev Array untuk menyimpan semua kandidat
    Candidate[] public candidates;

    /// @dev Mapping untuk tracking apakah address sudah pernah vote
    mapping(address => bool) public hasVoted;

    // ========================
    // EVENTS
    // ========================

    /// @dev Event saat kandidat baru ditambahkan
    event CandidateAdded(uint256 indexed candidateId, string name);

    /// @dev Event saat seseorang melakukan voting
    event Voted(address indexed voter, uint256 indexed candidateId);

    /// @dev Event saat deadline voting diubah
    event DeadlineSet(uint256 deadline);

    // ========================
    // MODIFIERS
    // ========================

    /// @dev Modifier: hanya pemilik contract yang bisa memanggil fungsi ini
    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang bisa melakukan ini");
        _;
    }

    /// @dev Modifier: voting harus masih dalam periode waktu yang ditentukan
    modifier votingOpen() {
        require(
            votingDeadline == 0 || block.timestamp <= votingDeadline,
            "Voting sudah ditutup (melewati deadline)"
        );
        _;
    }

    // ========================
    // CONSTRUCTOR
    // ========================

    /**
     * @dev Constructor - dipanggil sekali saat contract di-deploy
     * @param _minimumQuorum Jumlah minimum voter agar voting dianggap valid
     */
    constructor(uint256 _minimumQuorum) {
        owner = msg.sender;         // Yang deploy = owner
        minimumQuorum = _minimumQuorum;
        totalVoters = 0;
    }

    // ========================
    // FUNCTIONS
    // ========================

    /**
     * @dev Menambah kandidat baru (hanya owner)
     * @param _name Nama kandidat yang akan ditambahkan
     *
     * Contoh: addCandidate("Budi") -> Menambah "Budi" sebagai kandidat
     */
    function addCandidate(string memory _name) external onlyOwner {
        // Pastikan nama tidak kosong
        require(bytes(_name).length > 0, "Nama kandidat tidak boleh kosong");

        // Tambah kandidat ke array dengan 0 vote awal
        candidates.push(Candidate({
            name: _name,
            voteCount: 0
        }));

        // Emit event untuk logging
        emit CandidateAdded(candidates.length - 1, _name);
    }

    /**
     * @dev Melakukan voting untuk kandidat tertentu
     * @param _candidateId Index kandidat yang dipilih (mulai dari 0)
     *
     * Rules:
     * - Setiap address hanya bisa vote 1 kali
     * - Voting harus masih dalam periode (belum melewati deadline)
     * - Kandidat harus valid (index tidak melebihi jumlah kandidat)
     */
    function vote(uint256 _candidateId) external votingOpen {
        // Cek: user belum pernah vote
        require(!hasVoted[msg.sender], "Anda sudah pernah voting");

        // Cek: kandidat valid
        require(_candidateId < candidates.length, "Kandidat tidak valid");

        // Tandai user sudah vote
        hasVoted[msg.sender] = true;

        // Tambah jumlah suara untuk kandidat
        candidates[_candidateId].voteCount++;

        // Tambah total voter
        totalVoters++;

        // Emit event
        emit Voted(msg.sender, _candidateId);
    }

    /**
     * @dev Set deadline voting (hanya owner)
     * @param _durationInMinutes Durasi voting dalam menit dari sekarang
     *
     * Contoh: setDeadline(60) -> Voting ditutup 60 menit dari sekarang
     */
    function setDeadline(uint256 _durationInMinutes) external onlyOwner {
        // Hitung timestamp deadline
        votingDeadline = block.timestamp + (_durationInMinutes * 1 minutes);

        // Emit event
        emit DeadlineSet(votingDeadline);
    }

    /**
     * @dev Mendapatkan jumlah total kandidat
     * @return Jumlah kandidat yang terdaftar
     */
    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /**
     * @dev Mendapatkan detail kandidat berdasarkan ID
     * @param _candidateId Index kandidat
     * @return name Nama kandidat
     * @return voteCount Jumlah suara
     */
    function getCandidate(uint256 _candidateId) external view returns (string memory name, uint256 voteCount) {
        require(_candidateId < candidates.length, "Kandidat tidak valid");
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    /**
     * @dev Mendapatkan pemenang voting
     * @return winnerName Nama pemenang
     * @return winnerVoteCount Jumlah suara pemenang
     *
     * Catatan: Jika total voter kurang dari minimumQuorum, 
     * fungsi ini akan revert (gagal)
     */
    function getWinner() external view returns (string memory winnerName, uint256 winnerVoteCount) {
        // Pastikan ada kandidat
        require(candidates.length > 0, "Belum ada kandidat");

        // Cek quorum: minimal jumlah voter harus terpenuhi
        require(totalVoters >= minimumQuorum, "Quorum belum tercapai");

        // Cari kandidat dengan suara terbanyak
        uint256 winningVoteCount = 0;
        uint256 winningIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }

        // Return data pemenang
        winnerName = candidates[winningIndex].name;
        winnerVoteCount = candidates[winningIndex].voteCount;
    }
}
