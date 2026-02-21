<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Company;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
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
            'closes_at' => 'nullable|date|after:opens_at',
            'blockchain_enabled' => 'boolean',
            'accessible_vendor_ids' => 'nullable|array',
            'accessible_vendor_ids.*' => 'exists:users,id'
        ]);

        $listing = Listing::create([
            ...$validated,
            'listing_number' => 'LST-' . strtoupper(Str::random(10)),
            'company_id' => $user->current_profile_id,
            'created_by' => $user->id,
            'status' => $validated['status'] ?? 'active'  // Default to active if not specified
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

        return response()->json($listing->load(['company', 'createdBy']), 201);
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
            'closes_at' => 'nullable|date|after:opens_at',
            'status' => Rule::in(['draft', 'active', 'closed', 'cancelled']),
            'blockchain_enabled' => 'boolean'
        ]);

        $listing->update($validated);

        return response()->json($listing->load(['company', 'createdBy']));
    }

    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($id);

        if ($user->current_profile_type !== 'company' || $listing->company_id !== $user->current_profile_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted successfully']);
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

        $accessData = collect($validated['vendor_user_ids'])->map(function ($vendorId) use ($user) {
            return [
                'vendor_user_id' => $vendorId,
                'granted_by' => $user->id,
                'granted_at' => now()
            ];
        })->toArray();

        $listing->accessibleVendors()->syncWithoutDetaching($accessData);

        return response()->json(['message' => 'Access granted successfully']);
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

        $listing->accessibleVendors()->detach($validated['vendor_user_ids']);

        return response()->json(['message' => 'Access revoked successfully']);
    }
}
