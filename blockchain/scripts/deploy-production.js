const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`Deploying to network: ${networkName} (Chain ID: ${chainId})`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  // Deploy the contract (replace with your actual contract name)
  console.log("Deploying contract...");
  const ContractFactory = await hre.ethers.getContractFactory("YourContractName");
  
  // Add constructor arguments if needed
  const contract = await ContractFactory.deploy(/* constructor args */);
  
  await contract.deployed();
  
  console.log("Contract deployed to:", contract.address);
  console.log("Transaction hash:", contract.deployTransaction.hash);
  
  // Wait for a few confirmations on non-local networks
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("Waiting for confirmations...");
    await contract.deployTransaction.wait(3);
    console.log("Contract confirmed!");
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: chainId,
    contractAddress: contract.address,
    deployerAddress: deployer.address,
    transactionHash: contract.deployTransaction.hash,
    timestamp: new Date().toISOString(),
    blockNumber: contract.deployTransaction.blockNumber
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`Deployment info saved to: ${deploymentFile}`);
  
  // Generate environment variables
  console.log("\n=== ENVIRONMENT VARIABLES ===");
  console.log(`BLOCKCHAIN_NODE_URL=${hre.network.config.url}`);
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${contract.address}`);
  console.log(`BLOCKCHAIN_ADMIN_PRIVATE_KEY=${process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY || "YOUR_PRIVATE_KEY"}`);
  console.log(`BLOCKCHAIN_NETWORK_ID=${chainId}`);
  console.log(`BLOCKCHAIN_NETWORK_NAME=${networkName}`);
  
  // Verify contract on Etherscan (if not local network)
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n=== CONTRACT VERIFICATION ===");
    console.log("To verify your contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${networkName} ${contract.address}`);
    
    // Auto-verify if API key is available
    try {
      if (process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY || process.env.ARBISCAN_API_KEY) {
        console.log("Attempting automatic verification...");
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: [/* constructor args */],
        });
        console.log("Contract verified successfully!");
      }
    } catch (error) {
      console.log("Verification failed (this is normal if contract is already verified):", error.message);
    }
  }
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log(`Network: ${networkName}`);
  console.log(`Contract Address: ${contract.address}`);
  console.log(`Explorer URL: ${getExplorerUrl(networkName, contract.address)}`);
}

function getExplorerUrl(networkName, address) {
  const explorers = {
    mainnet: `https://etherscan.io/address/${address}`,
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    goerli: `https://goerli.etherscan.io/address/${address}`,
    polygon: `https://polygonscan.com/address/${address}`,
    mumbai: `https://mumbai.polygonscan.com/address/${address}`,
    arbitrum: `https://arbiscan.io/address/${address}`,
    arbitrumSepolia: `https://sepolia.arbiscan.io/address/${address}`,
  };
  
  return explorers[networkName] || `Address: ${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });