const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy RegistrationContract (more advanced registration features)
  const RegistrationContract = await hre.ethers.getContractFactory("RegistrationContract");
  const registration = await RegistrationContract.deploy();
  
  await registration.waitForDeployment();
  
  console.log("RegistrationContract deployed to:", registration.target);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: registration.target,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    network: hre.network.name
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
