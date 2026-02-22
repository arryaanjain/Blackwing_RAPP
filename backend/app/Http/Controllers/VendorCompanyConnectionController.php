<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\VendorCompanyConnectionRequest;
use App\Models\VendorCompanyConnection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Services\BlockchainService;

class VendorCompanyConnectionController extends Controller
{
    /**
     * Send a connection request from vendor to company using share_id
     */
    public function sendConnectionRequest(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Ensure user is a vendor
            if ($user->current_profile_type !== 'vendor') {
                return response()->json([
                    'message' => 'Only vendors can send connection requests',
                    'error' => 'unauthorized_user_type'
                ], 403);
            }

            $validated = $request->validate([
                'company_share_id' => 'required|string|max:255',
                'message' => 'nullable|string|max:1000',
            ]);

            // Find the company by share_id
            $company = Company::where('share_id', $validated['company_share_id'])->first();
            
            if (!$company) {
                return response()->json([
                    'message' => 'Company not found with the provided share ID',
                    'error' => 'company_not_found'
                ], 404);
            }

            // Check if connection already exists
            $existingConnection = VendorCompanyConnection::where('vendor_user_id', $user->id)
                ->where('company_user_id', $company->user_id)
                ->where('is_active', true)
                ->first();

            if ($existingConnection) {
                return response()->json([
                    'message' => 'You are already connected to this company',
                    'error' => 'already_connected'
                ], 409);
            }

            // Check if there's already a pending request
            $pendingRequest = VendorCompanyConnectionRequest::where('vendor_user_id', $user->id)
                ->where('company_share_id', $validated['company_share_id'])
                ->where('status', VendorCompanyConnectionRequest::STATUS_PENDING)
                ->first();

            if ($pendingRequest) {
                return response()->json([
                    'message' => 'You already have a pending request to this company',
                    'error' => 'request_already_pending',
                    'request' => $pendingRequest
                ], 409);
            }

            // ── Blockchain first: record connection request on-chain ──
            $vendorProfile = $user->vendorProfile;
            $vendorShareId = $vendorProfile ? $vendorProfile->share_id : 'unknown';
            $messageHash = hash('sha256', $validated['message'] ?? '');

            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->sendConnectionRequest(
                $vendorShareId,
                $validated['company_share_id'],
                $messageHash
            );

            // Get vendor profile data for snapshot
            $vendorProfileData = $vendorProfile ? [
                'vendor_name' => $vendorProfile->vendor_name,
                'specialization' => $vendorProfile->specialization,
                'location' => $vendorProfile->location,
                'contact_email' => $vendorProfile->contact_email ?? null,
                'business_description' => $vendorProfile->business_description ?? null,
            ] : null;

            // ── Off-chain: persist to DB only after blockchain success ──
            $connectionRequest = VendorCompanyConnectionRequest::create([
                'vendor_user_id' => $user->id,
                'company_share_id' => $validated['company_share_id'],
                'company_user_id' => $company->user_id,
                'message' => $validated['message'] ?? null,
                'vendor_profile_data' => $vendorProfileData,
                'expires_at' => now()->addDays(30),
                'blockchain_tx_hash' => $blockchainResult['transactionHash'],
            ]);

            Log::info('Vendor connection request sent (on-chain + off-chain)', [
                'vendor_id' => $user->id,
                'company_share_id' => $validated['company_share_id'],
                'request_id' => $connectionRequest->id,
                'tx_hash' => $blockchainResult['transactionHash'],
            ]);

            return response()->json([
                'message' => 'Connection request sent successfully',
                'request' => $connectionRequest->load(['vendor', 'company']),
                'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to send connection request', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'message' => 'Failed to send connection request',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Get vendor's sent connection requests
     */
    public function getVendorRequests(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->current_profile_type !== 'vendor') {
                return response()->json([
                    'message' => 'Only vendors can view their requests',
                    'error' => 'unauthorized_user_type'
                ], 403);
            }

            $requests = VendorCompanyConnectionRequest::byVendor($user->id)
                ->with(['company.companyProfile'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'requests' => $requests
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get vendor requests', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve requests',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Cancel a pending connection request (vendor only)
     */
    public function cancelRequest(VendorCompanyConnectionRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Ensure the request belongs to the authenticated vendor
            if ($request->vendor_user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only cancel your own requests',
                    'error' => 'unauthorized'
                ], 403);
            }

            if (!$request->isPending()) {
                return response()->json([
                    'message' => 'Only pending requests can be cancelled',
                    'error' => 'invalid_status'
                ], 400);
            }

            // ── Blockchain first ──
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->cancelConnectionRequest($request->id);

            // ── Off-chain ──
            $request->cancel();
            $request->update(['blockchain_tx_hash' => $blockchainResult['transactionHash']]);

            Log::info('Vendor connection request cancelled (on-chain + off-chain)', [
                'request_id' => $request->id,
                'vendor_id' => $user->id,
                'tx_hash' => $blockchainResult['transactionHash'],
            ]);

            return response()->json([
                'message' => 'Connection request cancelled successfully',
                'request' => $request->fresh(),
                'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel connection request', [
                'error' => $e->getMessage(),
                'request_id' => $request->id ?? null
            ]);
            
            return response()->json([
                'message' => 'Failed to cancel request',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Get company's received connection requests
     */
    public function getCompanyRequests(): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user has a company profile (not just current_profile_type,
            // since the same user may switch between vendor/company modes)
            if (!$user->companyProfile) {
                return response()->json([
                    'message' => 'Only companies can view their requests',
                    'error' => 'unauthorized_user_type'
                ], 403);
            }

            $requests = VendorCompanyConnectionRequest::byCompany($user->id)
                ->with(['vendor.vendorProfile'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'requests' => $requests
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get company requests', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve requests',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Approve a connection request (company only)
     */
    public function approveRequest(VendorCompanyConnectionRequest $request, Request $httpRequest): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Ensure the request is for the authenticated company
            if ($request->company_user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only approve requests for your company',
                    'error' => 'unauthorized'
                ], 403);
            }

            if (!$request->isPending()) {
                return response()->json([
                    'message' => 'Only pending requests can be approved',
                    'error' => 'invalid_status'
                ], 400);
            }

            $validated = $httpRequest->validate([
                'review_notes' => 'nullable|string|max:1000',
            ]);

            // ── Blockchain first ──
            $reviewNotesHash = hash('sha256', $validated['review_notes'] ?? '');
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->approveConnectionRequest($request->id, $reviewNotesHash);

            // ── Off-chain: approve + create connection ──
            DB::transaction(function () use ($request, $user, $validated, $blockchainResult) {
                $request->approve($user, $validated['review_notes'] ?? null);
                $request->update(['blockchain_tx_hash' => $blockchainResult['transactionHash']]);

                VendorCompanyConnection::create([
                    'vendor_user_id' => $request->vendor_user_id,
                    'company_user_id' => $user->id,
                    'company_share_id' => $request->company_share_id,
                    'approved_by' => $user->id,
                    'original_request_id' => $request->id,
                    'connected_at' => now(),
                    'blockchain_tx_hash' => $blockchainResult['transactionHash'],
                ]);
            });

            Log::info('Vendor connection request approved (on-chain + off-chain)', [
                'request_id' => $request->id,
                'company_id' => $user->id,
                'vendor_id' => $request->vendor_user_id,
                'tx_hash' => $blockchainResult['transactionHash'],
            ]);

            return response()->json([
                'message' => 'Connection request approved successfully',
                'request' => $request->fresh()->load(['vendor', 'company']),
                'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to approve connection request', [
                'error' => $e->getMessage(),
                'request_id' => $request->id ?? null
            ]);
            
            return response()->json([
                'message' => 'Failed to approve request',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Deny a connection request (company only)
     */
    public function denyRequest(VendorCompanyConnectionRequest $request, Request $httpRequest): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Ensure the request is for the authenticated company
            if ($request->company_user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only deny requests for your company',
                    'error' => 'unauthorized'
                ], 403);
            }

            if (!$request->isPending()) {
                return response()->json([
                    'message' => 'Only pending requests can be denied',
                    'error' => 'invalid_status'
                ], 400);
            }

            $validated = $httpRequest->validate([
                'review_notes' => 'nullable|string|max:1000',
            ]);

            // ── Blockchain first ──
            $reviewNotesHash = hash('sha256', $validated['review_notes'] ?? '');
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->denyConnectionRequest($request->id, $reviewNotesHash);

            // ── Off-chain ──
            $request->deny($user, $validated['review_notes'] ?? null);
            $request->update(['blockchain_tx_hash' => $blockchainResult['transactionHash']]);

            Log::info('Vendor connection request denied (on-chain + off-chain)', [
                'request_id' => $request->id,
                'company_id' => $user->id,
                'vendor_id' => $request->vendor_user_id,
                'tx_hash' => $blockchainResult['transactionHash'],
            ]);

            return response()->json([
                'message' => 'Connection request denied',
                'request' => $request->fresh()->load(['vendor', 'company']),
                'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to deny connection request', [
                'error' => $e->getMessage(),
                'request_id' => $request->id ?? null
            ]);
            
            return response()->json([
                'message' => 'Failed to deny request',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Get active connections for current user
     */
    public function getConnections(): JsonResponse
    {
        Log::info('HIT CONNECTIONS ROUTE: getConnections() called');
        try {
            $user = Auth::user();
            
            if ($user->current_profile_type === 'vendor') {
                $connections = VendorCompanyConnection::byVendor($user->id)
                    ->active()
                    ->with(['company.companyProfile'])
                    ->orderBy('connected_at', 'desc')
                    ->get();
            } elseif ($user->current_profile_type === 'company') {
                $connections = VendorCompanyConnection::byCompany($user->id)
                    ->active()
                    ->with(['vendor.vendorProfile'])
                    ->orderBy('connected_at', 'desc')
                    ->get();
            } else {
                return response()->json([
                    'message' => 'Invalid user type',
                    'error' => 'invalid_user_type'
                ], 400);
            }

            return response()->json([
                'connections' => $connections
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get connections', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve connections',
                'error' => 'internal_server_error'
            ], 500);
        }
    }

    /**
     * Revoke a connection (company only)
     */
    public function revokeConnection(VendorCompanyConnection $connection, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Ensure the connection belongs to the authenticated company
            if ($connection->company_user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only revoke connections for your company',
                    'error' => 'unauthorized'
                ], 403);
            }

            if (!$connection->isActive()) {
                return response()->json([
                    'message' => 'Connection is already inactive',
                    'error' => 'already_inactive'
                ], 400);
            }

            $validated = $request->validate([
                'reason' => 'nullable|string|max:1000',
            ]);

            // ── Blockchain first ──
            $reasonHash = hash('sha256', $validated['reason'] ?? '');
            $blockchainService = new BlockchainService();
            $blockchainResult = $blockchainService->revokeConnection($connection->id, $reasonHash);

            // ── Off-chain ──
            $connection->revoke($user, $validated['reason'] ?? null);
            $connection->update(['blockchain_tx_hash' => $blockchainResult['transactionHash']]);

            Log::info('Vendor connection revoked (on-chain + off-chain)', [
                'connection_id' => $connection->id,
                'company_id' => $user->id,
                'vendor_id' => $connection->vendor_user_id,
                'tx_hash' => $blockchainResult['transactionHash'],
            ]);

            return response()->json([
                'message' => 'Connection revoked successfully',
                'connection' => $connection->fresh(),
                'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to revoke connection', [
                'error' => $e->getMessage(),
                'connection_id' => $connection->id ?? null
            ]);
            
            return response()->json([
                'message' => 'Failed to revoke connection',
                'error' => 'internal_server_error'
            ], 500);
        }
    }
}
