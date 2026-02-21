<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Web3p\EthereumTx\Transaction;
use kornrunner\Keccak;

class BlockchainService
{
    private $nodeUrl;
    private $contractAddress;
    private $adminPrivateKey;
    private $contractAbi;
    
    public function __construct()
    {
        $this->nodeUrl = env('BLOCKCHAIN_NODE_URL', 'http://127.0.0.1:8545');
        $this->contractAddress = env('BLOCKCHAIN_CONTRACT_ADDRESS', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
        $this->adminPrivateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
        $this->loadContractAbi();
        $this->validateProductionConfig();
    }

    /**
     * Validate that production configuration is properly set
     */
    private function validateProductionConfig()
    {
        if (app()->environment('production')) {
            $issues = [];
            
            // Check for placeholder values that shouldn't be in production
            if (str_contains($this->nodeUrl, 'REPLACE_WITH') || $this->nodeUrl === 'url') {
                $issues[] = 'BLOCKCHAIN_NODE_URL is not configured for production';
            }
            
            if (str_contains($this->contractAddress, 'REPLACE_WITH') || $this->contractAddress === 'contract_address') {
                $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS is not configured for production';
            }
            
            if (str_contains($this->adminPrivateKey, 'REPLACE_WITH') || $this->adminPrivateKey === 'private_key') {
                $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY is not configured for production';
            }
            
            // Check for local development values in production
            if (str_contains($this->nodeUrl, '127.0.0.1') || str_contains($this->nodeUrl, 'localhost')) {
                $issues[] = 'BLOCKCHAIN_NODE_URL should not use localhost in production';
            }
            
            if ($this->contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
                $issues[] = 'BLOCKCHAIN_CONTRACT_ADDRESS is using local development address in production';
            }
            
            if ($this->adminPrivateKey === '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') {
                $issues[] = 'BLOCKCHAIN_ADMIN_PRIVATE_KEY is using local development key in production (SECURITY RISK!)';
            }
            
            if (!empty($issues)) {
                Log::error('Blockchain configuration issues detected in production:', $issues);
                throw new Exception('Blockchain not properly configured for production: ' . implode(', ', $issues));
            }
        }
    }

    /**
     * Load the contract ABI from the artifacts
     * Using RegistrationContract.sol (deployed to Sepolia)
     */
    private function loadContractAbi()
    {
        try {
            // Path to RegistrationContract ABI in backend storage
            $abiPath = storage_path('blockchain/artifacts/contracts/RegistrationContract.sol/RegistrationContract.json');
            
            Log::info('Attempting to load contract ABI', ['path' => $abiPath]);
            
            if (file_exists($abiPath)) {
                $contractData = json_decode(file_get_contents($abiPath), true);
                $this->contractAbi = $contractData['abi'];
                Log::info('Contract ABI loaded successfully', [
                    'contract' => 'RegistrationContract',
                    'functions' => count($this->contractAbi)
                ]);
            } else {
                Log::error('Contract ABI not found', [
                    'path' => $abiPath,
                    'file_exists' => file_exists($abiPath)
                ]);
                $this->contractAbi = null;
            }
        } catch (Exception $e) {
            Log::error('Failed to load contract ABI: ' . $e->getMessage());
            $this->contractAbi = null;
        }
    }

    /**
     * Register a company on the blockchain
     */
    public function registerCompany($companyName, $shareId, $businessType, $location = '')
    {
        try {
            Log::info('Registering company on blockchain', [
                'shareId' => $shareId,
                'companyName' => $companyName,
                'businessType' => $businessType,
                'location' => $location
            ]);

            // RegistrationContract uses: registerEntity(shareId, entityId, name, entityType, ipfsHash)
            // EntityType.COMPANY = 0
            $functionSignature = $this->getFunctionSignature('registerEntity', ['string', 'string', 'string', 'uint8', 'string']);
            
            Log::info('Function signature calculated', [
                'signature' => $functionSignature,
                'functionString' => 'registerEntity(string,string,string,uint8,string)'
            ]);
            
            // Encode parameters: shareId, entityId (use shareId), name, entityType (0 for COMPANY), ipfsHash (empty)
            $encodedParams = $this->encodeRegisterEntityParameters(
                $shareId,              // shareId
                $shareId,              // entityId (use shareId as ID)
                $companyName,          // name
                0,                     // entityType (0 = COMPANY)
                ''                     // ipfsHash (empty for now)
            );
            
            Log::info('Encoded parameters', [
                'params' => $encodedParams,
                'length' => strlen($encodedParams)
            ]);
            
            $data = '0x' . $functionSignature . $encodedParams;
            
            Log::info('Final transaction data', [
                'data' => $data,
                'dataLength' => strlen($data)
            ]);

            // Send the transaction using web3p library
            $transactionHash = $this->sendTransaction($data, 500000);

            // Wait for the transaction to be mined
            $receipt = $this->waitForTransactionReceipt($transactionHash);

            Log::info('Company registered on blockchain successfully', [
                'shareId' => $shareId,
                'companyName' => $companyName,
                'transactionHash' => $transactionHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed'])
            ]);

            return [
                'success' => true,
                'transactionHash' => $transactionHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed'])
            ];
            
        } catch (Exception $e) {
            Log::error('Blockchain company registration failed: ' . $e->getMessage());
            throw new Exception('Blockchain registration failed: ' . $e->getMessage());
        }
    }

    /**
     * Register a vendor on the blockchain
     */
    public function registerVendor($vendorName, $shareId, $specialization, $location = '')
    {
        try {
            Log::info('Registering vendor on blockchain', [
                'shareId' => $shareId,
                'vendorName' => $vendorName,
                'specialization' => $specialization,
                'location' => $location
            ]);

            // RegistrationContract uses: registerEntity(shareId, entityId, name, entityType, ipfsHash)
            // EntityType.VENDOR = 1
            $functionSignature = $this->getFunctionSignature('registerEntity', ['string', 'string', 'string', 'uint8', 'string']);
            
            // Encode parameters: shareId, entityId (use shareId), name, entityType (1 for VENDOR), ipfsHash (empty)
            $encodedParams = $this->encodeRegisterEntityParameters(
                $shareId,              // shareId
                $shareId,              // entityId (use shareId as ID)
                $vendorName,           // name
                1,                     // entityType (1 = VENDOR)
                ''                     // ipfsHash (empty for now)
            );
            
            $data = '0x' . $functionSignature . $encodedParams;

            // Send the transaction using web3p library
            $transactionHash = $this->sendTransaction($data, 500000);

            // Wait for the transaction to be mined
            $receipt = $this->waitForTransactionReceipt($transactionHash);

            Log::info('Vendor registered on blockchain successfully', [
                'shareId' => $shareId,
                'vendorName' => $vendorName,
                'transactionHash' => $transactionHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed'])
            ]);

            return [
                'success' => true,
                'transactionHash' => $transactionHash,
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed'])
            ];
            
        } catch (Exception $e) {
            Log::error('Blockchain vendor registration failed: ' . $e->getMessage());
            throw new Exception('Blockchain registration failed: ' . $e->getMessage());
        }
    }

    /**
     * Verify a share ID on the blockchain
     */
    public function verifyShareId(string $shareId): array
    {
        try {
            Log::info('Simulating share ID verification on blockchain', [
                'shareId' => $shareId,
                'contractAddress' => $this->contractAddress
            ]);
            
            // For now, simulate verification
            // In real implementation, you would call the smart contract's verify function
            
            return [
                'verified' => true,
                'exists_on_blockchain' => true,
                'registration_type' => 'company', // or 'vendor'
                'registered_at' => now()->toISOString(),
                'message' => 'Share ID verified on blockchain (simulated)'
            ];
            
        } catch (Exception $e) {
            Log::error('Failed to verify share ID on blockchain', [
                'error' => $e->getMessage(),
                'shareId' => $shareId
            ]);
            
            return [
                'verified' => false,
                'exists_on_blockchain' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to verify share ID on blockchain'
            ];
        }
    }

    /**
     * Get current block number from blockchain
     */
    public function getCurrentBlockNumber(): ?int
    {
        try {
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_blockNumber',
                'params' => [],
                'id' => 1
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['result'])) {
                    return hexdec($data['result']);
                }
            }
            
            return null;
        } catch (Exception $e) {
            Log::error('Failed to get current block number', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Check if blockchain connection is working
     */
    public function isConnectionHealthy(): bool
    {
        try {
            $blockNumber = $this->getCurrentBlockNumber();
            return $blockNumber !== null;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus(string $transactionHash): array
    {
        try {
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionReceipt',
                'params' => [$transactionHash],
                'id' => 1
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['result']) && $data['result']) {
                    $receipt = $data['result'];
                    return [
                        'confirmed' => true,
                        'status' => $receipt['status'] === '0x1' ? 'success' : 'failed',
                        'block_number' => hexdec($receipt['blockNumber']),
                        'gas_used' => hexdec($receipt['gasUsed']),
                    ];
                }
            }
            
            return [
                'confirmed' => false,
                'status' => 'pending',
                'message' => 'Transaction not yet confirmed'
            ];
            
        } catch (Exception $e) {
            Log::error('Failed to get transaction status', [
                'error' => $e->getMessage(),
                'transactionHash' => $transactionHash
            ]);
            
            return [
                'confirmed' => false,
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get platform statistics from blockchain
     */
    public function getPlatformStatsFromBlockchain(): array
    {
        try {
            // Simulate getting stats from blockchain
            // In real implementation, you would call smart contract view functions
            
            return [
                'total_companies_on_chain' => 0,
                'total_vendors_on_chain' => 0,
                'total_registrations' => 0,
                'contract_address' => $this->contractAddress,
                'latest_block' => $this->getCurrentBlockNumber(),
                'message' => 'Platform stats retrieved from blockchain (simulated)'
            ];
            
        } catch (Exception $e) {
            Log::error('Failed to get platform stats from blockchain', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => $e->getMessage(),
                'message' => 'Failed to get platform stats from blockchain'
            ];
        }
    }

    /**
     * Verify a transaction on the blockchain
     */
    public function verifyTransaction($transactionHash)
    {
        try {
            $response = Http::post('http://127.0.0.1:8545', [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionReceipt',
                'params' => [$transactionHash],
                'id' => 1
            ]);
            
            $result = $response->json();
            
            if (isset($result['error'])) {
                return [
                    'success' => false,
                    'error' => $result['error']['message']
                ];
            }
            
            $receipt = $result['result'];
            
            if (!$receipt) {
                return [
                    'success' => false,
                    'error' => 'Transaction not found'
                ];
            }
            
            return [
                'success' => true,
                'status' => hexdec($receipt['status']) === 1 ? 'success' : 'failed',
                'blockNumber' => hexdec($receipt['blockNumber']),
                'gasUsed' => hexdec($receipt['gasUsed']),
                'contractAddress' => $receipt['contractAddress'] ?? null,
                'from' => $receipt['from'],
                'to' => $receipt['to']
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Helper method to encode string parameters for contract calls
     */
    private function encodeString($string)
    {
        // Simplified ABI encoding - pad to 32 bytes
        $hex = bin2hex($string);
        $length = strlen($hex);
        $paddedLength = str_pad(dechex($length / 2), 64, '0', STR_PAD_LEFT);
        $paddedString = str_pad($hex, ceil($length / 64) * 64, '0', STR_PAD_RIGHT);
        return $paddedLength . $paddedString;
    }

    /**
     * Wait for transaction to be mined and return receipt
     */
    private function waitForTransactionReceipt($transactionHash, $maxAttempts = 30)
    {
        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionReceipt',
                'params' => [$transactionHash],
                'id' => 1
            ]);
            
            $result = $response->json();
            
            if (isset($result['result']) && $result['result']) {
                $receipt = $result['result'];
                
                if (hexdec($receipt['status']) !== 1) {
                    throw new Exception('Transaction failed on blockchain');
                }
                
                return $receipt;
            }
            
            // Wait 1 second before next attempt
            sleep(1);
        }
        
        throw new Exception('Transaction confirmation timeout');
    }

    /**
     * Send a transaction to the blockchain using web3p library
     * 
     * @param string $data The encoded function call data
     * @param int $gasLimit Gas limit for the transaction
     * @return string Transaction hash
     */
    private function sendTransaction($data, $gasLimit = 500000)
    {
        try {
            // Get transaction parameters
            $from = $this->getAddressFromPrivateKey($this->adminPrivateKey);
            $nonce = $this->getNonce($from);
            $gasPrice = $this->getGasPrice();
            $chainId = $this->getChainId();

            // Create transaction array
            $txParams = [
                'nonce' => '0x' . dechex($nonce),
                'gasPrice' => '0x' . dechex($gasPrice),
                'gasLimit' => '0x' . dechex($gasLimit),
                'to' => $this->contractAddress,
                'value' => '0x0',
                'data' => $data,
                'chainId' => $chainId
            ];

            // Create and sign the transaction
            $tx = new Transaction($txParams);
            $privateKey = str_replace('0x', '', $this->adminPrivateKey);
            $signedTx = '0x' . $tx->sign($privateKey);

            // Send the signed transaction
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_sendRawTransaction',
                'params' => [$signedTx],
                'id' => 1
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to send transaction: ' . $response->body());
            }

            $result = $response->json();
            
            if (isset($result['error'])) {
                throw new Exception('RPC Error: ' . json_encode($result['error']));
            }

            return $result['result'];
            
        } catch (Exception $e) {
            Log::error('Failed to send blockchain transaction', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Get Ethereum address from private key
     */
    private function getAddressFromPrivateKey($privateKey)
    {
        $privateKey = str_replace('0x', '', $privateKey);
        
        // Use secp256k1 to get public key
        $secp256k1 = new \Elliptic\EC('secp256k1');
        $keyPair = $secp256k1->keyFromPrivate($privateKey, 'hex');
        $publicKey = $keyPair->getPublic('hex');
        
        // Remove '04' prefix from uncompressed public key
        $publicKey = substr($publicKey, 2);
        
        // Hash with Keccak-256 and take last 20 bytes
        $hash = Keccak::hash(hex2bin($publicKey), 256);
        
        return '0x' . substr($hash, -40);
    }

    /**
     * Get current gas price from network
     */
    private function getGasPrice()
    {
        try {
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_gasPrice',
                'params' => [],
                'id' => 1
            ]);

            $result = $response->json();
            if (isset($result['error'])) {
                // Fallback to 20 gwei if gas price fetch fails
                return 20000000000;
            }

            return hexdec($result['result']);
        } catch (Exception $e) {
            // Fallback to 20 gwei
            return 20000000000;
        }
    }

    /**
     * Get chain ID from network
     */
    private function getChainId()
    {
        try {
            $response = Http::post($this->nodeUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_chainId',
                'params' => [],
                'id' => 1
            ]);

            $result = $response->json();
            if (isset($result['error'])) {
                throw new Exception('Failed to get chain ID: ' . $result['error']['message']);
            }

            return hexdec($result['result']);
        } catch (Exception $e) {
            Log::error('Failed to get chain ID: ' . $e->getMessage());
            // Default to Sepolia (11155111) as fallback
            return 11155111;
        }
    }

    /**
     * Get nonce for an address
     */
    private function getNonce($address)
    {
        $response = Http::post($this->nodeUrl, [
            'jsonrpc' => '2.0',
            'method' => 'eth_getTransactionCount',
            'params' => [$address, 'latest'],
            'id' => 1
        ]);

        $result = $response->json();
        if (isset($result['error'])) {
            throw new Exception('Failed to get nonce: ' . $result['error']['message']);
        }

        return hexdec($result['result']);
    }

    /**
     * Get function signature hash (first 4 bytes of keccak256)
     */
    private function getFunctionSignature($functionName, $paramTypes)
    {
        $functionString = $functionName . '(' . implode(',', $paramTypes) . ')';
        // Use Keccak-256, not SHA3-256
        $hash = Keccak::hash($functionString, 256);
        return substr($hash, 0, 8);
    }

    /**
     * Encode parameters for contract function call
     */
    private function encodeParameters($params)
    {
        $encoded = '';
        $dynamicData = '';
        $offset = count($params) * 32; // Each parameter takes 32 bytes for offset/value

        foreach ($params as $param) {
            // For strings, we store the offset and append the actual data later
            $offsetHex = dechex($offset);
            // Ensure even length
            if (strlen($offsetHex) % 2 !== 0) {
                $offsetHex = '0' . $offsetHex;
            }
            $encoded .= str_pad($offsetHex, 64, '0', STR_PAD_LEFT);
            
            // Prepare the dynamic data
            $paramBytes = strlen($param);
            $lengthHex = dechex($paramBytes);
            // Ensure even length
            if (strlen($lengthHex) % 2 !== 0) {
                $lengthHex = '0' . $lengthHex;
            }
            $dynamicData .= str_pad($lengthHex, 64, '0', STR_PAD_LEFT); // Length
            
            $paramHex = bin2hex($param);
            // Calculate padding to nearest 32-byte boundary (64 hex chars = 32 bytes)
            $hexLength = strlen($paramHex);
            $paddedLength = ceil($hexLength / 64) * 64;
            $dynamicData .= str_pad($paramHex, $paddedLength, '0', STR_PAD_RIGHT); // Data
            
            // Update offset for next parameter (in BYTES, not hex chars)
            // 32 bytes for length + padded data bytes
            $offset += 32 + ($paddedLength / 2);
        }

        return $encoded . $dynamicData;
    }

    /**
     * Encode parameters for registerEntity function call
     * registerEntity(string shareId, string entityId, string name, uint8 entityType, string ipfsHash)
     */
    private function encodeRegisterEntityParameters($shareId, $entityId, $name, $entityType, $ipfsHash)
    {
        // For registerEntity: 3 strings + 1 uint8 + 1 string
        // Offsets for the 5 parameters (32 bytes each)
        $encoded = '';
        $dynamicData = '';
        
        // Calculate offsets for dynamic types (strings)
        // Fixed: 5 parameters * 32 bytes = 160 bytes offset start
        $offset = 160;
        
        // Param 1: shareId (string) - offset
        $shareIdOffset = $offset;
        $encoded .= str_pad(dechex($shareIdOffset), 64, '0', STR_PAD_LEFT);
        
        // Param 2: entityId (string) - offset
        $shareIdBytes = strlen($shareId);
        $shareIdPadded = ceil(strlen(bin2hex($shareId)) / 64) * 64;
        $entityIdOffset = $shareIdOffset + 32 + ($shareIdPadded / 2);
        $encoded .= str_pad(dechex($entityIdOffset), 64, '0', STR_PAD_LEFT);
        
        // Param 3: name (string) - offset
        $entityIdBytes = strlen($entityId);
        $entityIdPadded = ceil(strlen(bin2hex($entityId)) / 64) * 64;
        $nameOffset = $entityIdOffset + 32 + ($entityIdPadded / 2);
        $encoded .= str_pad(dechex($nameOffset), 64, '0', STR_PAD_LEFT);
        
        // Param 4: entityType (uint8) - value (not offset)
        $encoded .= str_pad(dechex($entityType), 64, '0', STR_PAD_LEFT);
        
        // Param 5: ipfsHash (string) - offset
        $nameBytes = strlen($name);
        $namePadded = ceil(strlen(bin2hex($name)) / 64) * 64;
        $ipfsHashOffset = $nameOffset + 32 + ($namePadded / 2);
        $encoded .= str_pad(dechex($ipfsHashOffset), 64, '0', STR_PAD_LEFT);
        
        // Now encode the actual string data
        // ShareId
        $dynamicData .= str_pad(dechex($shareIdBytes), 64, '0', STR_PAD_LEFT);
        $dynamicData .= str_pad(bin2hex($shareId), $shareIdPadded, '0', STR_PAD_RIGHT);
        
        // EntityId
        $dynamicData .= str_pad(dechex($entityIdBytes), 64, '0', STR_PAD_LEFT);
        $dynamicData .= str_pad(bin2hex($entityId), $entityIdPadded, '0', STR_PAD_RIGHT);
        
        // Name
        $dynamicData .= str_pad(dechex($nameBytes), 64, '0', STR_PAD_LEFT);
        $dynamicData .= str_pad(bin2hex($name), $namePadded, '0', STR_PAD_RIGHT);
        
        // IpfsHash
        $ipfsHashBytes = strlen($ipfsHash);
        $ipfsHashPadded = ceil(strlen(bin2hex($ipfsHash)) / 64) * 64;
        $dynamicData .= str_pad(dechex($ipfsHashBytes), 64, '0', STR_PAD_LEFT);
        $dynamicData .= str_pad(bin2hex($ipfsHash), $ipfsHashPadded, '0', STR_PAD_RIGHT);
        
        return $encoded . $dynamicData;
    }
}
