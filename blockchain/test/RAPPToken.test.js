const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RAPPToken", function () {
    let rappToken;
    let owner, user1, user2, deductor;

    beforeEach(async function () {
        [owner, user1, user2, deductor] = await ethers.getSigners();

        const RAPPToken = await ethers.getContractFactory("RAPPToken");
        rappToken = await RAPPToken.deploy(1, 1); // costListing=1, costQuote=1
        await rappToken.waitForDeployment();
    });

    describe("Token Properties", function () {
        it("Should have correct name and symbol", async function () {
            expect(await rappToken.name()).to.equal("RAPP Token");
            expect(await rappToken.symbol()).to.equal("RAPP");
        });

        it("Should have 0 decimals", async function () {
            expect(await rappToken.decimals()).to.equal(0);
        });

        it("Should have correct initial costs", async function () {
            const costs = await rappToken.getPointCosts();
            expect(costs.listing).to.equal(1);
            expect(costs.quote).to.equal(1);
        });
    });

    describe("Minting", function () {
        it("Owner should mint tokens", async function () {
            await rappToken.connect(owner).mint(user1.address, 100, "Purchased via Razorpay");
            expect(await rappToken.balanceOf(user1.address)).to.equal(100);
        });

        it("Should emit PointsMinted event", async function () {
            await expect(
                rappToken.connect(owner).mint(user1.address, 50, "test mint")
            )
                .to.emit(rappToken, "PointsMinted")
                .withArgs(user1.address, 50, "test mint");
        });

        it("Non-owner should not mint", async function () {
            await expect(
                rappToken.connect(user1).mint(user1.address, 100, "hack")
            ).to.be.revertedWithCustomError(rappToken, "OwnableUnauthorizedAccount");
        });

        it("Should reject minting to zero address", async function () {
            await expect(
                rappToken.connect(owner).mint(ethers.ZeroAddress, 100, "fail")
            ).to.be.revertedWith("Cannot mint to zero address");
        });

        it("Should reject minting 0 amount", async function () {
            await expect(
                rappToken.connect(owner).mint(user1.address, 0, "fail")
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Deduction Authorization", function () {
        it("Should authorize a deductor", async function () {
            await rappToken.connect(owner).authorizeDeductor(deductor.address);
            expect(await rappToken.isAuthorizedDeductor(deductor.address)).to.be.true;
        });

        it("Should revoke a deductor", async function () {
            await rappToken.connect(owner).authorizeDeductor(deductor.address);
            await rappToken.connect(owner).revokeDeductor(deductor.address);
            expect(await rappToken.isAuthorizedDeductor(deductor.address)).to.be.false;
        });

        it("Should emit events", async function () {
            await expect(rappToken.connect(owner).authorizeDeductor(deductor.address))
                .to.emit(rappToken, "DeductorAuthorized");

            await expect(rappToken.connect(owner).revokeDeductor(deductor.address))
                .to.emit(rappToken, "DeductorRevoked");
        });

        it("Non-owner should not authorize", async function () {
            await expect(
                rappToken.connect(user1).authorizeDeductor(deductor.address)
            ).to.be.revertedWithCustomError(rappToken, "OwnableUnauthorizedAccount");
        });
    });

    describe("Deduction for Listing", function () {
        beforeEach(async function () {
            await rappToken.connect(owner).mint(user1.address, 10, "initial");
            await rappToken.connect(owner).authorizeDeductor(deductor.address);
        });

        it("Authorized deductor should deduct for listing", async function () {
            await rappToken.connect(deductor).deductForListing(user1.address, "Created listing");
            expect(await rappToken.balanceOf(user1.address)).to.equal(9);
        });

        it("Owner should deduct for listing", async function () {
            await rappToken.connect(owner).deductForListing(user1.address, "Created listing");
            expect(await rappToken.balanceOf(user1.address)).to.equal(9);
        });

        it("Unauthorized should not deduct", async function () {
            await expect(
                rappToken.connect(user2).deductForListing(user1.address, "hack")
            ).to.be.revertedWith("Not authorized to deduct");
        });

        it("Should fail with insufficient balance", async function () {
            // user2 has 0 balance by default (no mint needed)
            await expect(
                rappToken.connect(deductor).deductForListing(user2.address, "fail")
            ).to.be.revertedWith("Insufficient RAPP tokens for listing");
        });

        it("Should emit PointsDeducted event", async function () {
            await expect(
                rappToken.connect(deductor).deductForListing(user1.address, "listing deduct")
            )
                .to.emit(rappToken, "PointsDeducted")
                .withArgs(user1.address, 1, "listing deduct");
        });
    });

    describe("Deduction for Quote", function () {
        beforeEach(async function () {
            await rappToken.connect(owner).mint(user1.address, 10, "initial");
            await rappToken.connect(owner).authorizeDeductor(deductor.address);
        });

        it("Should deduct for quote", async function () {
            await rappToken.connect(deductor).deductForQuote(user1.address, "Submitted quote");
            expect(await rappToken.balanceOf(user1.address)).to.equal(9);
        });
    });

    describe("Generic Deduction", function () {
        beforeEach(async function () {
            await rappToken.connect(owner).mint(user1.address, 100, "initial");
            await rappToken.connect(owner).authorizeDeductor(deductor.address);
        });

        it("Should deduct custom amount", async function () {
            await rappToken.connect(deductor).deduct(user1.address, 25, "Custom deduction");
            expect(await rappToken.balanceOf(user1.address)).to.equal(75);
        });

        it("Should fail with insufficient balance", async function () {
            await expect(
                rappToken.connect(deductor).deduct(user1.address, 101, "too much")
            ).to.be.revertedWith("Insufficient RAPP tokens");
        });
    });

    describe("Cost Configuration", function () {
        it("Should update costs", async function () {
            await rappToken.connect(owner).setCosts(5, 3);
            const costs = await rappToken.getPointCosts();
            expect(costs.listing).to.equal(5);
            expect(costs.quote).to.equal(3);
        });

        it("Should deduct updated costs", async function () {
            await rappToken.connect(owner).setCosts(5, 3);
            await rappToken.connect(owner).mint(user1.address, 10, "test");
            await rappToken.connect(owner).authorizeDeductor(deductor.address);

            await rappToken.connect(deductor).deductForListing(user1.address, "listing");
            expect(await rappToken.balanceOf(user1.address)).to.equal(5); // 10 - 5

            await rappToken.connect(deductor).deductForQuote(user1.address, "quote");
            expect(await rappToken.balanceOf(user1.address)).to.equal(2); // 5 - 3
        });

        it("Should emit CostsUpdated event", async function () {
            await expect(rappToken.connect(owner).setCosts(5, 3))
                .to.emit(rappToken, "CostsUpdated")
                .withArgs(5, 3);
        });
    });

    describe("ERC-20 Standard Functions", function () {
        beforeEach(async function () {
            await rappToken.connect(owner).mint(user1.address, 100, "initial");
        });

        it("Should transfer tokens", async function () {
            await rappToken.connect(user1).transfer(user2.address, 30);
            expect(await rappToken.balanceOf(user1.address)).to.equal(70);
            expect(await rappToken.balanceOf(user2.address)).to.equal(30);
        });

        it("Should burn tokens", async function () {
            await rappToken.connect(user1).burn(10);
            expect(await rappToken.balanceOf(user1.address)).to.equal(90);
        });

        it("Should approve and transferFrom", async function () {
            await rappToken.connect(user1).approve(user2.address, 50);
            await rappToken.connect(user2).transferFrom(user1.address, user2.address, 50);
            expect(await rappToken.balanceOf(user2.address)).to.equal(50);
        });
    });
});
