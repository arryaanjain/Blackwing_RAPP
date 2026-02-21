<?php

namespace App\Auctions\Events;

use App\Auctions\Models\Auction;
use App\Auctions\Models\Bid;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Auction $auction,
        public readonly Bid     $bid
    ) {}

    /**
     * Broadcasts on TWO private channels:
     *  1. The bidding vendor's own private channel (receives confirmation)
     *  2. The buyer's monitoring channel (receives activity feed item)
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("auction.{$this->auction->id}.vendor.{$this->bid->vendor_id}"),
            new PrivateChannel("auction.{$this->auction->id}.buyer.{$this->auction->buyer_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'bid.placed';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id'         => $this->auction->id,
            'bid_id'             => $this->bid->id,
            'vendor_id'          => $this->bid->vendor_id,
            'bid_amount'         => (float) $this->bid->bid_amount,
            'is_auto_bid'        => $this->bid->is_auto_bid,
            'timestamp'          => $this->bid->timestamp->toIso8601String(),
            'time_remaining_sec' => $this->auction->secondsRemaining(),
        ];
    }
}

