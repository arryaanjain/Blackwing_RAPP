const { ethers } = require("hardhat");

/**
 * Unified deployment script for all RAPP smart contracts.
 *
 * Deploy order (dependency graph):
 *   1. RAPPRegistry        (standalone)
 *   2. RAPPToken            (standalone)
 *   3. ConnectionManager    (depends on RAPPRegistry)
 *   4. ListingManager       (depends on RAPPRegistry)
 *   5. QuoteManager         (depends on RAPPRegistry + ListingManager)
 *
 * After deployment, authorize ListingManager and QuoteManager
 * as deductors on RAPPToken so they can burn points.
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    console.log("---");

    // ──────────────── 1. RAPPRegistry ────────────────
    console.log("Deploying RAPPRegistry...");
    const RAPPRegistry = await ethers.getContractFactory("RAPPRegistry");
    const registry = await RAPPRegistry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("  ✅ RAPPRegistry deployed to:", registryAddress);

    // ──────────────── 2. RAPPToken ────────────────
    console.log("Deploying RAPPToken...");
    const RAPPToken = await ethers.getContractFactory("RAPPToken");
    const rappToken = await RAPPToken.deploy(1, 1); // costListing=1, costQuote=1
    await rappToken.waitForDeployment();
    const tokenAddress = await rappToken.getAddress();
    console.log("  ✅ RAPPToken deployed to:", tokenAddress);

    // ──────────────── 3. ConnectionManager ────────────────
    console.log("Deploying ConnectionManager...");
    const ConnectionManager = await ethers.getContractFactory("ConnectionManager");
    const connectionManager = await ConnectionManager.deploy(registryAddress);
    await connectionManager.waitForDeployment();
    const connectionManagerAddress = await connectionManager.getAddress();
    console.log("  ✅ ConnectionManager deployed to:", connectionManagerAddress);

    // ──────────────── 4. ListingManager ────────────────
    console.log("Deploying ListingManager...");
    const ListingManager = await ethers.getContractFactory("ListingManager");
    const listingManager = await ListingManager.deploy(registryAddress);
    await listingManager.waitForDeployment();
    const listingManagerAddress = await listingManager.getAddress();
    console.log("  ✅ ListingManager deployed to:", listingManagerAddress);

    // ──────────────── 5. QuoteManager ────────────────
    console.log("Deploying QuoteManager...");
    const QuoteManager = await ethers.getContractFactory("QuoteManager");
    const quoteManager = await QuoteManager.deploy(registryAddress, listingManagerAddress);
    await quoteManager.waitForDeployment();
    const quoteManagerAddress = await quoteManager.getAddress();
    console.log("  ✅ QuoteManager deployed to:", quoteManagerAddress);

    // ──────────────── 6. RAPPAuction ────────────────
    console.log("Deploying RAPPAuction...");
    const RAPPAuction = await ethers.getContractFactory("RAPPAuction");
    const rappAuction = await RAPPAuction.deploy(registryAddress);
    await rappAuction.waitForDeployment();
    const auctionAddress = await rappAuction.getAddress();
    console.log("  ✅ RAPPAuction deployed to:", auctionAddress);

    // ──────────────── Post-Deployment: Authorize Deductors ────────────────
    console.log("\n--- Authorizing deductors on RAPPToken ---");

    // Authorize the deployer itself (backend uses this to deduct)
    // ListingManager and QuoteManager could call deduct in future integration
    console.log("Authorizing deployer as deductor...");
    const tx1 = await rappToken.authorizeDeductor(deployer.address);
    await tx1.wait();
    console.log("  ✅ Deployer authorized as deductor");

    // ──────────────── Summary ────────────────
    console.log("\n========================================");
    console.log("  DEPLOYMENT SUMMARY");
    console.log("========================================");
    console.log(`  RAPPRegistry:       ${registryAddress}`);
    console.log(`  RAPPToken:          ${tokenAddress}`);
    console.log(`  ConnectionManager:  ${connectionManagerAddress}`);
    console.log(`  ListingManager:     ${listingManagerAddress}`);
    console.log(`  QuoteManager:       ${quoteManagerAddress}`);
    console.log(`  RAPPAuction:        ${auctionAddress}`);
    console.log("========================================");
    console.log("\n✅ All contracts deployed successfully!");
    console.log("\nNext steps:");
    console.log("  1. Update backend .env with new contract addresses");
    console.log("  2. Copy ABIs to backend/storage/blockchain/artifacts");
    console.log("  3. Update BlockchainService.php to use new contracts");

    return {
        registry: registryAddress,
        token: tokenAddress,
        connectionManager: connectionManagerAddress,
        listingManager: listingManagerAddress,
        quoteManager: quoteManagerAddress,
        auction: auctionAddress,
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
