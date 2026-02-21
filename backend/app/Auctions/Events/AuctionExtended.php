<?php

namespace App\Auctions\Events;

use App\Auctions\Models\Auction;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionExtended implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Auction $auction) {}

    /**
     * Broadcast to buyer + every active participant.
     */
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
        return 'auction.extended';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id'         => $this->auction->id,
            'new_end_time'       => $this->auction->end_time->toIso8601String(),
            'time_remaining_sec' => $this->auction->secondsRemaining(),
        ];
    }
}

