<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Web3p\EthereumTx\Transaction;
use kornrunner\Keccak;

/**
 * BlockchainService — Multi-contract integration for the RAPP platform.
 *
 * Supports 5 contracts on the same chain:
 *   1. RAPPRegistry        — entity registration
 *   2. ConnectionManager   — vendor-company connections
 *   3. ListingManager      — product listings
 *   4. QuoteManager        — vendor quotations
 *   5. RAPPToken           — ERC-20 points/credits
 *
 * Each public method:
 *   1. ABI-encodes the function call
 *   2. Sends a signed transaction via web3p/ethereum-tx
 *   3. Waits for receipt (blocks until mined)
 *   4. Returns ['success' => true, 'transactionHash' => '0x...']
 */
class BlockchainService
{
    private string $nodeUrl;
    private string $adminPrivateKey;

    // Contract addresses
    private string $registryAddress;
    private string $connectionManagerAddress;
    private string $listingManagerAddress;
    private string $quoteManagerAddress;
    private string $rappTokenAddress;

    public function __construct()
    {
        $this->nodeUrl = env('BLOCKCHAIN_NODE_URL', 'http://127.0.0.1:8545');
        $this->adminPrivateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

        $this->registryAddress = env('BLOCKCHAIN_REGISTRY_ADDRESS', '');
        $this->connectionManagerAddress = env('BLOCKCHAIN_CONNECTION_MANAGER_ADDRESS', '');
        $this->listingManagerAddress = env('BLOCKCHAIN_LISTING_MANAGER_ADDRESS', '');
        $this->quoteManagerAddress = env('BLOCKCHAIN_QUOTE_MANAGER_ADDRESS', '');
        $this->rappTokenAddress = env('BLOCKCHAIN_RAPP_TOKEN_ADDRESS', '');
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. REGISTRY — registerEntity, deactivateEntity
    // ═══════════════════════════════════════════════════════════════

    /**
     * Register a company or vendor entity on the RAPPRegistry contract.
     *
     * Solidity: registerEntity(string _shareId, string _name, uint8 _entityType, string _metadataHash)
     * _entityType: 0 = COMPANY, 1 = VENDOR
     */
    public function registerEntity(string $shareId, string $name, int $entityType, string $metadataHash): array
    {
        Log::info('Blockchain: registerEntity', compact('shareId', 'name', 'entityType'));

        $sig = $this->getFunctionSignature('registerEntity', ['string', 'string', 'uint8', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'string', 'value' => $shareId],
            ['type' => 'string', 'value' => $name],
            ['type' => 'uint8', 'value' => $entityType],
            ['type' => 'string', 'value' => $metadataHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->registryAddress, 500000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. CONNECTION MANAGER
    // ═══════════════════════════════════════════════════════════════

    /**
     * sendConnectionRequest(string _vendorShareId, string _companyShareId, string _messageHash)
     */
    public function sendConnectionRequest(string $vendorShareId, string $companyShareId, string $messageHash): array
    {
        Log::info('Blockchain: sendConnectionRequest', compact('vendorShareId', 'companyShareId'));

        $sig = $this->getFunctionSignature('sendConnectionRequest', ['string', 'string', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'string', 'value' => $vendorShareId],
            ['type' => 'string', 'value' => $companyShareId],
            ['type' => 'string', 'value' => $messageHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->connectionManagerAddress, 500000);
    }

    /**
     * approveRequest(uint256 _requestId, string _reviewNotesHash)
     */
    public function approveConnectionRequest(int $requestId, string $reviewNotesHash): array
    {
        Log::info('Blockchain: approveConnectionRequest', compact('requestId'));

        $sig = $this->getFunctionSignature('approveRequest', ['uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $requestId],
            ['type' => 'string', 'value' => $reviewNotesHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->connectionManagerAddress, 500000);
    }

    /**
     * denyRequest(uint256 _requestId, string _reviewNotesHash)
     */
    public function denyConnectionRequest(int $requestId, string $reviewNotesHash): array
    {
        Log::info('Blockchain: denyConnectionRequest', compact('requestId'));

        $sig = $this->getFunctionSignature('denyRequest', ['uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $requestId],
            ['type' => 'string', 'value' => $reviewNotesHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->connectionManagerAddress, 300000);
    }

    /**
     * cancelRequest(uint256 _requestId)
     */
    public function cancelConnectionRequest(int $requestId): array
    {
        Log::info('Blockchain: cancelConnectionRequest', compact('requestId'));

        $sig = $this->getFunctionSignature('cancelRequest', ['uint256']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $requestId],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->connectionManagerAddress, 200000);
    }

    /**
     * revokeConnection(uint256 _connectionId, string _reasonHash)
     */
    public function revokeConnection(int $connectionId, string $reasonHash): array
    {
        Log::info('Blockchain: revokeConnection', compact('connectionId'));

        $sig = $this->getFunctionSignature('revokeConnection', ['uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $connectionId],
            ['type' => 'string', 'value' => $reasonHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->connectionManagerAddress, 300000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. LISTING MANAGER
    // ═══════════════════════════════════════════════════════════════

    /**
     * createListing(string, string, string, uint256, uint8, uint8, uint256, string[])
     */
    public function createListing(
        string $listingNumber,
        string $companyShareId,
        string $contentHash,
        int $basePrice,
        int $visibility,  // 0=PUBLIC, 1=PRIVATE
        int $status,      // 0=DRAFT, 1=ACTIVE
        int $closesAt,
        array $authorizedVendorShareIds = []
    ): array {
        Log::info('Blockchain: createListing', compact('listingNumber', 'companyShareId', 'visibility'));

        $sig = $this->getFunctionSignature('createListing', [
            'string', 'string', 'string', 'uint256', 'uint8', 'uint8', 'uint256', 'string[]'
        ]);
        $encoded = $this->encodeParams([
            ['type' => 'string', 'value' => $listingNumber],
            ['type' => 'string', 'value' => $companyShareId],
            ['type' => 'string', 'value' => $contentHash],
            ['type' => 'uint256', 'value' => $basePrice],
            ['type' => 'uint8', 'value' => $visibility],
            ['type' => 'uint8', 'value' => $status],
            ['type' => 'uint256', 'value' => $closesAt],
            ['type' => 'string[]', 'value' => $authorizedVendorShareIds],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->listingManagerAddress, 800000);
    }

    /**
     * updateListing(uint256 _listingId, string _newContentHash, uint8 _newStatus)
     */
    public function updateListing(int $listingId, string $contentHash, int $status): array
    {
        Log::info('Blockchain: updateListing', compact('listingId'));

        $sig = $this->getFunctionSignature('updateListing', ['uint256', 'string', 'uint8']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $listingId],
            ['type' => 'string', 'value' => $contentHash],
            ['type' => 'uint8', 'value' => $status],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->listingManagerAddress, 300000);
    }

    /**
     * closeListing(uint256 _listingId)
     */
    public function closeListing(int $listingId): array
    {
        Log::info('Blockchain: closeListing', compact('listingId'));

        $sig = $this->getFunctionSignature('closeListing', ['uint256']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $listingId],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->listingManagerAddress, 200000);
    }

    /**
     * grantVendorAccess(uint256 _listingId, string _vendorShareId)
     */
    public function grantVendorAccess(int $listingId, string $vendorShareId): array
    {
        Log::info('Blockchain: grantVendorAccess', compact('listingId', 'vendorShareId'));

        $sig = $this->getFunctionSignature('grantVendorAccess', ['uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $listingId],
            ['type' => 'string', 'value' => $vendorShareId],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->listingManagerAddress, 200000);
    }

    /**
     * revokeVendorAccess(uint256 _listingId, string _vendorShareId)
     */
    public function revokeVendorAccess(int $listingId, string $vendorShareId): array
    {
        Log::info('Blockchain: revokeVendorAccess', compact('listingId', 'vendorShareId'));

        $sig = $this->getFunctionSignature('revokeVendorAccess', ['uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $listingId],
            ['type' => 'string', 'value' => $vendorShareId],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->listingManagerAddress, 200000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. QUOTE MANAGER
    // ═══════════════════════════════════════════════════════════════

    /**
     * submitQuote(string, uint256, string, uint256, string, uint256, uint256)
     */
    public function submitQuote(
        string $quoteNumber,
        int $listingId,
        string $vendorShareId,
        int $quotedPrice,
        string $proposalHash,
        int $deliveryDays,
        int $expiresAt
    ): array {
        Log::info('Blockchain: submitQuote', compact('quoteNumber', 'listingId', 'vendorShareId'));

        $sig = $this->getFunctionSignature('submitQuote', [
            'string', 'uint256', 'string', 'uint256', 'string', 'uint256', 'uint256'
        ]);
        $encoded = $this->encodeParams([
            ['type' => 'string', 'value' => $quoteNumber],
            ['type' => 'uint256', 'value' => $listingId],
            ['type' => 'string', 'value' => $vendorShareId],
            ['type' => 'uint256', 'value' => $quotedPrice],
            ['type' => 'string', 'value' => $proposalHash],
            ['type' => 'uint256', 'value' => $deliveryDays],
            ['type' => 'uint256', 'value' => $expiresAt],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->quoteManagerAddress, 500000);
    }

    /**
     * updateQuote(uint256 _quoteId, uint256 _newPrice, string _newProposalHash, uint256 _newDeliveryDays)
     */
    public function updateQuote(int $quoteId, int $newPrice, string $proposalHash, int $deliveryDays): array
    {
        Log::info('Blockchain: updateQuote', compact('quoteId'));

        $sig = $this->getFunctionSignature('updateQuote', ['uint256', 'uint256', 'string', 'uint256']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $quoteId],
            ['type' => 'uint256', 'value' => $newPrice],
            ['type' => 'string', 'value' => $proposalHash],
            ['type' => 'uint256', 'value' => $deliveryDays],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->quoteManagerAddress, 300000);
    }

    /**
     * withdrawQuote(uint256 _quoteId)
     */
    public function withdrawQuote(int $quoteId): array
    {
        Log::info('Blockchain: withdrawQuote', compact('quoteId'));

        $sig = $this->getFunctionSignature('withdrawQuote', ['uint256']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $quoteId],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->quoteManagerAddress, 200000);
    }

    /**
     * reviewQuote(uint256 _quoteId, uint8 _newStatus, string _reviewNotesHash)
     * Status: 1=UNDER_REVIEW, 2=ACCEPTED, 3=REJECTED
     */
    public function reviewQuote(int $quoteId, int $newStatus, string $reviewNotesHash): array
    {
        Log::info('Blockchain: reviewQuote', compact('quoteId', 'newStatus'));

        $sig = $this->getFunctionSignature('reviewQuote', ['uint256', 'uint8', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'uint256', 'value' => $quoteId],
            ['type' => 'uint8', 'value' => $newStatus],
            ['type' => 'string', 'value' => $reviewNotesHash],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->quoteManagerAddress, 300000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. RAPP TOKEN
    // ═══════════════════════════════════════════════════════════════

    /**
     * mint(address _to, uint256 _amount, string _reason)
     */
    public function mintTokens(string $toAddress, int $amount, string $reason): array
    {
        Log::info('Blockchain: mintTokens', compact('toAddress', 'amount'));

        $sig = $this->getFunctionSignature('mint', ['address', 'uint256', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'address', 'value' => $toAddress],
            ['type' => 'uint256', 'value' => $amount],
            ['type' => 'string', 'value' => $reason],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->rappTokenAddress, 200000);
    }

    /**
     * deductForListing(address _user, string _reason)
     */
    public function deductForListing(string $userAddress, string $reason): array
    {
        Log::info('Blockchain: deductForListing', compact('userAddress'));

        $sig = $this->getFunctionSignature('deductForListing', ['address', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'address', 'value' => $userAddress],
            ['type' => 'string', 'value' => $reason],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->rappTokenAddress, 200000);
    }

    /**
     * deductForQuote(address _user, string _reason)
     */
    public function deductForQuote(string $userAddress, string $reason): array
    {
        Log::info('Blockchain: deductForQuote', compact('userAddress'));

        $sig = $this->getFunctionSignature('deductForQuote', ['address', 'string']);
        $encoded = $this->encodeParams([
            ['type' => 'address', 'value' => $userAddress],
            ['type' => 'string', 'value' => $reason],
        ]);

        return $this->executeTransaction('0x' . $sig . $encoded, $this->rappTokenAddress, 200000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  UTILITY / VIEW METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Check if blockchain connection is healthy
     */
    public function isConnectionHealthy(): bool
    {
        try {
            return $this->getCurrentBlockNumber() !== null;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get current block number
     */
    public function getCurrentBlockNumber(): ?int
    {
        try {
            $response = $this->rpcCall('eth_blockNumber');
            return isset($response['result']) ? hexdec($response['result']) : null;
        } catch (Exception $e) {
            Log::error('Failed to get block number: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get transaction receipt/status
     */
    public function getTransactionStatus(string $txHash): array
    {
        try {
            $response = $this->rpcCall('eth_getTransactionReceipt', [$txHash]);

            if (isset($response['result']) && $response['result']) {
                $receipt = $response['result'];
                return [
                    'confirmed' => true,
                    'status' => $receipt['status'] === '0x1' ? 'success' : 'failed',
                    'block_number' => hexdec($receipt['blockNumber']),
                    'gas_used' => hexdec($receipt['gasUsed']),
                ];
            }

            return ['confirmed' => false, 'status' => 'pending'];
        } catch (Exception $e) {
            return ['confirmed' => false, 'status' => 'error', 'error' => $e->getMessage()];
        }
    }

    /**
     * Verify a share ID is registered on-chain.
     * Calls RAPPRegistry.isRegistered(string) → bool
     */
    public function verifyShareId(string $shareId): array
    {
        try {
            $sig = $this->getFunctionSignature('isRegistered', ['string']);
            $encoded = $this->encodeParams([
                ['type' => 'string', 'value' => $shareId],
            ]);

            $response = $this->rpcCall('eth_call', [
                ['to' => $this->registryAddress, 'data' => '0x' . $sig . $encoded],
                'latest'
            ]);

            $isRegistered = isset($response['result']) && hexdec($response['result']) === 1;

            return [
                'verified' => $isRegistered,
                'exists_on_blockchain' => $isRegistered,
                'message' => $isRegistered ? 'Share ID verified on blockchain' : 'Share ID not found on blockchain',
            ];
        } catch (Exception $e) {
            Log::error('verifyShareId failed: ' . $e->getMessage());
            return ['verified' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get platform stats from RAPPRegistry
     */
    public function getPlatformStatsFromBlockchain(): array
    {
        try {
            $sig = $this->getFunctionSignature('getPlatformStats', []);
            $response = $this->rpcCall('eth_call', [
                ['to' => $this->registryAddress, 'data' => '0x' . $sig],
                'latest'
            ]);

            if (isset($response['result'])) {
                $result = $response['result'];
                // Decode 3 uint256 values (companies, vendors, total)
                $companies = hexdec(substr($result, 2, 64));
                $vendors = hexdec(substr($result, 66, 64));
                $total = hexdec(substr($result, 130, 64));

                return [
                    'total_companies_on_chain' => $companies,
                    'total_vendors_on_chain' => $vendors,
                    'total_registrations' => $total,
                    'latest_block' => $this->getCurrentBlockNumber(),
                ];
            }

            return ['error' => 'Failed to fetch stats'];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRIVATE: TRANSACTION ENGINE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Execute a write transaction: sign → send → wait for receipt → return hash
     */
    private function executeTransaction(string $data, string $contractAddress, int $gasLimit): array
    {
        try {
            $txHash = $this->sendTransaction($data, $contractAddress, $gasLimit);
            $receipt = $this->waitForTransactionReceipt($txHash);

            Log::info('Transaction confirmed', [
                'txHash' => $txHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed']),
            ]);

            return [
                'success' => true,
                'transactionHash' => $txHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed']),
            ];
        } catch (Exception $e) {
            Log::error('Transaction failed: ' . $e->getMessage());
            throw new Exception('Blockchain transaction failed: ' . $e->getMessage());
        }
    }

    /**
     * Sign and send a transaction
     */
    private function sendTransaction(string $data, string $contractAddress, int $gasLimit): string
    {
        $from = $this->getAddressFromPrivateKey($this->adminPrivateKey);
        $nonce = $this->getNonce($from);
        $gasPrice = $this->getGasPrice();
        $chainId = $this->getChainId();

        $txParams = [
            'nonce' => '0x' . dechex($nonce),
            'gasPrice' => '0x' . dechex($gasPrice),
            'gasLimit' => '0x' . dechex($gasLimit),
            'to' => $contractAddress,
            'value' => '0x0',
            'data' => $data,
            'chainId' => $chainId,
        ];

        $tx = new Transaction($txParams);
        $privateKey = str_replace('0x', '', $this->adminPrivateKey);
        $signedTx = '0x' . $tx->sign($privateKey);

        $response = $this->rpcCall('eth_sendRawTransaction', [$signedTx]);

        if (isset($response['error'])) {
            throw new Exception('RPC Error: ' . json_encode($response['error']));
        }

        return $response['result'];
    }

    /**
     * Wait for transaction to be mined
     */
    private function waitForTransactionReceipt(string $txHash, int $maxAttempts = 30): array
    {
        for ($i = 0; $i < $maxAttempts; $i++) {
            $response = $this->rpcCall('eth_getTransactionReceipt', [$txHash]);

            if (isset($response['result']) && $response['result']) {
                $receipt = $response['result'];
                if (hexdec($receipt['status']) !== 1) {
                    throw new Exception('Transaction reverted on-chain (status=0x0)');
                }
                return $receipt;
            }

            usleep(500000); // 0.5s (fast on local Hardhat)
        }

        throw new Exception('Transaction confirmation timeout (waited ' . ($maxAttempts * 0.5) . 's)');
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRIVATE: ABI ENCODING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Keccak-256 function selector (first 4 bytes)
     */
    private function getFunctionSignature(string $functionName, array $paramTypes): string
    {
        $sig = $functionName . '(' . implode(',', $paramTypes) . ')';
        return substr(Keccak::hash($sig, 256), 0, 8);
    }

    /**
     * Generic ABI encoder.
     *
     * Supports: string, uint256, uint8, address, string[]
     *
     * @param array $params Array of ['type' => ..., 'value' => ...]
     * @return string Hex-encoded ABI data (no 0x prefix)
     */
    private function encodeParams(array $params): string
    {
        $headParts = [];
        $tailParts = [];
        $headSize = count($params) * 32; // each head slot is 32 bytes

        foreach ($params as $param) {
            $type = $param['type'];
            $value = $param['value'];

            if ($type === 'uint256' || $type === 'uint8') {
                // Static type: value goes directly in head
                $headParts[] = str_pad(dechex(intval($value)), 64, '0', STR_PAD_LEFT);
                $tailParts[] = null; // no tail data
            } elseif ($type === 'address') {
                // Address: 20 bytes, left-padded to 32
                $addr = str_replace('0x', '', $value);
                $headParts[] = str_pad($addr, 64, '0', STR_PAD_LEFT);
                $tailParts[] = null;
            } elseif ($type === 'string') {
                // Dynamic type: head contains offset, tail contains encoded string
                $headParts[] = 'OFFSET'; // placeholder
                $tailParts[] = $this->encodeString($value);
            } elseif ($type === 'string[]') {
                // Dynamic type: head contains offset, tail contains encoded string array
                $headParts[] = 'OFFSET';
                $tailParts[] = $this->encodeStringArray($value);
            } else {
                throw new Exception("Unsupported ABI type: {$type}");
            }
        }

        // Calculate offsets for dynamic params
        $currentTailOffset = $headSize;
        $resolvedHead = '';
        $resolvedTail = '';

        for ($i = 0; $i < count($headParts); $i++) {
            if ($headParts[$i] === 'OFFSET') {
                // Set offset to current tail position
                $resolvedHead .= str_pad(dechex($currentTailOffset), 64, '0', STR_PAD_LEFT);
                // Add tail data length (in bytes = hex chars / 2)
                $currentTailOffset += strlen($tailParts[$i]) / 2;
            } else {
                $resolvedHead .= $headParts[$i];
            }

            if ($tailParts[$i] !== null) {
                $resolvedTail .= $tailParts[$i];
            }
        }

        return $resolvedHead . $resolvedTail;
    }

    /**
     * ABI-encode a string value (length-prefixed, 32-byte padded)
     */
    private function encodeString(string $value): string
    {
        $hex = bin2hex($value);
        $byteLength = strlen($value);
        $paddedHex = str_pad($hex, ceil(strlen($hex) / 64) * 64, '0', STR_PAD_RIGHT);
        // If empty string, still need 0 bytes of data with 0-padded length
        if ($byteLength === 0) {
            $paddedHex = '';
        }
        return str_pad(dechex($byteLength), 64, '0', STR_PAD_LEFT) . $paddedHex;
    }

    /**
     * ABI-encode a string[] array
     */
    private function encodeStringArray(array $values): string
    {
        $count = count($values);
        // Array length
        $result = str_pad(dechex($count), 64, '0', STR_PAD_LEFT);

        if ($count === 0) {
            return $result;
        }

        // Each element is a dynamic type, so we need offsets
        $offsets = [];
        $encodedStrings = [];

        // Offset base: count * 32 bytes (one slot per element's offset)
        $offsetBase = $count * 32;
        $currentOffset = $offsetBase;

        foreach ($values as $val) {
            $offsets[] = str_pad(dechex($currentOffset), 64, '0', STR_PAD_LEFT);
            $encoded = $this->encodeString($val);
            $encodedStrings[] = $encoded;
            $currentOffset += strlen($encoded) / 2;
        }

        $result .= implode('', $offsets);
        $result .= implode('', $encodedStrings);

        return $result;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRIVATE: RPC & CRYPTO HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Make a JSON-RPC call
     */
    private function rpcCall(string $method, array $params = []): array
    {
        $request = Http::asJson();
        if (app()->environment('local')) {
            $request = $request->withoutVerifying();
        }

        $response = $request->post($this->nodeUrl, [
            'jsonrpc' => '2.0',
            'method' => $method,
            'params' => $params,
            'id' => 1,
        ]);

        if (!$response->successful()) {
            throw new Exception("RPC call failed: {$method} — " . $response->body());
        }

        return $response->json();
    }

    /**
     * Derive Ethereum address from private key
     */
    private function getAddressFromPrivateKey(string $privateKey): string
    {
        $privateKey = str_replace('0x', '', $privateKey);
        $secp256k1 = new \Elliptic\EC('secp256k1');
        $keyPair = $secp256k1->keyFromPrivate($privateKey, 'hex');
        $publicKey = substr($keyPair->getPublic('hex'), 2); // remove '04' prefix
        $hash = Keccak::hash(hex2bin($publicKey), 256);
        return '0x' . substr($hash, -40);
    }

    private function getNonce(string $address): int
    {
        $response = $this->rpcCall('eth_getTransactionCount', [$address, 'latest']);
        if (isset($response['error'])) {
            throw new Exception('Failed to get nonce: ' . $response['error']['message']);
        }
        return hexdec($response['result']);
    }

    private function getGasPrice(): int
    {
        try {
            $response = $this->rpcCall('eth_gasPrice');
            return isset($response['error']) ? 20000000000 : hexdec($response['result']);
        } catch (Exception $e) {
            return 20000000000; // fallback 20 gwei
        }
    }

    private function getChainId(): int
    {
        try {
            $response = $this->rpcCall('eth_chainId');
            return isset($response['error']) ? 31337 : hexdec($response['result']);
        } catch (Exception $e) {
            return 31337; // Hardhat default
        }
    }
}
