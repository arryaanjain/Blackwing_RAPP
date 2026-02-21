const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RAPPRegistry", function () {
  let registry;
  let owner, company, vendor, other;

  beforeEach(async function () {
    [owner, company, vendor, other] = await ethers.getSigners();
    const RAPPRegistry = await ethers.getContractFactory("RAPPRegistry");
    registry = await RAPPRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Registration", function () {
    it("Should register a company entity", async function () {
      const tx = await registry.connect(company).registerEntity(
        "SH-COMP123456",
        "Acme Corp",
        0, // COMPANY
        "metahash123"
      );
      await tx.wait();

      const entity = await registry.getEntity("SH-COMP123456");
      expect(entity.shareId).to.equal("SH-COMP123456");
      expect(entity.name).to.equal("Acme Corp");
      expect(entity.entityType).to.equal(0); // COMPANY
      expect(entity.registrar).to.equal(company.address);
      expect(entity.isActive).to.be.true;
    });

    it("Should register a vendor entity", async function () {
      const tx = await registry.connect(vendor).registerEntity(
        "SH-VEND789012",
        "John Services",
        1, // VENDOR
        "metahash456"
      );
      await tx.wait();

      const entity = await registry.getEntity("SH-VEND789012");
      expect(entity.name).to.equal("John Services");
      expect(entity.entityType).to.equal(1); // VENDOR
      expect(entity.isActive).to.be.true;
    });

    it("Should emit EntityRegistered event", async function () {
      await expect(
        registry.connect(company).registerEntity("SH-COMP123456", "Acme Corp", 0, "hash")
      )
        .to.emit(registry, "EntityRegistered")
        .withArgs("SH-COMP123456", "Acme Corp", 0, company.address, await getBlockTimestamp());
    });

    it("Should reject duplicate shareIds", async function () {
      await registry.connect(company).registerEntity("SH-COMP123456", "Acme Corp", 0, "hash");
      await expect(
        registry.connect(vendor).registerEntity("SH-COMP123456", "Another", 1, "hash2")
      ).to.be.revertedWith("Share ID already registered");
    });

    it("Should reject empty shareId", async function () {
      await expect(
        registry.connect(company).registerEntity("", "Name", 0, "hash")
      ).to.be.revertedWith("Share ID cannot be empty");
    });

    it("Should reject empty name", async function () {
      await expect(
        registry.connect(company).registerEntity("SH-123", "", 0, "hash")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should increment counters correctly", async function () {
      await registry.connect(company).registerEntity("SH-C1", "Company 1", 0, "h1");
      await registry.connect(vendor).registerEntity("SH-V1", "Vendor 1", 1, "h2");
      await registry.connect(other).registerEntity("SH-C2", "Company 2", 0, "h3");

      expect(await registry.totalCompanies()).to.equal(2);
      expect(await registry.totalVendors()).to.equal(1);
    });
  });

  describe("Deactivation / Reactivation", function () {
    beforeEach(async function () {
      await registry.connect(company).registerEntity("SH-COMP123456", "Acme", 0, "hash");
    });

    it("Should deactivate an entity", async function () {
      await registry.connect(company).deactivateEntity("SH-COMP123456");
      expect(await registry.isRegistered("SH-COMP123456")).to.be.false;
      expect(await registry.exists("SH-COMP123456")).to.be.true;
    });

    it("Should reactivate an entity", async function () {
      await registry.connect(company).deactivateEntity("SH-COMP123456");
      await registry.connect(company).reactivateEntity("SH-COMP123456");
      expect(await registry.isRegistered("SH-COMP123456")).to.be.true;
    });

    it("Owner can deactivate any entity", async function () {
      await registry.connect(owner).deactivateEntity("SH-COMP123456");
      expect(await registry.isRegistered("SH-COMP123456")).to.be.false;
    });

    it("Should reject deactivation by unrelated party", async function () {
      await expect(
        registry.connect(other).deactivateEntity("SH-COMP123456")
      ).to.be.revertedWith("Only registrar or owner");
    });
  });

  describe("Metadata Update", function () {
    beforeEach(async function () {
      await registry.connect(company).registerEntity("SH-COMP123456", "Acme", 0, "oldhash");
    });

    it("Should update metadata hash", async function () {
      await registry.connect(company).updateMetadata("SH-COMP123456", "newhash");
      const entity = await registry.getEntity("SH-COMP123456");
      expect(entity.metadataHash).to.equal("newhash");
    });

    it("Should emit MetadataUpdated event", async function () {
      await expect(
        registry.connect(company).updateMetadata("SH-COMP123456", "newhash")
      ).to.emit(registry, "MetadataUpdated");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await registry.connect(company).registerEntity("SH-C1", "Co 1", 0, "h1");
      await registry.connect(company).registerEntity("SH-C2", "Co 2", 0, "h2");
    });

    it("Should return entities by registrar", async function () {
      const shareIds = await registry.getEntitiesByRegistrar(company.address);
      expect(shareIds.length).to.equal(2);
      expect(shareIds[0]).to.equal("SH-C1");
      expect(shareIds[1]).to.equal("SH-C2");
    });

    it("Should return platform stats", async function () {
      await registry.connect(vendor).registerEntity("SH-V1", "Vendor 1", 1, "h3");
      const stats = await registry.getPlatformStats();
      expect(stats.companies).to.equal(2);
      expect(stats.vendors).to.equal(1);
      expect(stats.total).to.equal(3);
    });

    it("Should revert for non-existent entity", async function () {
      await expect(registry.getEntity("SH-FAKE")).to.be.revertedWith("Entity does not exist");
    });
  });
});

async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp + 1; // approximate next block
}
