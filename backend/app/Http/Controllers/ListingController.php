<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Company;
use App\Models\Vendor;
use App\Models\Wallet;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Listing::with(['company', 'createdBy', 'quotes']);

        // Filter based on user type
        if ($user->current_profile_type === 'vendor') {
            // Vendors should only see active, accessible listings
            $query->accessibleBy($user->id)->where('status', 'active');
        } elseif ($user->current_profile_type === 'company') {
            $query->where('company_id', $user->current_profile_id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        $listings = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($listings);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->current_profile_type !== 'company') {
            return response()->json(['error' => 'Only companies can create listings'], 403);
        }

        if (!$user->current_profile_id) {
            return response()->json(['error' => 'No company profile selected'], 403);
        }

        // Check wallet balance before creating listing
        $cost = config('points.cost_listing');
        $wallet = $user->wallet;
        if (!$wallet || $wallet->balance < $cost) {
            return response()->json([
                'error' => 'Insufficient points',
                'message' => "You need {$cost} point(s) to create a listing. Please buy more points.",
                'wallet_balance' => $wallet?->balance ?? 0,
            ], 402);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'base_price' => 'nullable|numeric|min:0',
            'visibility' => ['required', Rule::in(['public', 'private'])],
            'status' => ['nullable', Rule::in(['draft', 'active'])],
            'requirements' => 'nullable|array',
            'specifications' => 'nullable|array',
            'opens_at' => 'nullable|date',
            'closes_at' => 'nullable|date',
            'blockchain_enabled' => 'boolean',
            'accessible_vendor_ids' => 'nullable|array',
            'accessible_vendor_ids.*' => 'exists:users,id'
        ]);

        // ── Blockchain first: record listing on-chain ──
        $company = Company::find($user->current_profile_id);
        $companyShareId = $company ? $company->share_id : 'unknown';
        $listingNumber = 'LST-' . strtoupper(Str::random(10));
        $contentHash = hash('sha256', json_encode([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'requirements' => $validated['requirements'] ?? [],
            'specifications' => $validated['specifications'] ?? [],
        ]));
        $visibility = ($validated['visibility'] ?? 'public') === 'public' ? 0 : 1;
        $status = ($validated['status'] ?? 'active') === 'active' ? 1 : 0;
        $basePrice = intval(($validated['base_price'] ?? 0) * 100); // cents
        $closesAtRaw = isset($validated['closes_at']) ? strtotime($validated['closes_at']) : 0;
        // If closes_at is in the past, send 0 to the contract (= no expiry on-chain)
        // This allows testing/backdated listings without the contract immediately expiring them
        $closesAt = ($closesAtRaw > 0 && $closesAtRaw > time()) ? $closesAtRaw : 0;

        // Collect authorized vendor shareIds for private listings
        $authorizedVendorShareIds = [];
        if ($visibility === 1 && !empty($validated['accessible_vendor_ids'])) {
            $authorizedVendorShareIds = Vendor::whereIn('user_id', $validated['accessible_vendor_ids'])
                ->pluck('share_id')
                ->toArray();
        }

        $blockchainService = new BlockchainService();
        $blockchainResult = $blockchainService->createListing(
            $listingNumber, $companyShareId, $contentHash,
            $basePrice, $visibility, $status,
            $closesAt, $authorizedVendorShareIds
        );

        // ── Off-chain: persist to DB only after blockchain success ──
        $listing = Listing::create([
            ...$validated,
            'listing_number' => $listingNumber,
            'company_id' => $user->current_profile_id,
            'created_by' => $user->id,
            'status' => $validated['status'] ?? 'active',
            'blockchain_tx_hash' => $blockchainResult['transactionHash'],
        ]);

        // Deduct points for listing creation
        $wallet->deduct($cost, 'Created listing: ' . $listing->title, 'listing', (string) $listing->id);

        // Grant access to specific vendors for private listings
        if ($validated['visibility'] === 'private' && !empty($validated['accessible_vendor_ids'])) {
            $accessData = collect($validated['accessible_vendor_ids'])->map(function ($vendorId) use ($user) {
                return [
                    'vendor_user_id' => $vendorId,
                    'granted_by' => $user->id,
                    'granted_at' => now()
                ];
            })->toArray();

            $listing->accessibleVendors()->attach($accessData);
        }

        Log::info('Listing created (on-chain + off-chain)', [
            'listing_id' => $listing->id,
            'tx_hash' => $blockchainResult['transactionHash'],
        ]);

        $listingData = $listing->load(['company', 'createdBy'])->toArray();
        $listingData['blockchain'] = ['transaction_hash' => $blockchainResult['transactionHash']];

        return response()->json($listingData, 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = Auth::user();
        
        $listing = Listing::with(['company', 'createdBy', 'quotes.vendor'])
                          ->findOrFail($id);

        // Check access permissions
        if ($user->current_profile_type === 'vendor') {
            $accessible = $listing->visibility === 'public' || 
                         $listing->accessibleVendors()->where('vendor_user_id', $user->id)->exists();
            
            if (!$accessible) {
                return response()->json(['error' => 'Access denied'], 403);
            }
        } elseif ($user->current_profile_type === 'company' && $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        return response()->json($listing);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($id);

        if ($user->current_profile_type !== 'company' || $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'category' => 'string|max:100',
            'base_price' => 'nullable|numeric|min:0',
            'visibility' => Rule::in(['public', 'private']),
            'requirements' => 'nullable|array',
            'specifications' => 'nullable|array',
            'opens_at' => 'nullable|date',
            'closes_at' => 'nullable|date',
            'status' => Rule::in(['draft', 'active', 'closed', 'cancelled']),
            'blockchain_enabled' => 'boolean'
        ]);

        // ── Blockchain first ──
        $statusMap = ['draft' => 0, 'active' => 1, 'closed' => 2, 'cancelled' => 3];
        $newStatus = $statusMap[$validated['status'] ?? $listing->status] ?? 1;
        $contentHash = hash('sha256', json_encode([
            'title' => $validated['title'] ?? $listing->title,
            'description' => $validated['description'] ?? $listing->description,
        ]));

        $blockchainService = new BlockchainService();
        $blockchainResult = $blockchainService->updateListing($listing->id, $contentHash, $newStatus);

        // ── Off-chain ──
        $listing->update(array_merge($validated, [
            'blockchain_tx_hash' => $blockchainResult['transactionHash'],
        ]));

        $listingData = $listing->load(['company', 'createdBy'])->toArray();
        $listingData['blockchain'] = ['transaction_hash' => $blockchainResult['transactionHash']];

        return response()->json($listingData);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($id);

        if ($user->current_profile_type !== 'company' || $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // ── Blockchain first: close listing on-chain ──
        $blockchainService = new BlockchainService();
        $blockchainResult = $blockchainService->closeListing($listing->id);

        // ── Off-chain: soft-close by updating status ──
        $listing->update([
            'status' => 'cancelled',
            'blockchain_tx_hash' => $blockchainResult['transactionHash'],
        ]);

        return response()->json([
            'message' => 'Listing deleted successfully',
            'blockchain' => ['transaction_hash' => $blockchainResult['transactionHash']],
        ]);
    }

    public function grantAccess(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($id);

        if ($user->current_profile_type !== 'company' || $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'vendor_user_ids' => 'required|array',
            'vendor_user_ids.*' => 'exists:users,id'
        ]);

        // ── Blockchain first: grant access for each vendor ──
        $blockchainService = new BlockchainService();
        $txHashes = [];
        foreach ($validated['vendor_user_ids'] as $vendorUserId) {
            $vendor = Vendor::where('user_id', $vendorUserId)->first();
            if ($vendor) {
                $result = $blockchainService->grantVendorAccess($listing->id, $vendor->share_id);
                $txHashes[] = $result['transactionHash'];
            }
        }

        // ── Off-chain ──
        $accessData = collect($validated['vendor_user_ids'])->map(function ($vendorId) use ($user) {
            return [
                'vendor_user_id' => $vendorId,
                'granted_by' => $user->id,
                'granted_at' => now()
            ];
        })->toArray();

        $listing->accessibleVendors()->syncWithoutDetaching($accessData);

        return response()->json([
            'message' => 'Access granted successfully',
            'blockchain' => ['transaction_hashes' => $txHashes],
        ]);
    }

    public function revokeAccess(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($id);

        if ($user->current_profile_type !== 'company' || $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'vendor_user_ids' => 'required|array',
            'vendor_user_ids.*' => 'exists:users,id'
        ]);

        // ── Blockchain first: revoke access for each vendor ──
        $blockchainService = new BlockchainService();
        $txHashes = [];
        foreach ($validated['vendor_user_ids'] as $vendorUserId) {
            $vendor = Vendor::where('user_id', $vendorUserId)->first();
            if ($vendor) {
                $result = $blockchainService->revokeVendorAccess($listing->id, $vendor->share_id);
                $txHashes[] = $result['transactionHash'];
            }
        }

        // ── Off-chain ──
        $listing->accessibleVendors()->detach($validated['vendor_user_ids']);

        return response()->json([
            'message' => 'Access revoked successfully',
            'blockchain' => ['transaction_hashes' => $txHashes],
        ]);
    }
}
