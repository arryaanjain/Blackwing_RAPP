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
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Services\BlockchainService;

class AuctionController extends Controller
{
    public function __construct(private readonly AuctionRankingService $ranking) {}

    // ── GET /api/auctions/my ──────────────────────────────────────────────────

    public function myAuctions(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isVendor()) {
            return response()->json(['message' => 'Only vendor accounts can view auctions.'], 403);
        }

        $participantAuctionIds = AuctionParticipant::where('vendor_id', $user->id)
            ->pluck('auction_id');

        $auctions = Auction::with(['listing.company', 'participants' => function ($q) use ($user) {
                $q->where('vendor_id', $user->id);
            }])
            ->whereIn('id', $participantAuctionIds)
            ->orderByRaw("CASE status WHEN 'running' THEN 0 WHEN 'scheduled' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END")
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json(['auctions' => $auctions]);
    }

    // ── GET /api/auctions/company ──────────────────────────────────────────────

    public function companyAuctions(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCompany()) {
            return response()->json(['message' => 'Only company accounts can view company auctions.'], 403);
        }

        $auctions = Auction::with(['listing', 'participants.vendor:id,name'])
            ->where('buyer_id', $user->id)
            ->orderByRaw("CASE status WHEN 'running' THEN 0 WHEN 'scheduled' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END")
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json(['auctions' => $auctions]);
    }

    // ── GET /api/auctions/{id} ─────────────────────────────────────────────

    public function show(Request $request, int $id): JsonResponse
    {
        $auction = Auction::with('listing')->findOrFail($id);

        // Only the buyer or a registered participant may view
        $user = $request->user();
        $isParticipant = AuctionParticipant::where('auction_id', $id)
            ->where('vendor_id', $user->id)
            ->exists();

        if ($auction->buyer_id !== $user->id && !$isParticipant) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['auction' => $auction]);
    }

    // ── GET /api/listings/{listingId}/auction ──────────────────────────────

    public function getForListing(Request $request, int $listingId): JsonResponse
    {
        $auction = Auction::where('listing_id', $listingId)
            ->whereIn('status', ['scheduled', 'running', 'completed'])
            ->latest()
            ->first();

        return response()->json(['auction' => $auction]);
    }

    // ── POST /api/auctions ──────────────────────────────────────────────────

    public function create(Request $request): JsonResponse
    {
        // Only company users can create auctions
        if (!$request->user()->isCompany()) {
            return response()->json(['message' => 'Only company accounts can create auctions.'], 403);
        }

        $data = $request->validate([
            'listing_id'                 => 'required|exists:listings,id',
            'duration_minutes'           => 'required|integer|min:5|max:180',
            'minimum_decrement_type'     => ['sometimes', Rule::in(['percent', 'fixed'])],
            'minimum_decrement_value'    => 'sometimes|numeric|min:0',
            'extension_window_seconds'   => 'sometimes|integer|min:0',
            'extension_duration_seconds' => 'sometimes|integer|min:0',
        ]);

        // Ensure there are at least 2 qualifying vendor quotes
        $eligibleVendorIds = Quote::where('listing_id', $data['listing_id'])
            ->whereNotIn('status', ['rejected', 'withdrawn'])
            ->pluck('vendor_user_id')
            ->unique()
            ->values();

        if ($eligibleVendorIds->count() < 2) {
            return response()->json([
                'message' => 'At least 2 vendor quotations are required to start a reverse auction.',
            ], 422);
        }

        // Prevent duplicate active auctions for the same listing
        $existing = Auction::where('listing_id', $data['listing_id'])
            ->whereIn('status', ['scheduled', 'running'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'An active auction already exists for this listing.',
                'auction' => $existing,
            ], 409);
        }

        $now      = now();
        $endTime  = $now->copy()->addMinutes((int) $data['duration_minutes']);

        $auction = DB::transaction(function () use ($data, $request, $now, $endTime, $eligibleVendorIds) {
            $auction = Auction::create([
                'listing_id'                 => $data['listing_id'],
                'buyer_id'                   => $request->user()->id,
                'start_time'                 => $now,
                'end_time'                   => $endTime,
                'status'                     => 'running',
                'minimum_decrement_type'     => $data['minimum_decrement_type']    ?? 'fixed',
                'minimum_decrement_value'    => $data['minimum_decrement_value']   ?? 0,
                'extension_window_seconds'   => $data['extension_window_seconds']  ?? 60,
                'extension_duration_seconds' => $data['extension_duration_seconds'] ?? 60,
            ]);

            // Auto-enroll every vendor who submitted a qualifying quote
            foreach ($eligibleVendorIds as $vendorId) {
                AuctionParticipant::create([
                    'auction_id'   => $auction->id,
                    'vendor_id'    => $vendorId,
                    'initial_price' => null,
                ]);
            }

            AuctionAuditLog::log($auction->id, 'auction_created', [
                'buyer_id'          => $auction->buyer_id,
                'listing_id'        => $auction->listing_id,
                'start_time'        => $auction->start_time->toIso8601String(),
                'end_time'          => $auction->end_time->toIso8601String(),
                'enrolled_vendors'  => $eligibleVendorIds->toArray(),
            ]);

            return $auction;
        });

        // ── Blockchain: record auction creation (BLOCKING) ───────────────
        $blockchain = app(BlockchainService::class);
        $buyerShareId = $request->user()->companyProfile->share_id ?? ('company-' . $request->user()->id);

        try {
            $bcResult = $blockchain->createAuctionOnChain(
                $auction->listing_id,
                $buyerShareId,
                $eligibleVendorIds->count(),
                $auction->start_time->timestamp,
                $auction->end_time->timestamp
            );
        } catch (\Exception $e) {
            // Roll back: delete auction + participants since blockchain failed
            $auction->participants()->delete();
            $auction->delete();
            Log::error('Blockchain: createAuction FAILED — auction rolled back', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to record auction on blockchain. Auction not created.',
                'error'   => $e->getMessage(),
            ], 500);
        }

        $auction->update(['blockchain_tx_hash' => $bcResult['transactionHash'] ?? null]);

        // Schedule the auto-end job and fire AuctionStarted
        EndAuction::dispatch($auction)->delay($endTime);
        event(new AuctionStarted($auction));

        return response()->json(['auction' => $auction->load('participants')], 201);
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

        // ── Gather receipt data ────────────────────────────────────────────
        $winner = $auction->participants()->orderBy('current_rank')->first();
        $allBidTxHashes = $auction->bids()->orderBy('timestamp')->pluck('blockchain_tx_hash')->filter()->values();

        // Build receipt hash: SHA256 of all tx hashes + creation tx + end marker
        $hashChain = implode('|', array_filter([
            $auction->blockchain_tx_hash,
            ...$allBidTxHashes->toArray(),
        ]));
        $receiptHash = '0x' . hash('sha256', $hashChain);

        $auction->update(['status' => 'completed']);

        // ── Blockchain: record auction end + receipt (BLOCKING) ──────────
        $blockchain = app(BlockchainService::class);
        $winnerShareId = '';
        $winningBid = 0;
        if ($winner && $winner->current_rank === 1) {
            $winnerVendor = $winner->vendor;
            $winnerShareId = $winnerVendor->vendorProfile->share_id ?? ('vendor-' . $winnerVendor->id);
            $winningBid = (int) round(((float) $winner->current_best_bid) * 100);
        }

        try {
            $bcResult = $blockchain->endAuctionOnChain(
                $auction->id,
                $winnerShareId,
                $winningBid,
                $receiptHash
            );
        } catch (\Exception $e) {
            // Revert: set status back to running
            $auction->update(['status' => 'running']);
            Log::error('Blockchain: endAuction FAILED — auction reverted to running', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to record auction end on blockchain. Auction remains running.',
                'error'   => $e->getMessage(),
            ], 500);
        }

        $auction->update(['receipt_tx_hash' => $bcResult['transactionHash'] ?? null]);

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

    // ── GET /api/auctions/{id}/receipt ──────────────────────────────────────

    public function receipt(Request $request, int $id): JsonResponse
    {
        $auction = Auction::with(['listing', 'participants.vendor:id,name', 'bids' => function ($q) {
            $q->orderBy('timestamp');
        }])->findOrFail($id);

        // Only buyer or participants may view
        $user = $request->user();
        $isParticipant = AuctionParticipant::where('auction_id', $id)
            ->where('vendor_id', $user->id)
            ->exists();

        if ($auction->buyer_id !== $user->id && !$isParticipant) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Build chronological transaction list
        $transactions = collect();

        // 1. Auction creation tx
        if ($auction->blockchain_tx_hash) {
            $transactions->push([
                'event'     => 'auction_created',
                'tx_hash'   => $auction->blockchain_tx_hash,
                'timestamp' => $auction->start_time->toIso8601String(),
                'details'   => [
                    'listing_id'       => $auction->listing_id,
                    'listing_title'    => $auction->listing->title ?? null,
                    'participant_count'=> $auction->participants->count(),
                ],
            ]);
        }

        // 2. Each bid tx (chronological)
        foreach ($auction->bids as $bid) {
            $entry = [
                'event'     => 'bid_placed',
                'tx_hash'   => $bid->blockchain_tx_hash,
                'timestamp' => $bid->timestamp->toIso8601String(),
                'details'   => [
                    'vendor_id'  => $bid->vendor_id,
                    'vendor_name'=> $bid->vendor->name ?? null,
                    'bid_amount' => (float) $bid->bid_amount,
                    'valid'      => $bid->valid,
                ],
            ];

            // If vendor is viewing, show only their own bids with full details
            if ($isParticipant && $auction->buyer_id !== $user->id) {
                if ($bid->vendor_id === $user->id) {
                    $transactions->push($entry);
                }
            } else {
                $transactions->push($entry);
            }
        }

        // 3. Auction end / receipt tx
        if ($auction->receipt_tx_hash) {
            $winner = $auction->participants()->orderBy('current_rank')->first();
            $transactions->push([
                'event'     => 'auction_ended',
                'tx_hash'   => $auction->receipt_tx_hash,
                'timestamp' => $auction->end_time->toIso8601String(),
                'details'   => [
                    'winner_id'       => $winner?->vendor_id,
                    'winner_name'     => $winner?->vendor?->name,
                    'winning_bid'     => $winner ? (float) $winner->current_best_bid : null,
                    'total_bids'      => $auction->bids->count(),
                ],
            ]);
        }

        return response()->json([
            'auction_id'        => $auction->id,
            'listing_title'     => $auction->listing->title ?? null,
            'status'            => $auction->status,
            'creation_tx'       => $auction->blockchain_tx_hash,
            'receipt_tx'        => $auction->receipt_tx_hash,
            'transactions'      => $transactions->values(),
        ]);
    }
}
