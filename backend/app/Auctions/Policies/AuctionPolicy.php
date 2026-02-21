<?php

namespace App\Auctions\Policies;

use App\Auctions\Models\Auction;
use App\Models\User;

class AuctionPolicy
{
    /** Any authenticated user can view auction details. */
    public function view(User $user, Auction $auction): bool
    {
        return true;
    }

    /** Only the buyer who created the auction can see the full leaderboard. */
    public function viewLeaderboard(User $user, Auction $auction): bool
    {
        return $user->id === $auction->buyer_id;
    }

    /** Only the buyer can create an auction (validated in controller as well). */
    public function create(User $user): bool
    {
        return $user->isCompany();
    }

    /** Only the buyer who owns the auction can start it. */
    public function start(User $user, Auction $auction): bool
    {
        return $user->id === $auction->buyer_id;
    }

    /** Only the buyer who owns the auction can force-end it. */
    public function end(User $user, Auction $auction): bool
    {
        return $user->id === $auction->buyer_id;
    }

    /** Only vendors can join an auction. */
    public function join(User $user, Auction $auction): bool
    {
        return $user->isVendor();
    }

    /** Only vendors can place bids. */
    public function bid(User $user, Auction $auction): bool
    {
        return $user->isVendor();
    }

    /** Only the buyer can view the audit log. */
    public function viewAuditLog(User $user, Auction $auction): bool
    {
        return $user->id === $auction->buyer_id;
    }
}

