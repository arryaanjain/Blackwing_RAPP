<?php

namespace App\Auctions\Controllers;

use App\Auctions\Models\Auction;
use App\Auctions\Services\BidProcessingService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BidController extends Controller
{
    public function __construct(private readonly BidProcessingService $bidProcessor) {}

    // ── POST /api/auctions/{id}/bid ──────────────────────────────────────────

    public function placeBid(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isVendor()) {
            return response()->json(['message' => 'Only vendor accounts can place bids.'], 403);
        }

        $data = $request->validate([
            'bid_amount' => 'required|numeric|min:0',
        ]);

        // Deduct points for placing a bid (cost from config)
        $cost = (int) config('points.cost_bid', 1);
        $wallet = $user->wallet;

        if (!$wallet || $wallet->balance < $cost) {
            return response()->json([
                'message' => "Insufficient points. Placing a bid costs {$cost} point(s).",
            ], 402);
        }

        $auction = Auction::with('participants')->findOrFail($id);

        $result = $this->bidProcessor->processBid(
            $auction,
            $user->id,
            (float) $data['bid_amount']
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        // Deduct points only after a successful bid
        $wallet->deduct($cost, 'auction_bid', "Bid placed on auction #{$auction->id}");

        return response()->json([
            'message' => $result['message'],
            'bid'     => $result['bid'],
        ], 201);
    }

    // ── GET /api/auctions/{id}/bids ──────────────────────────────────────────
    // Buyer only: full bid history

    public function index(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);

        if ($auction->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $bids = $auction->bids()
            ->with('vendor:id,name')
            ->orderByDesc('timestamp')
            ->paginate(50);

        return response()->json($bids);
    }

    // ── GET /api/auctions/{id}/my-bids ───────────────────────────────────────
    // Vendor: own bid history only

    public function myBids(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        Auction::findOrFail($id); // 404 if not found

        $bids = \App\Auctions\Models\Bid::where('auction_id', $id)
            ->where('vendor_id', $user->id)
            ->orderByDesc('timestamp')
            ->get();

        return response()->json(['bids' => $bids]);
    }
}

