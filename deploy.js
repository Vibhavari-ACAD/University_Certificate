const hre = require("hardhat");

async function main() {
  // Load the contract factory
  const UniversityCert = await hre.ethers.getContractFactory("UniversityCert");

  // Deploy the contract
  const universityCert = await UniversityCert.deploy();

  // Wait for the deployment to complete
  await universityCert.deployed();

  console.log("UniversityCert deployed to:", universityCert.address);
  const receipt = await universityCert.deployTransaction.wait();
  console.log("UniversityCert deployed by:", receipt.from);
}

main().catch((error) => {
  console.error("Error deploying contract:", error);
  process.exitCode = 1;
});
