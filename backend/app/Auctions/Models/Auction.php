<?php

namespace App\Auctions\Models;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Auction extends Model
{
    protected $fillable = [
        'listing_id',
        'buyer_id',
        'start_time',
        'end_time',
        'minimum_decrement_type',
        'minimum_decrement_value',
        'extension_window_seconds',
        'extension_duration_seconds',
        'status',
    ];

    /** Mirror the database column defaults so in-memory models are consistent. */
    protected $attributes = [
        'status'                     => 'scheduled',
        'minimum_decrement_type'     => 'fixed',
        'minimum_decrement_value'    => 0,
        'extension_window_seconds'   => 300,
        'extension_duration_seconds' => 300,
    ];

    protected $casts = [
        'start_time'               => 'datetime',
        'end_time'                 => 'datetime',
        'minimum_decrement_value'  => 'decimal:2',
        'extension_window_seconds' => 'integer',
        'extension_duration_seconds' => 'integer',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(AuctionParticipant::class);
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuctionAuditLog::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isRunning(): bool
    {
        return $this->status === 'running' && now()->between($this->start_time, $this->end_time);
    }

    public function hasEnded(): bool
    {
        return $this->status === 'completed' || now()->isAfter($this->end_time);
    }

    public function secondsRemaining(): int
    {
        if ($this->hasEnded()) {
            return 0;
        }
        return max(0, now()->diffInSeconds($this->end_time, false));
    }

    /** True when a bid placed NOW would fall inside the anti-snipe window. */
    public function isInExtensionWindow(): bool
    {
        return $this->status === 'running'
            && $this->secondsRemaining() <= $this->extension_window_seconds;
    }

    /** Calculate minimum valid bid given the current lowest bid. */
    public function calculateMinimumNextBid(float $currentLowest): float
    {
        if ($this->minimum_decrement_type === 'percent') {
            $decrement = $currentLowest * ($this->minimum_decrement_value / 100);
        } else {
            $decrement = $this->minimum_decrement_value;
        }

        return round($currentLowest - $decrement, 2);
    }
}

