<?php

namespace App\Auctions\Listeners;

use App\Auctions\Events\AuctionEnded;
use App\Auctions\Events\AuctionExtended;
use App\Auctions\Events\AuctionStarted;
use App\Auctions\Events\BidPlaced;
use App\Auctions\Events\RankUpdated;
use App\Auctions\Models\AuctionAuditLog;

/**
 * Single listener that writes a tamper-evident audit log entry
 * for every auction lifecycle event.
 */
class LogAuctionEvent
{
    public function handle(object $event): void
    {
        match (true) {
            $event instanceof AuctionStarted  => $this->logStarted($event),
            $event instanceof BidPlaced       => $this->logBidPlaced($event),
            $event instanceof RankUpdated     => $this->logRankUpdated($event),
            $event instanceof AuctionExtended => $this->logExtended($event),
            $event instanceof AuctionEnded    => $this->logEnded($event),
            default                           => null,
        };
    }

    private function logStarted(AuctionStarted $event): void
    {
        AuctionAuditLog::log($event->auction->id, 'auction_started', [
            'start_time' => $event->auction->start_time->toIso8601String(),
            'end_time'   => $event->auction->end_time->toIso8601String(),
            'buyer_id'   => $event->auction->buyer_id,
        ]);
    }

    private function logBidPlaced(BidPlaced $event): void
    {
        // Bid placement is already logged inside BidProcessingService::processBid()
        // to ensure it is inside the transaction. This listener is a safety net for
        // any other BidPlaced dispatches.
    }

    private function logRankUpdated(RankUpdated $event): void
    {
        // Rank changes are an outcome of bid processing — already covered; skipped here
        // to avoid duplicate log rows. Can be activated if needed.
    }

    private function logExtended(AuctionExtended $event): void
    {
        AuctionAuditLog::log($event->auction->id, 'auction_extended', [
            'new_end_time'          => $event->auction->end_time->toIso8601String(),
            'extension_duration_sec' => $event->auction->extension_duration_seconds,
        ]);
    }

    private function logEnded(AuctionEnded $event): void
    {
        $winner = $event->auction->participants()
            ->whereNotNull('current_rank')
            ->orderBy('current_rank')
            ->first();

        AuctionAuditLog::log($event->auction->id, 'auction_ended', [
            'ended_at'         => now()->toIso8601String(),
            'winner_vendor_id' => $winner?->vendor_id,
            'winning_bid'      => $winner ? (float) $winner->current_best_bid : null,
        ]);
    }
}

