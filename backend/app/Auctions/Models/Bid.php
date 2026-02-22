<?php

namespace App\Auctions\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    protected $fillable = [
        'auction_id',
        'vendor_id',
        'bid_amount',
        'is_auto_bid',
        'timestamp',
        'valid',
        'blockchain_tx_hash',
    ];

    protected $casts = [
        'bid_amount'  => 'decimal:2',
        'is_auto_bid' => 'boolean',
        'timestamp'   => 'datetime',
        'valid'       => 'boolean',
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

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeValid($query)
    {
        return $query->where('valid', true);
    }

    public function scopeForVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }
}

