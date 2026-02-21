<?php

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/**
 * Buyer's private monitoring channel.
 * Only the buyer who created the auction can subscribe.
 *
 * Channel: auction.{auctionId}.buyer.{buyerId}
 */
Broadcast::channel('auction.{auctionId}.buyer.{buyerId}', function ($user, $auctionId, $buyerId) {
    if ((int) $user->id !== (int) $buyerId) {
        return false;
    }

    $auction = Auction::find($auctionId);
    return $auction && (int) $auction->buyer_id === (int) $user->id;
});

/**
 * Vendor's private channel.
 * Only the vendor with the matching ID can subscribe.
 * Used to receive bid confirmation and rank updates.
 *
 * Channel: auction.{auctionId}.vendor.{vendorId}
 */
Broadcast::channel('auction.{auctionId}.vendor.{vendorId}', function ($user, $auctionId, $vendorId) {
    if ((int) $user->id !== (int) $vendorId) {
        return false;
    }

    // Vendor must be a registered participant in this auction
    return AuctionParticipant::where('auction_id', $auctionId)
        ->where('vendor_id', $user->id)
        ->exists();
});

