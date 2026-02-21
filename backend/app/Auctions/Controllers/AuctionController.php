<?php

namespace App\Auctions\Controllers;

use App\Auctions\Events\AuctionEnded;
use App\Auctions\Events\AuctionStarted;
use App\Auctions\Jobs\EndAuction;
use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionAuditLog;
use App\Auctions\Models\AuctionParticipant;
use App\Auctions\Services\AuctionRankingService;
use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AuctionController extends Controller
{
    public function __construct(private readonly AuctionRankingService $ranking) {}

    // ── POST /api/auctions ──────────────────────────────────────────────────

    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'listing_id'                  => 'required|exists:listings,id',
            'start_time'                  => 'required|date|after:now',
            'end_time'                    => 'required|date|after:start_time',
            'minimum_decrement_type'      => ['required', Rule::in(['percent', 'fixed'])],
            'minimum_decrement_value'     => 'required|numeric|min:0',
            'extension_window_seconds'    => 'sometimes|integer|min:0',
            'extension_duration_seconds'  => 'sometimes|integer|min:0',
        ]);

        // Only company users can create auctions
        if (!$request->user()->isCompany()) {
            return response()->json(['message' => 'Only company accounts can create auctions.'], 403);
        }

        $auction = DB::transaction(function () use ($data, $request) {
            $auction = Auction::create(array_merge($data, ['buyer_id' => $request->user()->id]));

            AuctionAuditLog::log($auction->id, 'auction_created', [
                'buyer_id'   => $auction->buyer_id,
                'listing_id' => $auction->listing_id,
                'start_time' => $auction->start_time->toIso8601String(),
                'end_time'   => $auction->end_time->toIso8601String(),
            ]);

            return $auction;
        });

        return response()->json(['auction' => $auction], 201);
    }

    // ── POST /api/auctions/{id}/start ───────────────────────────────────────

    public function start(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);

        if ($auction->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if ($auction->status !== 'scheduled') {
            return response()->json(['message' => 'Auction is not in scheduled state.'], 422);
        }

        $auction->update(['status' => 'running']);

        // Schedule auto-end job
        EndAuction::dispatch($auction)->delay($auction->end_time);

        event(new AuctionStarted($auction));

        AuctionAuditLog::log($auction->id, 'auction_started', [
            'started_by' => $request->user()->id,
            'start_time' => now()->toIso8601String(),
        ]);

        return response()->json(['auction' => $auction->fresh()]);
    }

    // ── POST /api/auctions/{id}/end ─────────────────────────────────────────

    public function end(Request $request, int $id): JsonResponse
    {
        $auction = Auction::with('participants')->findOrFail($id);

        if ($auction->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if ($auction->status !== 'running') {
            return response()->json(['message' => 'Auction is not running.'], 422);
        }

        $auction->update(['status' => 'completed']);
        event(new AuctionEnded($auction));

        return response()->json(['message' => 'Auction ended.', 'auction' => $auction->fresh()]);
    }

    // ── POST /api/auctions/{id}/join ────────────────────────────────────────

    public function join(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);
        $user    = $request->user();

        if (!$user->isVendor()) {
            return response()->json(['message' => 'Only vendor accounts can join auctions.'], 403);
        }
        if (!in_array($auction->status, ['scheduled', 'running'])) {
            return response()->json(['message' => 'Auction is not open for registration.'], 422);
        }

        // Vendor pre-qualification: must have a non-rejected/withdrawn quote for this listing
        $qualified = Quote::where('listing_id', $auction->listing_id)
            ->where('vendor_user_id', $user->id)
            ->whereNotIn('status', ['rejected', 'withdrawn'])
            ->exists();

        if (!$qualified) {
            return response()->json(['message' => 'You must have a qualified quotation to join this auction.'], 403);
        }

        $data = $request->validate([
            'initial_price'            => 'sometimes|numeric|min:0',
            'auto_bid_enabled'         => 'sometimes|boolean',
            'minimum_acceptable_price' => 'sometimes|numeric|min:0',
        ]);

        $participant = AuctionParticipant::firstOrCreate(
            ['auction_id' => $auction->id, 'vendor_id' => $user->id],
            array_merge(['initial_price' => $data['initial_price'] ?? null], $data)
        );

        AuctionAuditLog::log($auction->id, 'vendor_joined', ['vendor_id' => $user->id]);

        return response()->json(['participant' => $participant], 201);
    }

    // ── GET /api/auctions/{id}/my-rank ─────────────────────────────────────

    public function myRank(Request $request, int $id): JsonResponse
    {
        $auction     = Auction::findOrFail($id);
        $user        = $request->user();
        $participant = AuctionParticipant::where('auction_id', $id)
            ->where('vendor_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'auction_id'         => $auction->id,
            'your_rank'          => $participant->current_rank,
            'your_best_bid'      => (float) $participant->current_best_bid,
            'time_remaining_sec' => $auction->secondsRemaining(),
            'end_time'           => $auction->end_time->toIso8601String(),
            'status'             => $auction->status,
        ]);
    }

    // ── GET /api/auctions/{id}/leaderboard ─────────────────────────────────

    public function leaderboard(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);

        if ($auction->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $top = $this->ranking->getTopVendors($auction, 50);

        return response()->json([
            'auction_id'         => $auction->id,
            'status'             => $auction->status,
            'time_remaining_sec' => $auction->secondsRemaining(),
            'end_time'           => $auction->end_time->toIso8601String(),
            'lowest_bid'         => $this->ranking->getLowestBid($auction),
            'leaderboard'        => $top,
        ]);
    }

    // ── GET /api/auctions/{id}/audit-log ───────────────────────────────────

    public function auditLog(Request $request, int $id): JsonResponse
    {
        $auction = Auction::findOrFail($id);

        if ($auction->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $logs = AuctionAuditLog::where('auction_id', $id)
            ->orderBy('created_at')
            ->paginate(100);

        return response()->json($logs);
    }
}

