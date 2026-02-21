<?php

namespace App\Auctions\Jobs;

use App\Auctions\Events\AuctionStarted;
use App\Auctions\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Run every minute by the scheduler.
 * Finds all scheduled auctions whose start_time has passed and starts them.
 */
class StartScheduledAuctions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $dueAuctions = Auction::scheduled()
            ->where('start_time', '<=', now())
            ->with('participants')
            ->get();

        foreach ($dueAuctions as $auction) {
            $auction->update(['status' => 'running']);

            event(new AuctionStarted($auction));

            // Dispatch the EndAuction job delayed until the auction's end_time
            EndAuction::dispatch($auction)->delay($auction->end_time);
        }
    }
}

