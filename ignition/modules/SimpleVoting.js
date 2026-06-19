const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SimpleVotingModule", (m) => {
  // Deploy contract SimpleVoting (constructor tanpa parameter)
  const voting = m.contract("SimpleVoting", []);

  // Tambahkan kandidat awal
  const addBudi = m.call(voting, "addCandidate", ["Budi Santoso"], { id: "addBudi" });
  const addSiti = m.call(voting, "addCandidate", ["Siti Rahayu"], { id: "addSiti", after: [addBudi] });
  const addAndi = m.call(voting, "addCandidate", ["Andi Pratama"], { id: "addAndi", after: [addSiti] });

  // Buka voting secara default agar langsung bisa digunakan
  m.call(voting, "setVotingStatus", [true], { id: "openVoting", after: [addAndi] });

  return { voting };
});
