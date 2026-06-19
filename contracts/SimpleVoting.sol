// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleVoting
 * @dev Sistem voting on-chain dengan fitur lanjutan:
 *      - Whitelist Voter (hanya voter terdaftar yang boleh vote)
 *      - Time-Based Voting (periode voting otomatis)
 *      - Delegated Voting (voter bisa delegasikan suara)
 *      - Vote Weight (bobot suara custom)
 * @notice Contract ini digunakan untuk pemilihan yang transparan dan aman
 */
contract SimpleVoting {
    // ========================
    // STATE VARIABLES
    // ========================

    /// @dev Struct untuk menyimpan data kandidat
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    /// @dev Mapping untuk menyimpan kandidat (ID dimulai dari 1)
    mapping(uint256 => Candidate) public candidates;

    /// @dev Mapping untuk tracking voter yang sudah vote
    mapping(address => bool) public hasVoted;

    /// @dev Jumlah kandidat
    uint256 public candidatesCount;

    /// @dev Address owner (admin)
    address public owner;

    /// @dev Status voting (manual toggle)
    bool public votingOpen;

    // ---- Fitur A: Whitelist Voter ----
    /// @dev Mapping voter yang terdaftar (whitelist)
    mapping(address => bool) public registeredVoters;

    /// @dev Jumlah voter terdaftar
    uint256 public registeredVotersCount;

    // ---- Fitur B: Time-Based Voting ----
    /// @dev Waktu mulai voting (UNIX timestamp)
    uint256 public votingStartTime;

    /// @dev Waktu akhir voting (UNIX timestamp)
    uint256 public votingEndTime;

    // ---- Fitur D: Delegated Voting ----
    /// @dev Mapping delegasi suara (siapa mendelegasikan ke siapa)
    mapping(address => address) public delegations;

    // ---- Fitur E: Vote Weight ----
    /// @dev Mapping bobot suara custom (default 0 = bobot 1)
    mapping(address => uint256) public customWeights;

    /// @dev Minimum quorum (jumlah voter minimum agar voting valid)
    uint256 public minimumQuorum;

    /// @dev Total jumlah voter yang sudah melakukan voting
    uint256 public totalVoters;

    // ========================
    // EVENTS
    // ========================

    event CandidateAdded(uint256 indexed id, string name);
    event Voted(address indexed voter, uint256 indexed candidateId, uint256 weight);
    event VotingStatusChanged(bool isOpen);
    event VotingPeriodSet(uint256 startTime, uint256 endTime);
    event VoterRegistered(address indexed voter);
    event VoteDelegated(address indexed from, address indexed to);
    event VoterWeightSet(address indexed voter, uint256 weight);
    event QuorumUpdated(uint256 newQuorum);

    // ========================
    // MODIFIERS
    // ========================

    /// @dev Hanya owner yang bisa memanggil
    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang bisa melakukan ini");
        _;
    }

    /// @dev Voting harus aktif (manual toggle)
    modifier whenVotingOpen() {
        require(votingOpen, "Voting belum dibuka atau sudah ditutup");
        _;
    }

    /// @dev Hanya voter yang terdaftar di whitelist
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Anda tidak terdaftar sebagai voter");
        _;
    }

    /// @dev Harus dalam periode voting (jika diset)
    modifier withinVotingPeriod() {
        if (votingStartTime > 0 && votingEndTime > 0) {
            require(block.timestamp >= votingStartTime, "Voting belum dimulai");
            require(block.timestamp <= votingEndTime, "Voting sudah berakhir");
        }
        _;
    }

    // ========================
    // CONSTRUCTOR
    // ========================

    constructor() {
        owner = msg.sender;
        votingOpen = false;
        minimumQuorum = 2;
    }

    // ========================
    // ADMIN FUNCTIONS (onlyOwner)
    // ========================

    /**
     * @dev Menambah kandidat baru (hanya owner)
     * @param _name Nama kandidat
     */
    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Nama tidak boleh kosong");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);

        emit CandidateAdded(candidatesCount, _name);
    }

    /**
     * @dev Membuka/menutup voting secara manual
     * @param _status true = buka, false = tutup
     */
    function setVotingStatus(bool _status) public onlyOwner {
        votingOpen = _status;
        emit VotingStatusChanged(_status);
    }

    /**
     * @dev Set periode voting otomatis (time-based)
     * @param _startTime UNIX timestamp mulai
     * @param _endTime UNIX timestamp akhir
     */
    function setVotingPeriod(uint256 _startTime, uint256 _endTime) public onlyOwner {
        require(_endTime > _startTime, "End time harus lebih besar dari start time");
        votingStartTime = _startTime;
        votingEndTime = _endTime;
        emit VotingPeriodSet(_startTime, _endTime);
    }

    /**
     * @dev Mendaftarkan voter ke whitelist
     * @param _voter Address voter yang akan didaftarkan
     */
    function registerVoter(address _voter) public onlyOwner {
        require(!registeredVoters[_voter], "Voter sudah terdaftar");
        registeredVoters[_voter] = true;
        registeredVotersCount++;
        emit VoterRegistered(_voter);
    }

    /**
     * @dev Memberikan bobot suara custom untuk voter tertentu
     * @param _voter Address voter
     * @param _weight Bobot suara (misal: 2 = suaranya dihitung 2x)
     */
    function setVoterWeight(address _voter, uint256 _weight) public onlyOwner {
        require(_weight > 0, "Bobot harus lebih dari 0");
        customWeights[_voter] = _weight;
        emit VoterWeightSet(_voter, _weight);
    }

    /**
     * @dev Ubah minimum quorum
     * @param _newQuorum Jumlah minimum voter agar voting valid
     */
    function setMinimumQuorum(uint256 _newQuorum) public onlyOwner {
        minimumQuorum = _newQuorum;
        emit QuorumUpdated(_newQuorum);
    }

    // ========================
    // PUBLIC FUNCTIONS (voter)
    // ========================

    /**
     * @dev Melakukan voting untuk kandidat tertentu
     * @param _candidateId ID kandidat (mulai dari 1)
     *
     * Rules:
     * - Voter harus terdaftar di whitelist
     * - Voting harus dibuka (votingOpen = true)
     * - Harus dalam periode voting (jika diset)
     * - Setiap address hanya bisa vote 1 kali
     * - Kandidat harus valid
     */
    function vote(uint256 _candidateId) public onlyRegisteredVoter whenVotingOpen withinVotingPeriod {
        // Resolve delegasi: jika ada yang mendelegasikan ke msg.sender,
        // suara mereka sudah dihitung di sini via bobot
        require(!hasVoted[msg.sender], "Anda sudah melakukan voting");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Kandidat tidak valid");
        require(delegations[msg.sender] == address(0), "Anda sudah mendelegasikan suara Anda");

        hasVoted[msg.sender] = true;

        // Hitung bobot suara (default 1 jika tidak di-set)
        uint256 weight = customWeights[msg.sender] > 0 ? customWeights[msg.sender] : 1;

        // Tambah jumlah suara sesuai bobot
        candidates[_candidateId].voteCount += weight;
        totalVoters++;

        emit Voted(msg.sender, _candidateId, weight);
    }

    /**
     * @dev Mendelegasikan suara ke voter lain
     * @param _to Address tujuan delegasi
     *
     * Catatan: Delegasi berarti suara Anda tidak bisa digunakan sendiri,
     * dan bobot suara voter tujuan akan bertambah
     */
    function delegate(address _to) public onlyRegisteredVoter {
        require(_to != msg.sender, "Tidak bisa delegate ke diri sendiri");
        require(!hasVoted[msg.sender], "Anda sudah vote, tidak bisa delegate");
        require(delegations[msg.sender] == address(0), "Anda sudah mendelegasikan suara");
        require(registeredVoters[_to], "Tujuan delegasi harus voter terdaftar");

        // Cegah circular delegation
        address current = _to;
        while (delegations[current] != address(0)) {
            current = delegations[current];
            require(current != msg.sender, "Circular delegation tidak diperbolehkan");
        }

        delegations[msg.sender] = _to;

        // Tambahkan bobot delegator ke voter tujuan
        uint256 delegatorWeight = customWeights[msg.sender] > 0 ? customWeights[msg.sender] : 1;
        uint256 currentWeight = customWeights[_to] > 0 ? customWeights[_to] : 1;
        customWeights[_to] = currentWeight + delegatorWeight;

        emit VoteDelegated(msg.sender, _to);
    }

    // ========================
    // READ FUNCTIONS (view)
    // ========================

    /**
     * @dev Mendapatkan semua kandidat
     */
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);

        for (uint256 i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }

        return allCandidates;
    }

    /**
     * @dev Mendapatkan total votes (kumulatif semua kandidat)
     */
    function getTotalVotes() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            total += candidates[i].voteCount;
        }
        return total;
    }

    /**
     * @dev Mengecek apakah address sudah vote
     */
    function checkIfVoted(address _voter) public view returns (bool) {
        return hasVoted[_voter];
    }

    /**
     * @dev Mendapatkan jumlah kandidat
     */
    function getCandidateCount() public view returns (uint256) {
        return candidatesCount;
    }

    /**
     * @dev Mendapatkan pemenang voting
     * @return winnerName Nama pemenang
     * @return winnerVoteCount Jumlah suara pemenang
     */
    function getWinner() public view returns (string memory winnerName, uint256 winnerVoteCount) {
        require(candidatesCount > 0, "Belum ada kandidat");
        require(totalVoters >= minimumQuorum, "Quorum belum tercapai");

        uint256 winningVoteCount = 0;
        uint256 winningIndex = 1;

        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }

        winnerName = candidates[winningIndex].name;
        winnerVoteCount = candidates[winningIndex].voteCount;
    }
}
