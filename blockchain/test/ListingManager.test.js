const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ListingManager", function () {
    let registry, listingManager;
    let owner, companySigner, vendorSigner, other;

    const companyShareId = "SH-COMP001";
    const vendorShareId = "SH-VEND001";

    beforeEach(async function () {
        [owner, companySigner, vendorSigner, other] = await ethers.getSigners();

        // Deploy Registry
        const RAPPRegistry = await ethers.getContractFactory("RAPPRegistry");
        registry = await RAPPRegistry.deploy();
        await registry.waitForDeployment();

        // Deploy ListingManager
        const ListingManager = await ethers.getContractFactory("ListingManager");
        listingManager = await ListingManager.deploy(await registry.getAddress());
        await listingManager.waitForDeployment();

        // Register company
        await registry.connect(companySigner).registerEntity(companyShareId, "Company 1", 0, "ch1");
        await registry.connect(vendorSigner).registerEntity(vendorShareId, "Vendor 1", 1, "vh1");
    });

    describe("Create Listing", function () {
        it("Should create a public listing", async function () {
            const tx = await listingManager.connect(companySigner).createListing(
                "LST-ABC1234567",
                companyShareId,
                "contentHash123",
                1000,
                0, // PUBLIC
                1, // ACTIVE
                0,
                0,
                []
            );
            await tx.wait();

            const listing = await listingManager.getListing(1);
            expect(listing.listingNumber).to.equal("LST-ABC1234567");
            expect(listing.companyShareId).to.equal(companyShareId);
            expect(listing.visibility).to.equal(0); // PUBLIC
            expect(listing.status).to.equal(1); // ACTIVE
        });

        it("Should create a private listing with authorized vendors", async function () {
            const tx = await listingManager.connect(companySigner).createListing(
                "LST-PRIVATE001",
                companyShareId,
                "contentHash456",
                2000,
                1, // PRIVATE
                1, // ACTIVE
                0,
                0,
                [vendorShareId]
            );
            await tx.wait();

            expect(await listingManager.isVendorAuthorized(1, vendorShareId)).to.be.true;
            expect(await listingManager.isVendorAuthorized(1, "SH-OTHER")).to.be.false;
        });

        it("Should reject listing from unregistered company", async function () {
            await expect(
                listingManager.connect(other).createListing(
                    "LST-FAIL", "SH-FAKE", "hash", 100, 0, 1, 0, 0, []
                )
            ).to.be.revertedWith("Company not registered");
        });

        it("Should reject duplicate listing numbers", async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-DUP001", companyShareId, "h1", 100, 0, 1, 0, 0, []
            );
            await expect(
                listingManager.connect(companySigner).createListing(
                    "LST-DUP001", companyShareId, "h2", 200, 0, 1, 0, 0, []
                )
            ).to.be.revertedWith("Listing number already exists");
        });

        it("Should emit ListingCreated event", async function () {
            await expect(
                listingManager.connect(companySigner).createListing(
                    "LST-EVT001", companyShareId, "hash", 100, 0, 1, 0, 0, []
                )
            ).to.emit(listingManager, "ListingCreated");
        });

        it("Public listing should authorize all vendors", async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-PUB001", companyShareId, "hash", 100, 0, 1, 0, 0, []
            );
            // Public listings allow any vendor
            expect(await listingManager.isVendorAuthorized(1, "SH-ANYVENDOR")).to.be.true;
        });
    });

    describe("Update / Close / Cancel", function () {
        beforeEach(async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-UPD001", companyShareId, "oldHash", 500, 0, 1, 0, 0, []
            );
        });

        it("Should update a listing", async function () {
            await listingManager.connect(companySigner).updateListing(1, "newHash", 1);
            const listing = await listingManager.getListing(1);
            expect(listing.contentHash).to.equal("newHash");
        });

        it("Should close an active listing", async function () {
            await listingManager.connect(companySigner).closeListing(1);
            const listing = await listingManager.getListing(1);
            expect(listing.status).to.equal(2); // CLOSED
        });

        it("Should cancel a listing", async function () {
            await listingManager.connect(companySigner).cancelListing(1);
            const listing = await listingManager.getListing(1);
            expect(listing.status).to.equal(3); // CANCELLED
        });

        it("Should reject unauthorized update", async function () {
            await expect(
                listingManager.connect(other).updateListing(1, "hack", 1)
            ).to.be.revertedWith("Only listing owner or contract owner");
        });
    });

    describe("Vendor Access Control", function () {
        beforeEach(async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-PRV001", companyShareId, "hash", 300, 1, 1, 0, 0, []
            );
        });

        it("Should grant vendor access", async function () {
            await listingManager.connect(companySigner).grantVendorAccess(1, vendorShareId);
            expect(await listingManager.isVendorAuthorized(1, vendorShareId)).to.be.true;
        });

        it("Should revoke vendor access", async function () {
            await listingManager.connect(companySigner).grantVendorAccess(1, vendorShareId);
            await listingManager.connect(companySigner).revokeVendorAccess(1, vendorShareId);
            expect(await listingManager.isVendorAuthorized(1, vendorShareId)).to.be.false;
        });

        it("Should reject granting duplicate access", async function () {
            await listingManager.connect(companySigner).grantVendorAccess(1, vendorShareId);
            await expect(
                listingManager.connect(companySigner).grantVendorAccess(1, vendorShareId)
            ).to.be.revertedWith("Vendor already authorized");
        });
    });

    describe("View Functions", function () {
        it("Should return listings by company", async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-V1", companyShareId, "h1", 100, 0, 1, 0, 0, []
            );
            await listingManager.connect(companySigner).createListing(
                "LST-V2", companyShareId, "h2", 200, 0, 1, 0, 0, []
            );

            const listingIds = await listingManager.getListingsByCompany(companyShareId);
            expect(listingIds.length).to.equal(2);
        });

        it("Should lookup listing by number", async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-LOOK001", companyShareId, "h1", 100, 0, 1, 0, 0, []
            );

            const id = await listingManager.getListingByNumber("LST-LOOK001");
            expect(id).to.equal(1);
        });

        it("isListingActive should check status", async function () {
            await listingManager.connect(companySigner).createListing(
                "LST-ACT001", companyShareId, "h1", 100, 0, 1, 0, 0, []
            );
            expect(await listingManager.isListingActive(1)).to.be.true;

            await listingManager.connect(companySigner).closeListing(1);
            expect(await listingManager.isListingActive(1)).to.be.false;
        });
    });
});
