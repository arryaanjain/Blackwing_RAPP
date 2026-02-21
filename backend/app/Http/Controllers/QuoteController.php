<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Quote::with(['listing.company', 'vendor']);

        // Filter based on user type
        if ($user->current_profile_type === 'vendor') {
            $query->forVendor($user->id);
        } elseif ($user->current_profile_type === 'company') {
            $query->whereHas('listing', function ($q) use ($user) {
                $q->where('company_id', $user->companyProfile->id);
            });
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('listing_id')) {
            $query->forListing($request->listing_id);
        }

        $quotes = $query->orderBy('submitted_at', 'desc')->paginate(15);

        return response()->json($quotes);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->current_profile_type !== 'vendor') {
            return response()->json(['error' => 'Only vendors can create quotes'], 403);
        }

        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'quoted_price' => 'required|numeric|min:0',
            'proposal_details' => 'required|string',
            'line_items' => 'nullable|array',
            'delivery_days' => 'required|integer|min:1',
            'terms_and_conditions' => 'nullable|string',
            'attachments' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now'
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);

        // Check if vendor has access to this listing
        $hasAccess = $listing->visibility === 'public' || 
                    $listing->accessibleVendors()->where('vendor_user_id', $user->id)->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Access denied to this listing'], 403);
        }

        // Check if listing is still open
        if ($listing->status !== 'active' || 
            ($listing->closes_at && $listing->closes_at < now())) {
            return response()->json(['error' => 'Listing is no longer accepting quotes'], 400);
        }

        // Check if vendor already has a quote for this listing
        $existingQuote = Quote::where('listing_id', $validated['listing_id'])
                             ->where('vendor_user_id', $user->id)
                             ->first();

        if ($existingQuote) {
            return response()->json(['error' => 'You have already submitted a quote for this listing'], 400);
        }

        $quote = Quote::create([
            ...$validated,
            'quote_number' => 'QUO-' . strtoupper(Str::random(10)),
            'vendor_user_id' => $user->id,
            'status' => 'submitted',
            'submitted_at' => now()
        ]);

        return response()->json($quote->load(['listing', 'vendor']), 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = Auth::user();
        $quote = Quote::with(['listing.company', 'vendor', 'reviewedBy'])
                     ->findOrFail($id);

        // Check access permissions
        if ($user->current_profile_type === 'vendor' && $quote->vendor_user_id !== $user->id) {
            return response()->json(['error' => 'Access denied'], 403);
        } elseif ($user->current_profile_type === 'company' && 
                  $quote->listing->company_id !== $user->companyProfile->id) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        return response()->json($quote);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $quote = Quote::findOrFail($id);

        if ($user->current_profile_type !== 'vendor' || $quote->vendor_user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($quote->status !== 'submitted') {
            return response()->json(['error' => 'Quote cannot be modified'], 400);
        }

        $validated = $request->validate([
            'quoted_price' => 'numeric|min:0',
            'proposal_details' => 'string',
            'line_items' => 'nullable|array',
            'delivery_days' => 'integer|min:1',
            'terms_and_conditions' => 'nullable|string',
            'attachments' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now'
        ]);

        $quote->update($validated);

        return response()->json($quote->load(['listing', 'vendor']));
    }

    public function withdraw(string $id): JsonResponse
    {
        $user = Auth::user();
        $quote = Quote::findOrFail($id);

        if ($user->current_profile_type !== 'vendor' || $quote->vendor_user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($quote->status, ['submitted', 'under_review'])) {
            return response()->json(['error' => 'Quote cannot be withdrawn'], 400);
        }

        $quote->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Quote withdrawn successfully']);
    }

    public function review(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $quote = Quote::findOrFail($id);

        if ($user->current_profile_type !== 'company' || 
            $quote->listing->company_id !== $user->companyProfile->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['under_review', 'accepted', 'rejected'])],
            'review_notes' => 'nullable|string'
        ]);

        $quote->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now()
        ]);

        return response()->json($quote->load(['listing', 'vendor', 'reviewedBy']));
    }

    public function getByListing(string $listingId): JsonResponse
    {
        $user = Auth::user();
        $listing = Listing::findOrFail($listingId);

        if ($user->current_profile_type !== 'company' || 
            $listing->company_id !== $user->companyProfile->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $quotes = Quote::with(['vendor'])
                      ->forListing($listingId)
                      ->orderBy('submitted_at', 'desc')
                      ->get();

        return response()->json($quotes);
    }
}
