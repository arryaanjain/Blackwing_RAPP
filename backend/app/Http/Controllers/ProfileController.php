<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\Vendor;
use App\Models\User;
use App\Services\BlockchainService;
use App\Services\GstVerificationService;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get all available profiles for the authenticated user
     */
    public function getAvailableProfiles(Request $request): JsonResponse
    {
        $user = $request->user();
        $profiles = $user->getAvailableProfiles();
        
        return response()->json([
            'profiles' => $profiles,
            'current_profile_type' => $user->current_profile_type,
            'current_profile_id' => $user->current_profile_id,
        ]);
    }

    /**
     * Get current active profile
     */
    public function getCurrentProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentProfile = $user->currentProfile();
        
        if (!$currentProfile) {
            return response()->json([
                'message' => 'No active profile found',
                'profile' => null,
            ], 404);
        }
        
        return response()->json([
            'profile_type' => $user->current_profile_type,
            'profile' => $currentProfile->getApiData(),
        ]);
    }

    /**
     * Check if user has an existing company profile
     */
    public function checkCompanyProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyProfile = $user->companies()->first();
        
        return response()->json([
            'has_company_profile' => !is_null($companyProfile),
            'company_profile' => $companyProfile ? $companyProfile->getApiData() : null,
        ]);
    }

    /**
     * Check if user has an existing vendor profile
     */
    public function checkVendorProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $vendorProfile = $user->vendors()->first();
        
        return response()->json([
            'has_vendor_profile' => !is_null($vendorProfile),
            'vendor_profile' => $vendorProfile ? $vendorProfile->getApiData() : null,
        ]);
    }

    /**
     * Switch to a different profile
     */
    public function switchProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'profile_type' => 'required|in:company,vendor',
            'profile_id' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        
        // If profile_id is not provided, find the first profile of the specified type
        $profileId = $request->profile_id;
        if (!$profileId) {
            $profile = $user->getProfileByType($request->profile_type);
            if (!$profile) {
                return response()->json([
                    'message' => 'No profile found for the specified type',
                ], 404);
            }
            $profileId = $profile->id;
        }
        
        $success = $user->switchToProfile($request->profile_type, $profileId);
        
        if (!$success) {
            return response()->json([
                'message' => 'Invalid profile or you do not have access to this profile',
            ], 403);
        }
        
        $newProfile = $user->currentProfile();
        
        return response()->json([
            'message' => 'Profile switched successfully',
            'profile_type' => $user->current_profile_type,
            'profile' => $newProfile->getApiData(),
        ]);
    }

    /**
     * Verify GST number (API endpoint for frontend real-time validation)
     */
    public function verifyGst(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'gst_number' => 'required|string|size:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $gstNumber = strtoupper($request->gst_number);

        // Verify GST number
        $gstService = new GstVerificationService();
        $gstVerification = $gstService->verifyGstin($gstNumber);

        if (!$gstVerification['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $gstVerification['error'] ?? 'Invalid or inactive GSTIN',
                'data' => null,
            ], 200); // Return 200 with valid:false instead of 422
        }

        return response()->json([
            'valid' => true,
            'message' => 'GST number verified successfully',
            'data' => $gstVerification['data'],
        ]);
    }

    /**
     * Create a new company profile
     */
    public function createCompanyProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'gst_number' => 'required|string|size:15',
            'business_type' => 'required|string|max:255',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $data = $validator->validated();
        $data['gst_number'] = strtoupper($data['gst_number']);

        // Verify GST number with real API
        $gstService = new GstVerificationService();
        $gstVerification = $gstService->verifyGstin($data['gst_number']);

        if (!$gstVerification['valid']) {
            Log::warning('GST verification failed', [
                'gstin' => $data['gst_number'],
                'error' => $gstVerification['error']
            ]);

            return response()->json([
                'message' => 'GST verification failed',
                'errors' => ['gst_number' => [$gstVerification['error'] ?? 'Invalid or inactive GSTIN']],
            ], 422);
        }

        // Log successful verification
        Log::info('GST verified successfully', [
            'gstin' => $data['gst_number'],
            'legal_name' => $gstVerification['data']['legal_name'] ?? null,
            'verified_via' => $gstVerification['data']['verified_via'] ?? 'unknown'
        ]);
        
        // Check if user already has a company with the same name
        $existingCompany = $user->companies()
            ->where('company_name', $data['company_name'])
            ->first();
            
        if ($existingCompany) {
            return response()->json([
                'message' => 'You already have a company profile with this name',
            ], 409);
        }
        
        DB::beginTransaction();
        
        try {
            $company = $user->companies()->create($data);
            
            // Register on blockchain
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->registerCompany(
                $company->company_name,
                $company->share_id,
                $company->business_type,
                $company->location ?? ''
            );
            
            if ($blockchainResult['success']) {
                // Update company with blockchain transaction data
                $company->update([
                    'blockchain_tx_hash' => $blockchainResult['transactionHash'],
                    'blockchain_registered_at' => now(),
                    'blockchain_verified' => true
                ]);
                
                DB::commit();
                
                Log::info('Company registered successfully on blockchain', [
                    'company_id' => $company->id,
                    'share_id' => $company->share_id,
                    'tx_hash' => $blockchainResult['transactionHash'],
                    'block_number' => $blockchainResult['blockNumber'],
                    'gas_used' => $blockchainResult['gasUsed']
                ]);
                
                return response()->json([
                    'message' => 'Company profile created and registered on blockchain successfully',
                    'company' => $company->getApiData(),
                    'blockchain' => [
                        'transaction_hash' => $blockchainResult['transactionHash'],
                        'block_number' => $blockchainResult['blockNumber'],
                        'gas_used' => $blockchainResult['gasUsed']
                    ]
                ], 201);
                
            } else {
                DB::rollBack();
                
                Log::error('Blockchain registration failed, rolling back company creation', [
                    'company_name' => $company->company_name,
                    'share_id' => $company->share_id,
                    'error' => $blockchainResult['error'] ?? 'Unknown blockchain error'
                ]);
                
                return response()->json([
                    'message' => 'Failed to register company on blockchain',
                    'error' => 'Blockchain registration failed'
                ], 500);
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Company creation and blockchain registration failed', [
                'user_id' => $user->id,
                'company_name' => $request->company_name,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to create company profile',
                'error' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
        
        // Auto-switch to this new profile
        $user->switchToProfile('company', $company->id);
        
        return response()->json([
            'message' => 'Company profile created successfully',
            'profile' => $company->getApiData(),
        ], 201);
    }

    /**
     * Create a new vendor profile
     */
    public function createVendorProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'required|string|max:255',
            'specialization' => 'required|string|max:255',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'hourly_rate' => 'nullable|numeric|min:0',
            'portfolio_url' => 'nullable|url|max:255',
            'years_of_experience' => 'nullable|integer|min:0|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        
        // Check if user already has a vendor with the same name
        $existingVendor = $user->vendors()
            ->where('vendor_name', $request->vendor_name)
            ->first();
            
        if ($existingVendor) {
            return response()->json([
                'message' => 'You already have a vendor profile with this name',
            ], 409);
        }
        
        DB::beginTransaction();
        
        try {
            $vendor = $user->vendors()->create($validator->validated());
            
            // Register on blockchain
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->registerVendor(
                $vendor->vendor_name,
                $vendor->share_id,
                $vendor->specialization,
                $vendor->location ?? ''
            );
            
            if ($blockchainResult['success']) {
                // Update vendor with blockchain transaction data
                $vendor->update([
                    'blockchain_tx_hash' => $blockchainResult['transactionHash'],
                    'blockchain_registered_at' => now(),
                    'blockchain_verified' => true
                ]);
                
                DB::commit();
                
                Log::info('Vendor registered successfully on blockchain', [
                    'vendor_id' => $vendor->id,
                    'share_id' => $vendor->share_id,
                    'tx_hash' => $blockchainResult['transactionHash'],
                    'block_number' => $blockchainResult['blockNumber'],
                    'gas_used' => $blockchainResult['gasUsed']
                ]);
                
                return response()->json([
                    'message' => 'Vendor profile created and registered on blockchain successfully',
                    'vendor' => $vendor->getApiData(),
                    'blockchain' => [
                        'transaction_hash' => $blockchainResult['transactionHash'],
                        'block_number' => $blockchainResult['blockNumber'],
                        'gas_used' => $blockchainResult['gasUsed']
                    ]
                ], 201);
                
            } else {
                DB::rollBack();
                
                Log::error('Blockchain registration failed, rolling back vendor creation', [
                    'vendor_name' => $vendor->vendor_name,
                    'share_id' => $vendor->share_id,
                    'error' => $blockchainResult['error'] ?? 'Unknown blockchain error'
                ]);
                
                return response()->json([
                    'message' => 'Failed to register vendor on blockchain',
                    'error' => 'Blockchain registration failed'
                ], 500);
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Vendor creation and blockchain registration failed', [
                'user_id' => $user->id,
                'vendor_name' => $request->vendor_name,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to create vendor profile',
                'error' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
        
        // Auto-switch to this new profile
        $user->switchToProfile('vendor', $vendor->id);
        
        return response()->json([
            'message' => 'Vendor profile created successfully',
            'profile' => $vendor->getApiData(),
        ], 201);
    }

    /**
     * Update company profile
     */
    public function updateCompanyProfile(Request $request, $companyId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|required|string|max:255',
            'gst_number' => 'sometimes|required|string|size:15',
            'business_type' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $company = $user->companies()->find($companyId);
        
        if (!$company) {
            return response()->json([
                'message' => 'Company profile not found or you do not have access',
            ], 404);
        }
        
        $data = $validator->validated();
        if (array_key_exists('gst_number', $data)) {
            $data['gst_number'] = strtoupper($data['gst_number']);

            // Verify GST number with real API
            $gstService = new GstVerificationService();
            $gstVerification = $gstService->verifyGstin($data['gst_number']);

            if (!$gstVerification['valid']) {
                Log::warning('GST verification failed during update', [
                    'gstin' => $data['gst_number'],
                    'error' => $gstVerification['error']
                ]);

                return response()->json([
                    'message' => 'GST verification failed',
                    'errors' => ['gst_number' => [$gstVerification['error'] ?? 'Invalid or inactive GSTIN']],
                ], 422);
            }

            // Log successful verification
            Log::info('GST verified successfully during update', [
                'gstin' => $data['gst_number'],
                'legal_name' => $gstVerification['data']['legal_name'] ?? null,
                'verified_via' => $gstVerification['data']['verified_via'] ?? 'unknown'
            ]);
        }
        $company->update($data);
        
        return response()->json([
            'message' => 'Company profile updated successfully',
            'company' => $company->fresh()->getApiData(),
        ]);
    }

    private function isValidGstin(string $gstin): bool
    {
        $value = strtoupper(trim($gstin));
        if (!preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $value)) {
            return false;
        }
        $factor = [1,2,3,4,5,6,7,8,9,10,1,2,3,4];
        $sum = 0;
        for ($i = 0; $i < 14; $i++) {
            $ch = $value[$i];
            $val = $this->toBase36($ch);
            if ($val < 0) {
                return false;
            }
            $prod = $val * $factor[$i];
            $sum += intdiv($prod, 36) + ($prod % 36);
        }
        $checkCode = (36 - ($sum % 36)) % 36;
        $checkChar = $this->fromBase36($checkCode);
        return $value[14] === $checkChar;
    }

    private function toBase36(string $c): int
    {
        $code = ord($c);
        if ($code >= 48 && $code <= 57) return $code - 48;
        if ($code >= 65 && $code <= 90) return $code - 55;
        return -1;
    }

    private function fromBase36(int $n): string
    {
        if ($n >= 0 && $n <= 9) return chr(48 + $n);
        return chr(55 + ($n - 10));
    }

    /**
     * Update vendor profile
     */
    public function updateVendorProfile(Request $request, $vendorId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vendor_name' => 'sometimes|required|string|max:255',
            'specialization' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'hourly_rate' => 'nullable|numeric|min:0',
            'portfolio_url' => 'nullable|url|max:255',
            'years_of_experience' => 'nullable|integer|min:0|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $vendor = $user->vendors()->find($vendorId);
        
        if (!$vendor) {
            return response()->json([
                'message' => 'Vendor profile not found or you do not have access',
            ], 404);
        }
        
        $vendor->update($validator->validated());
        
        return response()->json([
            'message' => 'Vendor profile updated successfully',
            'vendor' => $vendor->fresh()->getApiData(),
        ]);
    }

    /**
     * Delete company profile
     */
    public function deleteCompanyProfile(Request $request, $companyId): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->find($companyId);
        
        if (!$company) {
            return response()->json([
                'message' => 'Company profile not found or you do not have access',
            ], 404);
        }
        
        // If this is the current active profile, clear it
        if ($user->current_profile_type === 'company' && $user->current_profile_id === $company->id) {
            $user->current_profile_type = null;
            $user->current_profile_id = null;
            $user->save();
        }
        
        $company->delete();
        
        return response()->json([
            'message' => 'Company profile deleted successfully',
        ]);
    }

    /**
     * Delete vendor profile
     */
    public function deleteVendorProfile(Request $request, $vendorId): JsonResponse
    {
        $user = $request->user();
        $vendor = $user->vendors()->find($vendorId);
        
        if (!$vendor) {
            return response()->json([
                'message' => 'Vendor profile not found or you do not have access',
            ], 404);
        }
        
        // If this is the current active profile, clear it
        if ($user->current_profile_type === 'vendor' && $user->current_profile_id === $vendor->id) {
            $user->current_profile_type = null;
            $user->current_profile_id = null;
            $user->save();
        }
        
        $vendor->delete();
        
        return response()->json([
            'message' => 'Vendor profile deleted successfully',
        ]);
    }
}
