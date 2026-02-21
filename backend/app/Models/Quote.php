<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quote extends Model
{
    protected $fillable = [
        'quote_number',
        'listing_id',
        'vendor_user_id',
        'quoted_price',
        'proposal_details',
        'line_items',
        'delivery_days',
        'terms_and_conditions',
        'attachments',
        'status',
        'submitted_at',
        'expires_at',
        'reviewed_by',
        'reviewed_at',
        'review_notes'
    ];

    protected $casts = [
        'line_items' => 'array',
        'attachments' => 'array',
        'quoted_price' => 'decimal:2',
        'submitted_at' => 'datetime',
        'expires_at' => 'datetime',
        'reviewed_at' => 'datetime'
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeForVendor($query, $vendorUserId)
    {
        return $query->where('vendor_user_id', $vendorUserId);
    }

    public function scopeForListing($query, $listingId)
    {
        return $query->where('listing_id', $listingId);
    }
}
