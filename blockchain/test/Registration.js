const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RAPPRegistration", function () {
  let rappRegistration;
  let owner;
  let company;
  let vendor;

  beforeEach(async function () {
    [owner, company, vendor] = await ethers.getSigners();
    
    const RAPPRegistration = await ethers.getContractFactory("RAPPRegistration");
    rappRegistration = await RAPPRegistration.deploy();
    await rappRegistration.waitForDeployment();
  });

  describe("Company Registration", function () {
    it("Should register a company successfully", async function () {
      const companyName = "Tech Corp";
      const shareId = "SH-COMP123456";
      const businessType = "Technology";
      const location = "New York";

      const tx = await rappRegistration.connect(company).registerCompany(
        companyName,
        shareId,
        businessType,
        location
      );

      // Wait for transaction to be mined
      await tx.wait();

      // Check if company is registered
      const companyData = await rappRegistration.getCompany(company.address);
      
      expect(companyData[0]).to.equal(companyName); // name
      expect(companyData[1]).to.equal(shareId); // shareId
      expect(companyData[2]).to.equal(businessType); // businessType
      expect(companyData[3]).to.equal(location); // location
      expect(companyData[6]).to.equal(true); // isActive
    });

    it("Should emit CompanyRegistered event", async function () {
      const companyName = "Tech Corp";
      const shareId = "SH-COMP123456";
      const businessType = "Technology";
      const location = "New York";

      await expect(
        rappRegistration.connect(company).registerCompany(
          companyName,
          shareId,
          businessType,
          location
        )
      ).to.emit(rappRegistration, "CompanyRegistered")
        .withArgs(company.address, companyName, shareId);
    });

    it("Should not allow duplicate company registration", async function () {
      const companyName = "Tech Corp";
      const shareId = "SH-COMP123456";
      const businessType = "Technology";
      const location = "New York";

      // First registration
      await rappRegistration.connect(company).registerCompany(
        companyName,
        shareId,
        businessType,
        location
      );

      // Second registration should fail
      await expect(
        rappRegistration.connect(company).registerCompany(
          "Another Corp",
          "SH-COMP789012",
          "Finance",
          "California"
        )
      ).to.be.revertedWith("Company already registered");
    });
  });

  describe("Vendor Registration", function () {
    it("Should register a vendor successfully", async function () {
      const vendorName = "John Doe Services";
      const shareId = "SH-VEND123456";
      const specialization = "Web Development";
      const location = "Los Angeles";

      const tx = await rappRegistration.connect(vendor).registerVendor(
        vendorName,
        shareId,
        specialization,
        location
      );

      // Wait for transaction to be mined
      await tx.wait();

      // Check if vendor is registered
      const vendorData = await rappRegistration.getVendor(vendor.address);
      
      expect(vendorData[0]).to.equal(vendorName); // name
      expect(vendorData[1]).to.equal(shareId); // shareId
      expect(vendorData[2]).to.equal(specialization); // specialization
      expect(vendorData[3]).to.equal(location); // location
      expect(vendorData[6]).to.equal(true); // isActive
    });

    it("Should emit VendorRegistered event", async function () {
      const vendorName = "John Doe Services";
      const shareId = "SH-VEND123456";
      const specialization = "Web Development";
      const location = "Los Angeles";

      await expect(
        rappRegistration.connect(vendor).registerVendor(
          vendorName,
          shareId,
          specialization,
          location
        )
      ).to.emit(rappRegistration, "VendorRegistered")
        .withArgs(vendor.address, vendorName, shareId);
    });
  });

  describe("Registration Verification", function () {
    it("Should verify company registration on blockchain", async function () {
      const companyName = "Tech Corp";
      const shareId = "SH-COMP123456";
      const businessType = "Technology";
      const location = "New York";

      await rappRegistration.connect(company).registerCompany(
        companyName,
        shareId,
        businessType,
        location
      );

      const isRegistered = await rappRegistration.isCompanyRegistered(company.address);
      expect(isRegistered).to.equal(true);
    });

    it("Should verify vendor registration on blockchain", async function () {
      const vendorName = "John Doe Services";
      const shareId = "SH-VEND123456";
      const specialization = "Web Development";
      const location = "Los Angeles";

      await rappRegistration.connect(vendor).registerVendor(
        vendorName,
        shareId,
        specialization,
        location
      );

      const isRegistered = await rappRegistration.isVendorRegistered(vendor.address);
      expect(isRegistered).to.equal(true);
    });
  });
});
