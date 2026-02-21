<?php

namespace App\Auctions\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuctionParticipant extends Model
{
    protected $fillable = [
        'auction_id',
        'vendor_id',
        'initial_price',
        'current_best_bid',
        'current_rank',
        'auto_bid_enabled',
        'minimum_acceptable_price',
    ];

    protected $casts = [
        'initial_price'            => 'decimal:2',
        'current_best_bid'         => 'decimal:2',
        'current_rank'             => 'integer',
        'auto_bid_enabled'         => 'boolean',
        'minimum_acceptable_price' => 'decimal:2',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function auction(): BelongsTo
    {
        return $this->belongsTo(Auction::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class, 'vendor_id', 'vendor_id')
                    ->where('auction_id', $this->auction_id);
    }
}

