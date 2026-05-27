const hre = require("hardhat");

const CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

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

  // Voter1 memilih Budi Santoso (index 0)
  let tx = await voting.connect(voter1).vote(0);
  await tx.wait();
  console.log(
    `   Voter1 (${voter1.address}) memilih kandidat 0... ✅ Vote berhasil!`,
  );

  // Voter2 memilih Budi Santoso (index 0)
  tx = await voting.connect(voter2).vote(0);
  await tx.wait();
  console.log(
    `   Voter2 (${voter2.address}) memilih kandidat 0... ✅ Vote berhasil!`,
  );

  // Voter3 memilih Siti Rahayu (index 1)
  tx = await voting.connect(voter3).vote(1);
  await tx.wait();
  console.log(
    `   Voter3 (${voter3.address}) memilih kandidat 1... ✅ Vote berhasil!`,
  );

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
