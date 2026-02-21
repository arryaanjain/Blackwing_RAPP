<?php

namespace App\Auctions\Services;

use App\Auctions\Events\AuctionExtended;
use App\Auctions\Events\BidPlaced;
use App\Auctions\Events\RankUpdated;
use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionAuditLog;
use App\Auctions\Models\AuctionParticipant;
use App\Auctions\Models\Bid;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BidProcessingService
{
    public function __construct(private readonly AuctionRankingService $ranking) {}

    /**
     * Atomically process a bid.
     *
     * @return array{success: bool, message: string, bid: ?Bid}
     */
    public function processBid(
        Auction $auction,
        int     $vendorId,
        float   $bidAmount,
        bool    $isAutoBid = false
    ): array {
        // ── 1. Rate-limit check (outside transaction — fast) ──────────────────
        $rateLimitKey = "bid_rate:{$auction->id}:{$vendorId}";
        $cooldown     = (int) config('auction.bid_cooldown_seconds', 5);

        if (Cache::has($rateLimitKey)) {
            return ['success' => false, 'message' => 'Rate limit: please wait before bidding again.', 'bid' => null];
        }

        $result = null;
        $extended = false;

        DB::transaction(function () use ($auction, $vendorId, $bidAmount, $isAutoBid, &$result, &$extended) {
            // ── 2. Lock auction row for the entire transaction ─────────────────
            /** @var Auction $auction */
            $auction = Auction::lockForUpdate()->findOrFail($auction->id);

            // ── 3. Validate auction state ──────────────────────────────────────
            if (!$auction->isRunning()) {
                $result = ['success' => false, 'message' => 'Auction is not currently running.', 'bid' => null];
                return;
            }

            // ── 4. Validate vendor is a participant ────────────────────────────
            $participant = AuctionParticipant::where('auction_id', $auction->id)
                ->where('vendor_id', $vendorId)
                ->lockForUpdate()
                ->first();

            if (!$participant) {
                $result = ['success' => false, 'message' => 'You are not a participant in this auction.', 'bid' => null];
                return;
            }

            // ── 5. Validate bid amount ─────────────────────────────────────────
            $validation = $this->validateBidAmount($auction, $participant, $bidAmount);
            if (!$validation['valid']) {
                $result = ['success' => false, 'message' => $validation['message'], 'bid' => null];
                return;
            }

            // ── 6. Persist bid ─────────────────────────────────────────────────
            $bid = Bid::create([
                'auction_id'  => $auction->id,
                'vendor_id'   => $vendorId,
                'bid_amount'  => $bidAmount,
                'is_auto_bid' => $isAutoBid,
                'timestamp'   => now(),
                'valid'       => true,
            ]);

            // ── 7. Recalculate ranks ───────────────────────────────────────────
            $this->ranking->calculateRanks($auction);

            // ── 8. Anti-snipe check ────────────────────────────────────────────
            if ($auction->isInExtensionWindow()) {
                $auction->end_time = $auction->end_time->addSeconds($auction->extension_duration_seconds);
                $auction->save();
                $extended = true;
            }

            // ── 9. Audit log ───────────────────────────────────────────────────
            AuctionAuditLog::log($auction->id, 'bid_placed', [
                'vendor_id'   => $vendorId,
                'bid_amount'  => $bidAmount,
                'is_auto_bid' => $isAutoBid,
                'extended'    => $extended,
            ]);

            $result = ['success' => true, 'message' => 'Bid placed successfully.', 'bid' => $bid];
        });

        if ($result['success']) {
            // ── 10. Set rate limit ─────────────────────────────────────────────
            Cache::put($rateLimitKey, 1, now()->addSeconds($cooldown));

            // ── 11. Broadcast (outside transaction) ────────────────────────────
            $auction->refresh();
            event(new BidPlaced($auction, $result['bid']));

            // Broadcast per-vendor rank updates
            foreach ($auction->participants()->whereNotNull('current_rank')->get() as $p) {
                event(new RankUpdated($auction, $p));
            }

            if ($extended) {
                event(new AuctionExtended($auction));
            }

            // ── 12. Process auto-bids triggered by this new bid ────────────────
            $this->processAutoBids($auction, $result['bid']);
        }

        return $result;
    }

    /** Validate that a bid amount satisfies all business rules. */
    private function validateBidAmount(Auction $auction, AuctionParticipant $participant, float $bidAmount): array
    {
        // Must be >= vendor minimum acceptable price
        if ($participant->minimum_acceptable_price !== null && $bidAmount < (float) $participant->minimum_acceptable_price) {
            return ['valid' => false, 'message' => 'Bid is below your minimum acceptable price.'];
        }

        // Bid must beat the current lowest bid by at least the minimum decrement
        $currentLowest = $this->ranking->getLowestBid($auction);
        if ($currentLowest !== null) {
            $requiredMax = $auction->calculateMinimumNextBid($currentLowest);
            if ($bidAmount > $requiredMax) {
                return [
                    'valid'   => false,
                    'message' => "Bid must be at most {$requiredMax} (current lowest minus minimum decrement).",
                ];
            }
        }

        return ['valid' => true, 'message' => ''];
    }

    /** After a new bid, fire auto-bids for participants who can counter. */
    private function processAutoBids(Auction $auction, Bid $triggerBid): void
    {
        if (!$auction->isRunning()) {
            return;
        }

        $autoBidders = AuctionParticipant::where('auction_id', $auction->id)
            ->where('auto_bid_enabled', true)
            ->where('vendor_id', '!=', $triggerBid->vendor_id)
            ->get();

        foreach ($autoBidders as $p) {
            $currentLowest = $this->ranking->getLowestBid($auction);
            if ($currentLowest === null) {
                continue;
            }
            $nextBid = $auction->calculateMinimumNextBid($currentLowest);
            if ($p->minimum_acceptable_price !== null && $nextBid < (float) $p->minimum_acceptable_price) {
                continue; // auto-bid would breach their floor
            }
            // Only auto-bid if it would improve their rank
            if ($p->current_best_bid === null || $nextBid < (float) $p->current_best_bid) {
                $this->processBid($auction, $p->vendor_id, $nextBid, true);
            }
        }
    }
}

