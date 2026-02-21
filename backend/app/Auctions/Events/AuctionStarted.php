<?php

namespace App\Auctions\Events;

use App\Auctions\Models\Auction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Auction $auction) {}

    /** Buyer monitoring channel. */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("auction.{$this->auction->id}.buyer.{$this->auction->buyer_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'auction.started';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id'  => $this->auction->id,
            'listing_id'  => $this->auction->listing_id,
            'start_time'  => $this->auction->start_time->toIso8601String(),
            'end_time'    => $this->auction->end_time->toIso8601String(),
            'status'      => $this->auction->status,
        ];
    }
}

