<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\BlockchainService;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "Testing Blockchain Service\n";
echo "========================\n\n";

try {
    $blockchainService = new BlockchainService();
    
    // Test blockchain connection
    echo "1. Testing blockchain connection...\n";
    $blockNumber = $blockchainService->getCurrentBlockNumber();
    echo "Current block number: " . ($blockNumber ?? 'ERROR') . "\n\n";
    
    if ($blockNumber === null) {
        echo "❌ Blockchain connection failed\n";
        exit(1);
    }
    
    echo "✅ Blockchain connection successful\n\n";
    
    // Test company registration
    echo "2. Testing company registration on blockchain...\n";
    $companyResult = $blockchainService->registerCompany(
        "Test Blockchain Company",
        "TST" . time(),
        "Technology", 
        "San Francisco"
    );
    
    if ($companyResult['success']) {
        echo "✅ Company registered successfully!\n";
        echo "Transaction Hash: " . $companyResult['transactionHash'] . "\n";
        echo "Block Number: " . $companyResult['blockNumber'] . "\n";
        echo "Gas Used: " . $companyResult['gasUsed'] . "\n\n";
        
        // Verify the transaction
        echo "3. Verifying transaction...\n";
        $verification = $blockchainService->verifyTransaction($companyResult['transactionHash']);
        if ($verification['success']) {
            echo "✅ Transaction verified successfully!\n";
            echo "Status: " . $verification['status'] . "\n";
            echo "Block Number: " . $verification['blockNumber'] . "\n";
        } else {
            echo "❌ Transaction verification failed: " . $verification['error'] . "\n";
        }
    } else {
        echo "❌ Company registration failed\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
