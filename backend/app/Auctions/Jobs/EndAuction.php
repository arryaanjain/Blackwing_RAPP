<?php

namespace App\Auctions\Jobs;

use App\Auctions\Events\AuctionEnded;
use App\Auctions\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Dispatched (with delay) when an auction starts.
 * Fires when the auction's end_time is reached.
 * Guards against early fire or double-execution.
 */
class EndAuction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly Auction $auction) {}

    public function handle(): void
    {
        // Re-fetch to get the most recent end_time (may have been extended)
        $auction = Auction::with('participants')->find($this->auction->id);

        if (!$auction) {
            return; // Deleted — nothing to do
        }

        // Guard: only end if we are at or past the actual end_time
        if (now()->isBefore($auction->end_time)) {
            // Re-schedule for the updated end_time (anti-snipe extension)
            static::dispatch($auction)->delay($auction->end_time);
            return;
        }

        // Guard: only transition from running → completed
        if ($auction->status !== 'running') {
            return;
        }

        $auction->update(['status' => 'completed']);
        event(new AuctionEnded($auction));
    }
}

