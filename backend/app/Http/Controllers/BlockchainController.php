<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\BlockchainService;
use App\Models\Company;
use App\Models\Vendor;

class BlockchainController extends Controller
{
    private $blockchainService;

    public function __construct()
    {
        $this->blockchainService = new BlockchainService();
    }

    /**
     * Verify a share ID on the blockchain
     */
    public function verifyShareId(Request $request): JsonResponse
    {
        $request->validate([
            'share_id' => 'required|string',
        ]);

        $shareId = $request->share_id;
        
        // First check in our database
        $company = Company::where('share_id', $shareId)->first();
        $vendor = Vendor::where('share_id', $shareId)->first();
        
        $dbRecord = $company ?? $vendor;
        
        if (!$dbRecord) {
            return response()->json([
                'message' => 'Share ID not found in database',
                'verified' => false,
                'database_record' => null,
                'blockchain_verified' => false,
            ], 404);
        }

        // Verify on blockchain
        $blockchainResult = $this->blockchainService->verifyShareId($shareId);
        
        return response()->json([
            'message' => 'Verification completed',
            'share_id' => $shareId,
            'verified' => $blockchainResult['verified'],
            'database_record' => [
                'type' => $company ? 'company' : 'vendor',
                'name' => $company ? $company->company_name : $vendor->vendor_name,
                'blockchain_tx_hash' => $dbRecord->blockchain_tx_hash,
                'blockchain_verified' => $dbRecord->blockchain_verified,
                'blockchain_registered_at' => $dbRecord->blockchain_registered_at,
            ],
            'blockchain_verified' => $blockchainResult['verified'],
            'blockchain_success' => $blockchainResult['success'],
        ]);
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus(Request $request): JsonResponse
    {
        $request->validate([
            'tx_hash' => 'required|string',
        ]);

        $txHash = $request->tx_hash;
        $status = $this->blockchainService->getTransactionStatus($txHash);
        
        return response()->json([
            'transaction_hash' => $txHash,
            'status' => $status,
        ]);
    }

    /**
     * Get blockchain network status
     */
    public function getNetworkStatus(): JsonResponse
    {
        $isHealthy = $this->blockchainService->isConnectionHealthy();
        $currentBlock = $this->blockchainService->getCurrentBlockNumber();
        
        return response()->json([
            'network_healthy' => $isHealthy,
            'current_block' => $currentBlock,
            'node_url' => env('BLOCKCHAIN_NODE_URL'),
            'contract_address' => env('BLOCKCHAIN_CONTRACT_ADDRESS'),
        ]);
    }

    /**
     * Get platform statistics from blockchain
     */
    public function getPlatformStats(): JsonResponse
    {
        try {
            // Get stats from database
            $dbStats = [
                'total_companies' => Company::count(),
                'total_vendors' => Vendor::count(),
                'blockchain_registered_companies' => Company::whereNotNull('blockchain_tx_hash')->count(),
                'blockchain_registered_vendors' => Vendor::whereNotNull('blockchain_tx_hash')->count(),
            ];

            return response()->json([
                'database_stats' => $dbStats,
                'blockchain_connection' => $this->blockchainService->isConnectionHealthy(),
                'current_block' => $this->blockchainService->getCurrentBlockNumber(),
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch platform statistics',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Manually register entity on blockchain (admin only)
     */
    public function manualRegister(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:company,vendor',
            'id' => 'required|integer',
        ]);

        $type = $request->type;
        $id = $request->id;

        if ($type === 'company') {
            $entity = Company::findOrFail($id);
            $result = $this->blockchainService->registerCompany(
                $entity->company_name,
                $entity->share_id,
                $entity->business_type,
                $entity->location ?? ''
            );
        } else {
            $entity = Vendor::findOrFail($id);
            $result = $this->blockchainService->registerVendor(
                $entity->vendor_name,
                $entity->share_id,
                $entity->specialization,
                $entity->location ?? ''
            );
        }

        if ($result['success']) {
            $entity->update([
                'blockchain_tx_hash' => $result['transaction_hash'],
                'blockchain_registered_at' => now(),
            ]);
        }

        return response()->json([
            'message' => $result['success'] ? 'Entity registered on blockchain successfully' : 'Failed to register entity on blockchain',
            'result' => $result,
            'entity' => $entity->getApiData(),
        ]);
    }

    /**
     * Verify a transaction hash on the blockchain
     */
    public function verifyTransaction(Request $request, $hash): JsonResponse
    {
        $request->validate([
            'hash' => 'sometimes|string',
        ]);

        $transactionHash = $hash ?? $request->hash;
        
        if (!$transactionHash) {
            return response()->json([
                'message' => 'Transaction hash is required',
                'success' => false
            ], 400);
        }

        $result = $this->blockchainService->verifyTransaction($transactionHash);
        
        return response()->json([
            'message' => $result['success'] ? 'Transaction verified successfully' : 'Transaction verification failed',
            'transaction_hash' => $transactionHash,
            'verification_result' => $result
        ]);
    }
}
