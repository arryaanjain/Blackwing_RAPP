const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RegistrationContract...");

  // Get the contract factory
  const RegistrationContract = await ethers.getContractFactory("RegistrationContract");

  // Deploy the contract
  const registrationContract = await RegistrationContract.deploy();

  // Wait for deployment to complete
  await registrationContract.waitForDeployment();

  const contractAddress = await registrationContract.getAddress();
  
  console.log("✅ RegistrationContract deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", registrationContract.deploymentTransaction().hash);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    transactionHash: registrationContract.deploymentTransaction().hash,
    network: "localhost",
    deployedAt: new Date().toISOString(),
    contractName: "RegistrationContract"
  };
  
  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify deployment by calling a function
  const owner = await registrationContract.owner();
  const totalRegistrations = await registrationContract.totalRegistrations();
  
  console.log("\n🔍 Contract Verification:");
  console.log("Owner:", owner);
  console.log("Total Registrations:", totalRegistrations.toString());
  
  return {
    contract: registrationContract,
    address: contractAddress,
    deploymentInfo
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
