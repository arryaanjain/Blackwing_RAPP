<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Listing extends Model
{
    protected $fillable = [
        'listing_number',
        'company_id',
        'title',
        'description',
        'category',
        'base_price',
        'visibility',
        'requirements',
        'specifications',
        'opens_at',
        'closes_at',
        'status',
        'created_by',
        'blockchain_enabled',
        'blockchain_tx_hash'
    ];

    protected $casts = [
        'requirements' => 'array',
        'specifications' => 'array',
        'opens_at' => 'datetime',
        'closes_at' => 'datetime',
        'blockchain_enabled' => 'boolean'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function accessibleVendors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'listing_vendor_access', 'listing_id', 'vendor_user_id')
                    ->withPivot('granted_at', 'granted_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOpen($query)
    {
        return $query->where(function ($q) {
            $q->where(function ($subQ) {
                // Case 1: Both opens_at and closes_at are set and listing is within the time window
                $subQ->whereNotNull('opens_at')
                     ->whereNotNull('closes_at')
                     ->where('opens_at', '<=', now())
                     ->where('closes_at', '>', now());
            })->orWhere(function ($subQ) {
                // Case 2: No time restrictions set (both are null) - always open
                $subQ->whereNull('opens_at')
                     ->whereNull('closes_at');
            })->orWhere(function ($subQ) {
                // Case 3: Only opens_at is set and it's past
                $subQ->whereNotNull('opens_at')
                     ->whereNull('closes_at')
                     ->where('opens_at', '<=', now());
            })->orWhere(function ($subQ) {
                // Case 4: Only closes_at is set and it's not expired
                $subQ->whereNull('opens_at')
                     ->whereNotNull('closes_at')
                     ->where('closes_at', '>', now());
            });
        });
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeAccessibleBy($query, $vendorUserId)
    {
        return $query->where(function ($q) use ($vendorUserId) {
            $q->where('visibility', 'public')
              ->orWhereHas('accessibleVendors', function ($subQ) use ($vendorUserId) {
                  $subQ->where('vendor_user_id', $vendorUserId);
              });
        });
    }
}
