<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BlockchainService;
use Exception;

class ValidateBlockchainConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blockchain:validate-config';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate blockchain configuration for production deployment';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Validating blockchain configuration...');
        
        try {
            // Check environment variables
            $nodeUrl = env('BLOCKCHAIN_NODE_URL');
            $contractAddress = env('BLOCKCHAIN_CONTRACT_ADDRESS');
            $adminPrivateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY');
            
            $issues = [];
            $warnings = [];
            
            // Check for missing variables
            if (empty($nodeUrl)) {
                $issues[] = 'BLOCKCHAIN_NODE_URL is not set';
            }
            if (empty($contractAddress)) {
                $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS is not set';
            }
            if (empty($adminPrivateKey)) {
                $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY is not set';
            }
            
            // Check for placeholder values
            if (str_contains($nodeUrl, 'REPLACE_WITH') || $nodeUrl === 'url') {
                $issues[] = 'BLOCKCHAIN_NODE_URL contains placeholder value';
            }
            if (str_contains($contractAddress, 'REPLACE_WITH') || $contractAddress === 'contract_address') {
                $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS contains placeholder value';
            }
            if (str_contains($adminPrivateKey, 'REPLACE_WITH') || $adminPrivateKey === 'private_key') {
                $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY contains placeholder value';
            }
            
            // Check for development values in production
            if (app()->environment('production')) {
                if (str_contains($nodeUrl, '127.0.0.1') || str_contains($nodeUrl, 'localhost')) {
                    $issues[] = 'BLOCKCHAIN_NODE_URL should not use localhost in production';
                }
                
                if ($contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
                    $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS is using local development address';
                }
                
                if ($adminPrivateKey === '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') {
                    $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY is using local development key (CRITICAL SECURITY ISSUE!)';
                }
            }
            
            // Validate formats
            if (!empty($contractAddress) && !preg_match('/^0x[a-fA-F0-9]{40}$/', $contractAddress)) {
                $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS format is invalid (should be 42-character hex string starting with 0x)';
            }
            
            if (!empty($adminPrivateKey) && !preg_match('/^0x[a-fA-F0-9]{64}$/', $adminPrivateKey)) {
                $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY format is invalid (should be 66-character hex string starting with 0x)';
            }
            
            // Test connection if configuration looks good
            if (empty($issues)) {
                $this->info('✅ Configuration format validation passed');
                $this->info('🔗 Testing blockchain connection...');
                
                try {
                    $blockchainService = new BlockchainService();
                    $isHealthy = $blockchainService->isConnectionHealthy();
                    
                    if ($isHealthy) {
                        $this->info('✅ Blockchain connection successful');
                        $blockNumber = $blockchainService->getCurrentBlockNumber();
                        $this->info("📦 Current block number: {$blockNumber}");
                    } else {
                        $warnings[] = 'Blockchain connection test failed - check network connectivity';
                    }
                } catch (Exception $e) {
                    $warnings[] = 'Blockchain connection test failed: ' . $e->getMessage();
                }
            }
            
            // Display results
            if (empty($issues) && empty($warnings)) {
                $this->info('🎉 All blockchain configuration checks passed!');
                $this->info("📍 Network: {$nodeUrl}");
                $this->info("📄 Contract: {$contractAddress}");
                $this->info("🔐 Admin wallet configured");
                return 0;
            }
            
            if (!empty($warnings)) {
                $this->warn('⚠️  Warnings found:');
                foreach ($warnings as $warning) {
                    $this->warn("   • {$warning}");
                }
                $this->newLine();
            }
            
            if (!empty($issues)) {
                $this->error('❌ Critical issues found:');
                foreach ($issues as $issue) {
                    $this->error("   • {$issue}");
                }
                $this->newLine();
                $this->error('Please fix these issues before deploying to production.');
                return 1;
            }
            
            return empty($warnings) ? 0 : 2;
            
        } catch (Exception $e) {
            $this->error('❌ Validation failed: ' . $e->getMessage());
            return 1;
        }
    }
}