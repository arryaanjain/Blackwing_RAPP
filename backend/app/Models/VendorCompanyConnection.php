<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorCompanyConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'company_user_id',
        'company_share_id',
        'connected_at',
        'approved_by',
        'original_request_id',
        'is_active',
        'permissions',
        'last_accessed_at',
        'revoked_by',
        'revoked_at',
        'revocation_reason',
    ];

    protected $casts = [
        'connected_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'revoked_at' => 'datetime',
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the vendor in this connection
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    /**
     * Get the company in this connection
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    /**
     * Get the user who approved this connection
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who revoked this connection
     */
    public function revoker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    /**
     * Get the original connection request
     */
    public function originalRequest(): BelongsTo
    {
        return $this->belongsTo(VendorCompanyConnectionRequest::class, 'original_request_id');
    }

    /**
     * Scope for active connections
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for connections by vendor
     */
    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_user_id', $vendorId);
    }

    /**
     * Scope for connections by company
     */
    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_user_id', $companyId);
    }

    /**
     * Check if connection is active
     */
    public function isActive(): bool
    {
        return $this->is_active && !$this->revoked_at;
    }

    /**
     * Revoke the connection
     */
    public function revoke(User $revoker, ?string $reason = null): bool
    {
        $this->update([
            'is_active' => false,
            'revoked_by' => $revoker->id,
            'revoked_at' => now(),
            'revocation_reason' => $reason,
        ]);

        return true;
    }

    /**
     * Reactivate the connection
     */
    public function reactivate(): bool
    {
        $this->update([
            'is_active' => true,
            'revoked_by' => null,
            'revoked_at' => null,
            'revocation_reason' => null,
        ]);

        return true;
    }

    /**
     * Update last accessed timestamp
     */
    public function updateLastAccessed(): bool
    {
        return $this->update(['last_accessed_at' => now()]);
    }
}
