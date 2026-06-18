const hre = require("hardhat");

async function main() {
  const blocksToMine = 10;
  for (let i = 0; i < blocksToMine; i++) {
    await hre.network.provider.send("evm_mine");
  }
  console.log(`Mined ${blocksToMine} dummy blocks to help MetaMask sync.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
