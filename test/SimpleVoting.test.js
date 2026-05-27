const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SimpleVoting", function () {
  // ============================
  // FIXTURE: Setup yang dipakai ulang di setiap test
  // ============================

  /**
   * Fixture ini men-deploy contract baru untuk setiap test
   * sehingga setiap test dimulai dari kondisi bersih (fresh state)
   */
  async function deployVotingFixture() {
    // Ambil akun-akun test dari Hardhat
    // owner = akun pertama (yang deploy contract)
    // voter1, voter2, voter3 = akun lain untuk simulasi voter
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy contract dengan minimumQuorum = 2
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    const voting = await SimpleVoting.deploy(2); // quorum = 2 voter minimum

    return { voting, owner, voter1, voter2, voter3 };
  }

  /**
   * Fixture dengan kandidat yang sudah ditambahkan
   * Digunakan untuk test yang butuh kandidat sudah siap
   */
  async function deployWithCandidatesFixture() {
    const { voting, owner, voter1, voter2, voter3 } = await loadFixture(
      deployVotingFixture
    );

    // Tambah 3 kandidat
    await voting.addCandidate("Budi");
    await voting.addCandidate("Siti");
    await voting.addCandidate("Andi");

    return { voting, owner, voter1, voter2, voter3 };
  }

  // ============================
  // TEST 1-2: DEPLOYMENT
  // ============================

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);

      // Owner harus sama dengan akun yang deploy
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("should initialize with zero candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Saat pertama kali deploy, belum ada kandidat
      expect(await voting.getCandidateCount()).to.equal(0);
    });

    it("should set the correct minimum quorum", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Quorum harus sesuai parameter constructor (2)
      expect(await voting.minimumQuorum()).to.equal(2);
    });
  });

  // ============================
  // TEST 3-5: ADD CANDIDATE
  // ============================

  describe("Add Candidate", function () {
    it("should allow owner to add a candidate", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Owner menambah kandidat
      await voting.addCandidate("Budi");

      // Verifikasi kandidat berhasil ditambahkan
      expect(await voting.getCandidateCount()).to.equal(1);

      const [name, voteCount] = await voting.getCandidate(0);
      expect(name).to.equal("Budi");
      expect(voteCount).to.equal(0); // Awalnya 0 vote
    });

    it("should reject non-owner from adding candidate", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);

      // voter1 (bukan owner) mencoba menambah kandidat → harus GAGAL
      await expect(
        voting.connect(voter1).addCandidate("Hacker")
      ).to.be.revertedWith("Hanya owner yang bisa melakukan ini");
    });

    it("should emit CandidateAdded event", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Cek apakah event CandidateAdded dipancarkan dengan data yang benar
      await expect(voting.addCandidate("Budi"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(0, "Budi"); // candidateId = 0 (pertama), name = "Budi"
    });

    it("should reject empty candidate name", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Nama kosong harus ditolak
      await expect(voting.addCandidate("")).to.be.revertedWith(
        "Nama kandidat tidak boleh kosong"
      );
    });
  });

  // ============================
  // TEST 6-10: VOTING
  // ============================

  describe("Voting", function () {
    it("should allow a user to vote", async function () {
      const { voting, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // voter1 memilih kandidat index 0 (Budi)
      await voting.connect(voter1).vote(0);

      // Verifikasi vote tercatat
      const [, voteCount] = await voting.getCandidate(0);
      expect(voteCount).to.equal(1);

      // Verifikasi voter sudah ditandai
      expect(await voting.hasVoted(voter1.address)).to.be.true;
    });

    it("should reject double voting", async function () {
      const { voting, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // voter1 vote pertama kali → berhasil
      await voting.connect(voter1).vote(0);

      // voter1 vote kedua kali → harus GAGAL
      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
        "Anda sudah pernah voting"
      );
    });

    it("should reject vote for invalid candidate", async function () {
      const { voting, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Vote untuk kandidat yang tidak ada (index 99)
      await expect(voting.connect(voter1).vote(99)).to.be.revertedWith(
        "Kandidat tidak valid"
      );
    });

    it("should emit Voted event", async function () {
      const { voting, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Cek event Voted dipancarkan
      await expect(voting.connect(voter1).vote(0))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 0);
    });

    it("should reject vote after deadline", async function () {
      const { voting, owner, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Owner set deadline 1 menit dari sekarang
      await voting.setDeadline(1);

      // Maju waktu 2 menit (melewati deadline)
      await time.increase(2 * 60);

      // Vote setelah deadline → harus GAGAL
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWith(
        "Voting sudah ditutup (melewati deadline)"
      );
    });

    it("should increment total voters count", async function () {
      const { voting, voter1, voter2 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Awalnya 0 voter
      expect(await voting.totalVoters()).to.equal(0);

      // Setelah 2 orang vote
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(1);

      expect(await voting.totalVoters()).to.equal(2);
    });
  });

  // ============================
  // TEST 11: RESULTS / GET WINNER
  // ============================

  describe("Results", function () {
    it("should return the correct winner", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Budi (index 0) mendapat 2 vote, Siti (index 1) mendapat 1 vote
      await voting.connect(voter1).vote(0); // vote Budi
      await voting.connect(voter2).vote(0); // vote Budi
      await voting.connect(voter3).vote(1); // vote Siti

      // Pemenang harus Budi dengan 2 suara
      const [winnerName, winnerVoteCount] = await voting.getWinner();
      expect(winnerName).to.equal("Budi");
      expect(winnerVoteCount).to.equal(2);
    });

    it("should revert if quorum not reached", async function () {
      const { voting, voter1 } = await loadFixture(
        deployWithCandidatesFixture
      );

      // Hanya 1 voter (quorum = 2)
      await voting.connect(voter1).vote(0);

      // Quorum belum tercapai → harus GAGAL
      await expect(voting.getWinner()).to.be.revertedWith(
        "Quorum belum tercapai"
      );
    });

    it("should revert if no candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Belum ada kandidat → harus GAGAL
      await expect(voting.getWinner()).to.be.revertedWith(
        "Belum ada kandidat"
      );
    });
  });

  // ============================
  // TEST 12-13: ACCESS CONTROL
  // ============================

  describe("Access Control", function () {
    it("should allow owner to set deadline", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      // Owner set deadline → harus berhasil
      await expect(voting.setDeadline(60))
        .to.emit(voting, "DeadlineSet");

      // Deadline harus terisi (bukan 0)
      expect(await voting.votingDeadline()).to.be.greaterThan(0);
    });

    it("should reject non-owner from setting deadline", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);

      // voter1 (bukan owner) set deadline → harus GAGAL
      await expect(
        voting.connect(voter1).setDeadline(60)
      ).to.be.revertedWith("Hanya owner yang bisa melakukan ini");
    });
  });
});
