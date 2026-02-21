/**
 * Copy compiled contract artifacts to backend storage
 * Run this after compiling contracts
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_ARTIFACTS = path.join(__dirname, '../', '../frontend/src/artifacts/contracts');
const BACKEND_STORAGE = path.join(__dirname, '../', '../backend/storage/blockchain/artifacts/contracts');

console.log('📦 Copying contract artifacts to backend storage...');

// Ensure backend storage directory exists
if (!fs.existsSync(BACKEND_STORAGE)) {
    fs.mkdirSync(BACKEND_STORAGE, { recursive: true });
    console.log('✅ Created backend storage directory');
}

// Copy RegistrationContract artifacts
const registrationContractSource = path.join(FRONTEND_ARTIFACTS, 'RegistrationContract.sol');
const registrationContractDest = path.join(BACKEND_STORAGE, 'RegistrationContract.sol');

if (fs.existsSync(registrationContractSource)) {
    // Copy entire directory
    copyDirectory(registrationContractSource, registrationContractDest);
    console.log('✅ Copied RegistrationContract artifacts');
} else {
    console.warn('⚠️  RegistrationContract artifacts not found at:', registrationContractSource);
}

// Copy ReverseAuctionPlatform artifacts if exists
const auctionContractSource = path.join(FRONTEND_ARTIFACTS, 'ReverseAuctionPlatform.sol');
const auctionContractDest = path.join(BACKEND_STORAGE, 'ReverseAuctionPlatform.sol');

if (fs.existsSync(auctionContractSource)) {
    copyDirectory(auctionContractSource, auctionContractDest);
    console.log('✅ Copied ReverseAuctionPlatform artifacts');
}

console.log('✅ All contract artifacts copied successfully!');

/**
 * Recursively copy directory
 */
function copyDirectory(source, destination) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    // Read all files/folders in source
    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            // Recursively copy subdirectories
            copyDirectory(sourcePath, destPath);
        } else {
            // Copy file
            fs.copyFileSync(sourcePath, destPath);
        }
    });
}
