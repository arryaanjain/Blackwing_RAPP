<?php

namespace App\Auctions\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuctionAuditLog extends Model
{
    // Only created_at; no updated_at
    public const UPDATED_AT = null;

    protected $table = 'auction_audit_log';

    protected $fillable = [
        'auction_id',
        'event_type',
        'payload_json',
        'integrity_hash',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'created_at'   => 'datetime',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function auction(): BelongsTo
    {
        return $this->belongsTo(Auction::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Write a tamper-evident log entry.  The integrity hash is SHA-256 of
     * (auction_id + event_type + json_payload + created_at ISO string).
     * This makes the record blockchain-export-ready.
     */
    public static function log(int $auctionId, string $eventType, array $payload): self
    {
        $createdAt  = now()->toIso8601String();
        $raw        = implode('|', [$auctionId, $eventType, json_encode($payload), $createdAt]);
        $hash       = hash('sha256', $raw);

        return static::create([
            'auction_id'      => $auctionId,
            'event_type'      => $eventType,
            'payload_json'    => $payload,
            'integrity_hash'  => $hash,
            'created_at'      => $createdAt,
        ]);
    }
}

