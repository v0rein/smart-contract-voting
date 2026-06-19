const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SimpleVoting (Advanced)", function () {
  // ============================
  // FIXTURE: Setup
  // ============================

  async function deployVotingFixture() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    const voting = await SimpleVoting.deploy(); 

    return { voting, owner, voter1, voter2, voter3 };
  }

  async function deployWithCandidatesFixture() {
    const { voting, owner, voter1, voter2, voter3 } = await loadFixture(
      deployVotingFixture
    );

    // Tambah 3 kandidat
    await voting.addCandidate("Budi");
    await voting.addCandidate("Siti");
    await voting.addCandidate("Andi");

    // Buka voting
    await voting.setVotingStatus(true);

    // Daftarkan voter
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.registerVoter(voter3.address);

    return { voting, owner, voter1, voter2, voter3 };
  }

  // ============================
  // TEST: DEPLOYMENT
  // ============================

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("should initialize with zero candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.getCandidateCount()).to.equal(0);
    });

    it("should default minimum quorum to 2", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.minimumQuorum()).to.equal(2);
    });
  });

  // ============================
  // TEST: ADD CANDIDATE
  // ============================

  describe("Add Candidate", function () {
    it("should allow owner to add a candidate", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      await voting.addCandidate("Budi");
      expect(await voting.getCandidateCount()).to.equal(1);

      // candidates(1) since id is 1-indexed
      const candidate = await voting.candidates(1);
      expect(candidate.name).to.equal("Budi");
      expect(candidate.voteCount).to.equal(0);
    });

    it("should emit CandidateAdded event", async function () {
      const { voting } = await loadFixture(deployVotingFixture);

      await expect(voting.addCandidate("Budi"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, "Budi"); 
    });
  });

  // ============================
  // TEST: WHITELIST VOTER
  // ============================

  describe("Whitelist Voter", function () {
    it("should allow owner to register voter", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);

      await expect(voting.registerVoter(voter1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter1.address);

      expect(await voting.registeredVoters(voter1.address)).to.be.true;
      expect(await voting.registeredVotersCount()).to.equal(1);
    });

    it("should reject non-owner from registering voter", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployVotingFixture);

      await expect(
        voting.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWith("Hanya owner yang bisa melakukan ini");
    });
  });

  // ============================
  // TEST: VOTING & TIME-BASED
  // ============================

  describe("Voting", function () {
    it("should allow a registered user to vote", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);

      await voting.connect(voter1).vote(1); // 1-indexed (Budi)

      const candidate = await voting.candidates(1);
      expect(candidate.voteCount).to.equal(1);
      expect(await voting.hasVoted(voter1.address)).to.be.true;
    });

    it("should reject unregistered user from voting", async function () {
      const { voting, owner } = await loadFixture(deployWithCandidatesFixture);
      // owner is not registered in deployWithCandidatesFixture
      await expect(voting.connect(owner).vote(1)).to.be.revertedWith("Anda tidak terdaftar sebagai voter");
    });

    it("should reject double voting", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);

      await voting.connect(voter1).vote(1);
      await expect(voting.connect(voter1).vote(2)).to.be.revertedWith("Anda sudah melakukan voting");
    });

    it("should reject if voting is closed", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await voting.setVotingStatus(false);

      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Voting belum dibuka atau sudah ditutup");
    });

    it("should reject vote outside voting period (if set)", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);

      const now = await time.latest();
      await voting.setVotingPeriod(now + 3600, now + 7200); // starts in 1 hour

      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Voting belum dimulai");

      await time.increase(4000); // inside period
      await voting.connect(voter1).vote(1); // success

      await time.increase(4000); // outside period
      await expect(voting.connect(voter2).vote(1)).to.be.revertedWith("Voting sudah berakhir");
    });
  });

  // ============================
  // TEST: DELEGATED VOTING
  // ============================

  describe("Delegated Voting", function () {
    it("should allow voter to delegate to another registered voter", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);

      await expect(voting.connect(voter1).delegate(voter2.address))
        .to.emit(voting, "VoteDelegated")
        .withArgs(voter1.address, voter2.address);

      expect(await voting.delegations(voter1.address)).to.equal(voter2.address);
      
      // Voter 2 weight should be 2 (default 1 + 1 delegator)
      expect(await voting.customWeights(voter2.address)).to.equal(2);
    });

    it("should prevent circular delegation", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);

      await voting.connect(voter1).delegate(voter2.address);
      await expect(voting.connect(voter2).delegate(voter1.address)).to.be.revertedWith("Circular delegation tidak diperbolehkan");
    });
  });

  // ============================
  // TEST: RESULTS / GET WINNER
  // ============================

  describe("Results", function () {
    it("should return the correct winner", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(deployWithCandidatesFixture);

      await voting.connect(voter1).vote(1); // vote Budi
      await voting.connect(voter2).vote(1); // vote Budi
      await voting.connect(voter3).vote(2); // vote Siti

      const [winnerName, winnerVoteCount] = await voting.getWinner();
      expect(winnerName).to.equal("Budi");
      expect(winnerVoteCount).to.equal(2);
    });

    it("should revert if minimum quorum is not met", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).vote(1); // Only 1 vote
      
      // minimumQuorum is 2
      await expect(voting.getWinner()).to.be.revertedWith("Quorum belum tercapai");
    });

    it("should get all candidates", async function () {
      const { voting } = await loadFixture(deployWithCandidatesFixture);
      const allCandidates = await voting.getAllCandidates();
      expect(allCandidates.length).to.equal(3);
      expect(allCandidates[0].name).to.equal("Budi");
      expect(allCandidates[1].name).to.equal("Siti");
      expect(allCandidates[2].name).to.equal("Andi");
    });

    it("should get total votes", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(2);
      expect(await voting.getTotalVotes()).to.equal(2);
    });

    it("should check if voted", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).vote(1);
      expect(await voting.checkIfVoted(voter1.address)).to.be.true;
      expect(await voting.checkIfVoted(voter2.address)).to.be.false;
    });
  });

  // ============================
  // TEST: ADMIN SETTINGS
  // ============================
  describe("Admin Settings", function () {
    it("should set minimum quorum", async function () {
      const { voting } = await loadFixture(deployWithCandidatesFixture);
      await voting.setMinimumQuorum(5);
      expect(await voting.minimumQuorum()).to.equal(5);
    });

    it("should set voter weight", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await voting.setVoterWeight(voter1.address, 10);
      expect(await voting.customWeights(voter1.address)).to.equal(10);
    });
  });

  // ============================
  // TEST: EDGE CASES & REVERTS (For Branch Coverage)
  // ============================
  describe("Edge Cases & Branch Coverage", function () {
    it("should revert addCandidate with empty name", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await expect(voting.addCandidate("")).to.be.revertedWith("Nama tidak boleh kosong");
    });

    it("should revert setVotingPeriod if end time <= start time", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await expect(voting.setVotingPeriod(1000, 1000)).to.be.revertedWith("End time harus lebih besar dari start time");
      await expect(voting.setVotingPeriod(2000, 1000)).to.be.revertedWith("End time harus lebih besar dari start time");
    });

    it("should revert registerVoter if already registered", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await expect(voting.registerVoter(voter1.address)).to.be.revertedWith("Voter sudah terdaftar");
    });

    it("should revert setVoterWeight if weight is 0", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await expect(voting.setVoterWeight(voter1.address, 0)).to.be.revertedWith("Bobot harus lebih dari 0");
    });

    it("should revert vote for invalid candidate id", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Kandidat tidak valid");
      await expect(voting.connect(voter1).vote(99)).to.be.revertedWith("Kandidat tidak valid");
    });

    it("should revert vote if voter has delegated their vote", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).delegate(voter2.address);
      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Anda sudah mendelegasikan suara Anda");
    });

    it("should vote with custom weight correctly", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await voting.setVoterWeight(voter1.address, 5);
      await voting.connect(voter1).vote(1);
      const candidate = await voting.candidates(1);
      expect(candidate.voteCount).to.equal(5);
    });

    it("should revert delegate if already voted", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).vote(1);
      await expect(voting.connect(voter1).delegate(voter2.address)).to.be.revertedWith("Anda sudah vote, tidak bisa delegate");
    });

    it("should revert delegate to self", async function () {
      const { voting, voter1 } = await loadFixture(deployWithCandidatesFixture);
      await expect(voting.connect(voter1).delegate(voter1.address)).to.be.revertedWith("Tidak bisa delegate ke diri sendiri");
    });

    it("should revert delegate to unregistered voter", async function () {
      const { voting, voter1, owner } = await loadFixture(deployWithCandidatesFixture);
      // owner is not registered
      await expect(voting.connect(voter1).delegate(owner.address)).to.be.revertedWith("Tujuan delegasi harus voter terdaftar");
    });

    it("should handle getWinner when there is a tie or lower vote count (branch coverage)", async function () {
      const { voting, voter1, voter2, voter3 } = await loadFixture(deployWithCandidatesFixture);
      await voting.connect(voter1).vote(1); // Budi = 1
      await voting.connect(voter2).vote(2); // Siti = 1 (Tie branch)
      await voting.connect(voter3).vote(3); // Andi = 1 (Tie branch)
      
      const [winnerName, winnerVoteCount] = await voting.getWinner();
      // First candidate with highest vote will win in this simple logic
      expect(winnerName).to.equal("Budi");
      expect(winnerVoteCount).to.equal(1);
    });
  });
});
