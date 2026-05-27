const hre = require("hardhat");

async function main() {
  console.log("===========================================");
  console.log("  Deploying SimpleVoting Smart Contract");
  console.log("===========================================\n");

  // Ambil akun deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy contract dengan minimumQuorum = 2
  const minimumQuorum = 2;
  console.log("Minimum Quorum:", minimumQuorum);
  console.log("\nDeploying...\n");

  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting");
  const voting = await SimpleVoting.deploy(minimumQuorum);

  // Tunggu deployment selesai
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();
  console.log("✅ SimpleVoting deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);

  // Tambah beberapa kandidat awal untuk demo
  console.log("\n--- Menambahkan kandidat awal ---");

  await voting.addCandidate("Budi Santoso");
  console.log("✅ Kandidat ditambahkan: Budi Santoso");

  await voting.addCandidate("Siti Rahayu");
  console.log("✅ Kandidat ditambahkan: Siti Rahayu");

  await voting.addCandidate("Andi Pratama");
  console.log("✅ Kandidat ditambahkan: Andi Pratama");

  const candidateCount = await voting.getCandidateCount();
  console.log(`\nTotal kandidat: ${candidateCount}`);

  console.log("\n===========================================");
  console.log("  Deployment Complete!");
  console.log("===========================================");
  console.log(`\nGunakan contract address berikut di MetaMask:`);
  console.log(`  ${contractAddress}`);
  console.log(`\nUntuk berinteraksi, jalankan:`);
  console.log(`  npx hardhat run scripts/interact.js --network localhost`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
