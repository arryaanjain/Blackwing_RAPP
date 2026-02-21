<?php

namespace App\Auctions\Services;

use App\Auctions\Models\Auction;
use App\Auctions\Models\AuctionParticipant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AuctionRankingService
{
    /**
     * Recalculate all ranks for an auction.
     * Each participant's rank is based on their lowest valid bid.
     * Tie-breaker: earlier timestamp wins (lower rank number = better).
     *
     * Must be called INSIDE a DB transaction that already holds a
     * lockForUpdate() on the auction row.
     */
    public function calculateRanks(Auction $auction): void
    {
        // Best (lowest) valid bid per vendor with its earliest timestamp
        $bestBids = DB::table('bids')
            ->where('auction_id', $auction->id)
            ->where('valid', true)
            ->select('vendor_id',
                DB::raw('MIN(bid_amount) as min_bid'),
                DB::raw('MIN(timestamp) as first_bid_ts'))
            ->groupBy('vendor_id')
            ->get();

        // Sort: ascending bid, then ascending timestamp (earlier = better rank)
        $sorted = $bestBids->sortBy([
            ['min_bid',      'asc'],
            ['first_bid_ts', 'asc'],
        ])->values();

        foreach ($sorted as $index => $row) {
            AuctionParticipant::where('auction_id', $auction->id)
                ->where('vendor_id', $row->vendor_id)
                ->update([
                    'current_best_bid' => $row->min_bid,
                    'current_rank'     => $index + 1,
                ]);
        }

        // Participants who haven't bid yet get rank = null
        $biddedVendorIds = $bestBids->pluck('vendor_id')->toArray();
        AuctionParticipant::where('auction_id', $auction->id)
            ->whereNotIn('vendor_id', $biddedVendorIds)
            ->update(['current_rank' => null, 'current_best_bid' => null]);
    }

    /**
     * Return top N participants ordered by rank, with masked data.
     * Company/buyer view: shows bid amounts.
     */
    public function getTopVendors(Auction $auction, int $limit = 10): Collection
    {
        return AuctionParticipant::with('vendor')
            ->where('auction_id', $auction->id)
            ->whereNotNull('current_rank')
            ->orderBy('current_rank')
            ->limit($limit)
            ->get()
            ->map(fn (AuctionParticipant $p) => [
                'rank'             => $p->current_rank,
                'vendor_id'        => $p->vendor_id,
                'vendor_name'      => $p->vendor->name,
                'current_best_bid' => (float) $p->current_best_bid,
            ]);
    }

    /**
     * Return a single vendor's rank (null if they haven't bid).
     */
    public function getVendorRank(Auction $auction, int $vendorId): ?int
    {
        return AuctionParticipant::where('auction_id', $auction->id)
            ->where('vendor_id', $vendorId)
            ->value('current_rank');
    }

    /**
     * Return the current lowest valid bid amount (null if no bids yet).
     */
    public function getLowestBid(Auction $auction): ?float
    {
        $min = \App\Auctions\Models\Bid::where('auction_id', $auction->id)
            ->where('valid', true)
            ->min('bid_amount');

        return $min !== null ? (float) $min : null;
    }
}

