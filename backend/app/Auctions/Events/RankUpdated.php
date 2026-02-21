<?php

namespace App\Auctions\Events;

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RankUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Auction           $auction,
        public readonly AuctionParticipant $participant
    ) {}

    /**
     * Each vendor receives their own rank update on their private channel.
     * They cannot see other vendors' data.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("auction.{$this->auction->id}.vendor.{$this->participant->vendor_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'rank.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id'         => $this->auction->id,
            'your_rank'          => $this->participant->current_rank,
            'your_best_bid'      => (float) $this->participant->current_best_bid,
            'time_remaining_sec' => $this->auction->secondsRemaining(),
            'end_time'           => $this->auction->end_time->toIso8601String(),
        ];
    }
}

