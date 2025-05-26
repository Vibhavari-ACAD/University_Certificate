const hre = require("hardhat");

async function main() {
  const UniversityCert = await hre.ethers.getContractFactory("UniversityCert");
  const contract = await UniversityCert.deploy();
  await contract.deployed();

  console.log("✅ Deployed to:", contract.address);
  console.log("📢 Paste this address into your frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
