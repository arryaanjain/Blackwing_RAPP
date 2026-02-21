const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConnectionManager", function () {
    let registry, connectionManager;
    let owner, vendorSigner, companySigner, other;

    const vendorShareId = "SH-VEND001";
    const companyShareId = "SH-COMP001";

    beforeEach(async function () {
        [owner, vendorSigner, companySigner, other] = await ethers.getSigners();

        // Deploy Registry
        const RAPPRegistry = await ethers.getContractFactory("RAPPRegistry");
        registry = await RAPPRegistry.deploy();
        await registry.waitForDeployment();

        // Deploy ConnectionManager
        const ConnectionManager = await ethers.getContractFactory("ConnectionManager");
        connectionManager = await ConnectionManager.deploy(await registry.getAddress());
        await connectionManager.waitForDeployment();

        // Register entities
        await registry.connect(vendorSigner).registerEntity(vendorShareId, "Vendor 1", 1, "vh1");
        await registry.connect(companySigner).registerEntity(companyShareId, "Company 1", 0, "ch1");
    });

    describe("Connection Requests", function () {
        it("Should send a connection request", async function () {
            const tx = await connectionManager.connect(vendorSigner).sendConnectionRequest(
                vendorShareId, companyShareId, "msgHash123"
            );
            await tx.wait();

            const req = await connectionManager.getRequest(1);
            expect(req.vendorShareId).to.equal(vendorShareId);
            expect(req.companyShareId).to.equal(companyShareId);
            expect(req.status).to.equal(0); // PENDING
        });

        it("Should emit ConnectionRequested event", async function () {
            await expect(
                connectionManager.connect(vendorSigner).sendConnectionRequest(
                    vendorShareId, companyShareId, "msgHash"
                )
            ).to.emit(connectionManager, "ConnectionRequested");
        });

        it("Should reject request from unregistered vendor", async function () {
            await expect(
                connectionManager.connect(other).sendConnectionRequest(
                    "SH-FAKE", companyShareId, "msg"
                )
            ).to.be.revertedWith("Vendor not registered");
        });

        it("Should reject request to unregistered company", async function () {
            await expect(
                connectionManager.connect(vendorSigner).sendConnectionRequest(
                    vendorShareId, "SH-FAKE", "msg"
                )
            ).to.be.revertedWith("Company not registered");
        });

        it("Should reject self-connection", async function () {
            await expect(
                connectionManager.connect(vendorSigner).sendConnectionRequest(
                    vendorShareId, vendorShareId, "msg"
                )
            ).to.be.revertedWith("Cannot connect to self");
        });

        it("Should reject duplicate pending request", async function () {
            await connectionManager.connect(vendorSigner).sendConnectionRequest(
                vendorShareId, companyShareId, "msg1"
            );
            await expect(
                connectionManager.connect(vendorSigner).sendConnectionRequest(
                    vendorShareId, companyShareId, "msg2"
                )
            ).to.be.revertedWith("Pending request already exists");
        });
    });

    describe("Approve / Deny / Cancel", function () {
        beforeEach(async function () {
            await connectionManager.connect(vendorSigner).sendConnectionRequest(
                vendorShareId, companyShareId, "msgHash"
            );
        });

        it("Should approve a request and create connection", async function () {
            await connectionManager.connect(companySigner).approveRequest(1, "notesHash");

            const req = await connectionManager.getRequest(1);
            expect(req.status).to.equal(1); // APPROVED

            const isConn = await connectionManager.isConnected(vendorShareId, companyShareId);
            expect(isConn).to.be.true;

            const conn = await connectionManager.getConnection(1);
            expect(conn.isActive).to.be.true;
            expect(conn.vendorShareId).to.equal(vendorShareId);
        });

        it("Should deny a request", async function () {
            await connectionManager.connect(companySigner).denyRequest(1, "reasonHash");

            const req = await connectionManager.getRequest(1);
            expect(req.status).to.equal(2); // DENIED

            expect(await connectionManager.isConnected(vendorShareId, companyShareId)).to.be.false;
        });

        it("Should cancel a request", async function () {
            await connectionManager.connect(vendorSigner).cancelRequest(1);

            const req = await connectionManager.getRequest(1);
            expect(req.status).to.equal(3); // CANCELLED
        });

        it("Should reject approving a non-pending request", async function () {
            await connectionManager.connect(companySigner).denyRequest(1, "reason");
            await expect(
                connectionManager.connect(companySigner).approveRequest(1, "notes")
            ).to.be.revertedWith("Request is not pending");
        });
    });

    describe("Connection Revocation", function () {
        beforeEach(async function () {
            await connectionManager.connect(vendorSigner).sendConnectionRequest(
                vendorShareId, companyShareId, "msg"
            );
            await connectionManager.connect(companySigner).approveRequest(1, "notes");
        });

        it("Should revoke an active connection", async function () {
            await connectionManager.connect(companySigner).revokeConnection(1, "revokeReason");

            const conn = await connectionManager.getConnection(1);
            expect(conn.isActive).to.be.false;
            expect(await connectionManager.isConnected(vendorShareId, companyShareId)).to.be.false;
        });

        it("Should reject revoking an already inactive connection", async function () {
            await connectionManager.connect(companySigner).revokeConnection(1, "reason");
            await expect(
                connectionManager.connect(companySigner).revokeConnection(1, "again")
            ).to.be.revertedWith("Connection already inactive");
        });

        it("Should emit ConnectionRevoked event", async function () {
            await expect(
                connectionManager.connect(companySigner).revokeConnection(1, "reason")
            ).to.emit(connectionManager, "ConnectionRevoked");
        });

        it("Should allow new request after revocation", async function () {
            await connectionManager.connect(companySigner).revokeConnection(1, "reason");

            // Vendor should be able to send a new request
            const tx = await connectionManager.connect(vendorSigner).sendConnectionRequest(
                vendorShareId, companyShareId, "newMsg"
            );
            await tx.wait();

            expect(await connectionManager.requestCounter()).to.equal(2);
        });
    });
});
