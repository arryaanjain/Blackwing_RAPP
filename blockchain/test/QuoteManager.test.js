const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("QuoteManager", function () {
    let registry, listingManager, quoteManager;
    let owner, companySigner, vendorSigner, vendor2Signer;

    const companyShareId = "SH-COMP001";
    const vendorShareId = "SH-VEND001";
    const vendor2ShareId = "SH-VEND002";

    beforeEach(async function () {
        [owner, companySigner, vendorSigner, vendor2Signer] = await ethers.getSigners();

        // Deploy Registry
        const RAPPRegistry = await ethers.getContractFactory("RAPPRegistry");
        registry = await RAPPRegistry.deploy();
        await registry.waitForDeployment();

        // Deploy ListingManager
        const ListingManager = await ethers.getContractFactory("ListingManager");
        listingManager = await ListingManager.deploy(await registry.getAddress());
        await listingManager.waitForDeployment();

        // Deploy QuoteManager
        const QuoteManager = await ethers.getContractFactory("QuoteManager");
        quoteManager = await QuoteManager.deploy(
            await registry.getAddress(),
            await listingManager.getAddress()
        );
        await quoteManager.waitForDeployment();

        // Register entities
        await registry.connect(companySigner).registerEntity(companyShareId, "Company 1", 0, "ch1");
        await registry.connect(vendorSigner).registerEntity(vendorShareId, "Vendor 1", 1, "vh1");
        await registry.connect(vendor2Signer).registerEntity(vendor2ShareId, "Vendor 2", 1, "vh2");

        // Create a public active listing
        await listingManager.connect(companySigner).createListing(
            "LST-QUOTE001",
            companyShareId,
            "listingContent",
            5000,
            0, // PUBLIC
            1, // ACTIVE
            0,
            0,
            []
        );
    });

    describe("Submit Quote", function () {
        it("Should submit a quote successfully", async function () {
            const tx = await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-ABC1234567",
                1, // listingId
                vendorShareId,
                4500,
                "proposalHash123",
                30,
                0
            );
            await tx.wait();

            const quote = await quoteManager.getQuote(1);
            expect(quote.quoteNumber).to.equal("QUO-ABC1234567");
            expect(quote.listingId).to.equal(1);
            expect(quote.vendorShareId).to.equal(vendorShareId);
            expect(quote.quotedPrice).to.equal(4500);
            expect(quote.deliveryDays).to.equal(30);
            expect(quote.status).to.equal(0); // SUBMITTED
        });

        it("Should emit QuoteSubmitted event", async function () {
            await expect(
                quoteManager.connect(vendorSigner).submitQuote(
                    "QUO-EVT001", 1, vendorShareId, 4000, "hash", 15, 0
                )
            ).to.emit(quoteManager, "QuoteSubmitted");
        });

        it("Should reject quote from unregistered vendor", async function () {
            const [, , , , stranger] = await ethers.getSigners();
            await expect(
                quoteManager.connect(stranger).submitQuote(
                    "QUO-FAIL", 1, "SH-FAKE", 1000, "hash", 10, 0
                )
            ).to.be.revertedWith("Vendor not registered");
        });

        it("Should reject quote on inactive listing", async function () {
            await listingManager.connect(companySigner).closeListing(1);
            await expect(
                quoteManager.connect(vendorSigner).submitQuote(
                    "QUO-FAIL2", 1, vendorShareId, 1000, "hash", 10, 0
                )
            ).to.be.revertedWith("Listing is not active");
        });

        it("Should reject duplicate quote from same vendor", async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-FIRST", 1, vendorShareId, 4000, "hash1", 20, 0
            );
            await expect(
                quoteManager.connect(vendorSigner).submitQuote(
                    "QUO-SECOND", 1, vendorShareId, 3500, "hash2", 15, 0
                )
            ).to.be.revertedWith("Vendor already submitted a quote for this listing");
        });

        it("Should allow different vendors to quote on same listing", async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-V1", 1, vendorShareId, 4000, "hash1", 20, 0
            );
            await quoteManager.connect(vendor2Signer).submitQuote(
                "QUO-V2", 1, vendor2ShareId, 3800, "hash2", 25, 0
            );

            const quotes = await quoteManager.getQuotesByListing(1);
            expect(quotes.length).to.equal(2);
        });

        it("Should reject on private listing without authorization", async function () {
            // Create a private listing
            await listingManager.connect(companySigner).createListing(
                "LST-PRIV001", companyShareId, "privHash", 3000, 1, 1, 0, 0, []
            );

            await expect(
                quoteManager.connect(vendorSigner).submitQuote(
                    "QUO-PRIV", 2, vendorShareId, 2000, "hash", 10, 0
                )
            ).to.be.revertedWith("Vendor not authorized for this listing");
        });
    });

    describe("Update Quote", function () {
        beforeEach(async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-UPD001", 1, vendorShareId, 4000, "oldProposal", 20, 0
            );
        });

        it("Should update a submitted quote", async function () {
            await quoteManager.connect(vendorSigner).updateQuote(1, 3500, "newProposal", 18);
            const quote = await quoteManager.getQuote(1);
            expect(quote.quotedPrice).to.equal(3500);
            expect(quote.deliveryDays).to.equal(18);
        });

        it("Should reject update by non-owner", async function () {
            await expect(
                quoteManager.connect(companySigner).updateQuote(1, 3000, "hack", 10)
            ).to.be.revertedWith("Not quote owner");
        });

        it("Should reject update after review", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 1, "notes"); // UNDER_REVIEW
            // Still reviewable — let's accept
            await quoteManager.connect(companySigner).reviewQuote(1, 2, "accepted"); // ACCEPTED
            await expect(
                quoteManager.connect(vendorSigner).updateQuote(1, 2000, "new", 10)
            ).to.be.revertedWith("Quote cannot be modified");
        });
    });

    describe("Withdraw Quote", function () {
        beforeEach(async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-WDR001", 1, vendorShareId, 4000, "proposal", 20, 0
            );
        });

        it("Should withdraw a submitted quote", async function () {
            await quoteManager.connect(vendorSigner).withdrawQuote(1);
            const quote = await quoteManager.getQuote(1);
            expect(quote.status).to.equal(4); // WITHDRAWN
        });

        it("Should withdraw an under-review quote", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 1, "notes");
            await quoteManager.connect(vendorSigner).withdrawQuote(1);
            const quote = await quoteManager.getQuote(1);
            expect(quote.status).to.equal(4); // WITHDRAWN
        });

        it("Should reject withdrawal of accepted quote", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 2, "accepted");
            await expect(
                quoteManager.connect(vendorSigner).withdrawQuote(1)
            ).to.be.revertedWith("Quote cannot be withdrawn");
        });
    });

    describe("Review Quote", function () {
        beforeEach(async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-REV001", 1, vendorShareId, 4000, "proposal", 20, 0
            );
        });

        it("Should mark quote as under review", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 1, "reviewing");
            const quote = await quoteManager.getQuote(1);
            expect(quote.status).to.equal(1); // UNDER_REVIEW
        });

        it("Should accept a quote", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 2, "great proposal");
            const quote = await quoteManager.getQuote(1);
            expect(quote.status).to.equal(2); // ACCEPTED
        });

        it("Should reject a quote", async function () {
            await quoteManager.connect(companySigner).reviewQuote(1, 3, "too expensive");
            const quote = await quoteManager.getQuote(1);
            expect(quote.status).to.equal(3); // REJECTED
        });

        it("Should reject invalid review status", async function () {
            await expect(
                quoteManager.connect(companySigner).reviewQuote(1, 0, "notes") // SUBMITTED
            ).to.be.revertedWith("Invalid review status");
        });

        it("Should emit QuoteReviewed event", async function () {
            await expect(
                quoteManager.connect(companySigner).reviewQuote(1, 2, "notes")
            ).to.emit(quoteManager, "QuoteReviewed");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await quoteManager.connect(vendorSigner).submitQuote(
                "QUO-VIEW001", 1, vendorShareId, 4000, "prop1", 20, 0
            );
            await quoteManager.connect(vendor2Signer).submitQuote(
                "QUO-VIEW002", 1, vendor2ShareId, 3500, "prop2", 25, 0
            );
        });

        it("Should return quotes by listing", async function () {
            const ids = await quoteManager.getQuotesByListing(1);
            expect(ids.length).to.equal(2);
        });

        it("Should return quotes by vendor", async function () {
            const ids = await quoteManager.getQuotesByVendor(vendorShareId);
            expect(ids.length).to.equal(1);
        });

        it("Should check if vendor has quoted", async function () {
            expect(await quoteManager.hasVendorQuoted(1, vendorShareId)).to.be.true;
            expect(await quoteManager.hasVendorQuoted(1, "SH-NOQUOTE")).to.be.false;
        });

        it("Should lookup quote by number", async function () {
            expect(await quoteManager.getQuoteByNumber("QUO-VIEW001")).to.equal(1);
            expect(await quoteManager.getQuoteByNumber("QUO-NONEXIST")).to.equal(0);
        });
    });
});
