<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorCompanyConnectionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'company_share_id',
        'company_user_id',
        'message',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'vendor_profile_data',
        'expires_at',
        'blockchain_tx_hash',
    ];

    protected $casts = [
        'vendor_profile_data' => 'array',
        'reviewed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_DENIED = 'denied';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the vendor who made the request
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    /**
     * Get the company being requested (may be null for pending requests)
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    /**
     * Get the user who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for requests by vendor
     */
    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_user_id', $vendorId);
    }

    /**
     * Scope for requests to company
     */
    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_user_id', $companyId);
    }

    /**
     * Scope for requests by company share ID
     */
    public function scopeByCompanyShareId($query, $shareId)
    {
        return $query->where('company_share_id', $shareId);
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if request is denied
     */
    public function isDenied(): bool
    {
        return $this->status === self::STATUS_DENIED;
    }

    /**
     * Check if request is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Approve the request
     */
    public function approve(User $reviewer, ?string $notes = null): bool
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Deny the request
     */
    public function deny(User $reviewer, ?string $notes = null): bool
    {
        $this->update([
            'status' => self::STATUS_DENIED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Cancel the request (by vendor)
     */
    public function cancel(): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_CANCELLED,
        ]);

        return true;
    }
}
