const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  // Cek apakah address sudah diganti
  if (CONTRACT_ADDRESS === "PASTE_CONTRACT_ADDRESS_HERE") {
    console.log("❌ ERROR: Anda belum mengganti CONTRACT_ADDRESS!");
    console.log(
      "   1. Deploy contract dulu: npx hardhat run scripts/deploy.js --network localhost",
    );
    console.log("   2. Copy contract address dari output deploy");
    console.log("   3. Paste ke variabel CONTRACT_ADDRESS di file ini");
    process.exit(1);
  }

  console.log("===========================================");
  console.log("  Interacting with SimpleVoting Contract");
  console.log("===========================================\n");

  // Ambil akun-akun dari Hardhat
  const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();

  // Hubungkan ke contract yang sudah di-deploy
  const voting = await hre.ethers.getContractAt(
    "SimpleVoting",
    CONTRACT_ADDRESS,
  );

  // --- Info Awal ---
  console.log("📋 Info Contract:");
  console.log("   Owner:", await voting.owner());
  console.log("   Minimum Quorum:", (await voting.minimumQuorum()).toString());

  const candidateCount = await voting.getCandidateCount();
  console.log(`   Jumlah Kandidat: ${candidateCount}\n`);

  // --- Tampilkan Kandidat ---
  console.log("📝 Daftar Kandidat:");
  for (let i = 0; i < candidateCount; i++) {
    const [name, voteCount] = await voting.getCandidate(i);
    console.log(`   [${i}] ${name} - ${voteCount} votes`);
  }

  // --- Simulasi Voting ---
  console.log("\n🗳️  Simulasi Voting:");

  // Helper function untuk vote dengan pengecekan
  async function tryVote(voterSigner, candidateId, voterLabel) {
    const alreadyVoted = await voting.hasVoted(voterSigner.address);
    if (alreadyVoted) {
      console.log(
        `   ${voterLabel} (${voterSigner.address}) sudah pernah vote — dilewati`,
      );
      return;
    }
    try {
      const tx = await voting.connect(voterSigner).vote(candidateId);
      await tx.wait();
      console.log(
        `   ${voterLabel} (${voterSigner.address}) memilih kandidat ${candidateId}... ✅ Vote berhasil!`,
      );
    } catch (error) {
      console.log(
        `   ${voterLabel} gagal vote: ${error.reason || error.message}`,
      );
    }
  }

  await tryVote(voter1, 0, "Voter1"); // vote Budi
  await tryVote(voter2, 0, "Voter2"); // vote Budi
  await tryVote(voter3, 1, "Voter3"); // vote Siti

  // --- Hasil Akhir ---
  console.log("\n📊 Hasil Voting:");
  for (let i = 0; i < candidateCount; i++) {
    const [name, voteCount] = await voting.getCandidate(i);
    const bar = "█".repeat(Number(voteCount));
    console.log(`   [${i}] ${name}: ${voteCount} votes ${bar}`);
  }

  // --- Pemenang ---
  console.log("\n🏆 Pemenang:");
  const [winnerName, winnerVoteCount] = await voting.getWinner();
  console.log(`   ${winnerName} dengan ${winnerVoteCount} suara!`);

  console.log("\n===========================================");
  console.log("  Interaction Complete!");
  console.log("===========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
