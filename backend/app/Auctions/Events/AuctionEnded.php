<?php

namespace App\Auctions\Events;

use App\Auctions\Models\Auction;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Auction $auction) {}

    /** Broadcast to buyer + all participants. */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("auction.{$this->auction->id}.buyer.{$this->auction->buyer_id}"),
        ];

        foreach ($this->auction->participants as $participant) {
            $channels[] = new PrivateChannel(
                "auction.{$this->auction->id}.vendor.{$participant->vendor_id}"
            );
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'auction.ended';
    }

    public function broadcastWith(): array
    {
        // Vendors see only their own rank; buyer sees full ranking
        return [
            'auction_id' => $this->auction->id,
            'status'     => 'completed',
            'ended_at'   => $this->auction->updated_at->toIso8601String(),
            'winner'     => $this->auction->participants()
                ->whereNotNull('current_rank')
                ->orderBy('current_rank')
                ->with('vendor:id,name')
                ->first()?->toArray(),
        ];
    }
}

