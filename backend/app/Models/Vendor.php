<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Vendor extends Model
{
    protected $fillable = [
        'user_id',
        'vendor_name',
        'vendor_id',
        'share_id',
        'specialization',
        'location',
        'description',
        'contact_phone',
        'website',
        'status',
        'skills',
        'hourly_rate',
        'portfolio_url',
        'years_of_experience',
        'blockchain_tx_hash',
        'blockchain_verified',
        'blockchain_registered_at',
    ];

    protected $casts = [
        'skills' => 'array',
        'hourly_rate' => 'decimal:2',
        'years_of_experience' => 'integer',
        'status' => 'string',
        'blockchain_verified' => 'boolean',
        'blockchain_registered_at' => 'datetime',
    ];

    /**
     * Boot method to auto-generate vendor_id and share_id
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($vendor) {
            if (!$vendor->vendor_id) {
                $vendor->vendor_id = self::generateVendorId();
            }
            if (!$vendor->share_id) {
                $vendor->share_id = self::generateShareId();
            }
        });
    }

    /**
     * Generate unique vendor ID
     */
    public static function generateVendorId(): string
    {
        do {
            $id = 'VEND-' . rand(1000, 9999);
        } while (self::where('vendor_id', $id)->exists());
        
        return $id;
    }

    /**
     * Generate unique share ID for blockchain
     */
    public static function generateShareId(): string
    {
        do {
            $id = 'SH-' . strtoupper(Str::random(12));
        } while (
            self::where('share_id', $id)->exists() || 
            \App\Models\Company::where('share_id', $id)->exists()
        );
        
        return $id;
    }

    /**
     * Get the user that owns the vendor profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if vendor profile is complete
     */
    public function isComplete(): bool
    {
        $requiredFields = ['vendor_name', 'specialization'];
        
        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get vendor data for API responses
     */
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'vendor_name' => $this->vendor_name,
            'vendor_id' => $this->vendor_id,
            'share_id' => $this->share_id,
            'specialization' => $this->specialization,
            'location' => $this->location,
            'description' => $this->description,
            'contact_phone' => $this->contact_phone,
            'website' => $this->website,
            'status' => $this->status,
            'skills' => $this->skills,
            'hourly_rate' => $this->hourly_rate,
            'portfolio_url' => $this->portfolio_url,
            'years_of_experience' => $this->years_of_experience,
            'blockchain_tx_hash' => $this->blockchain_tx_hash,
            'blockchain_verified' => $this->blockchain_verified,
            'blockchain_registered_at' => $this->blockchain_registered_at,
            'is_complete' => $this->isComplete(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Scope for active vendors
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for pending vendors
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope by specialization
     */
    public function scopeBySpecialization($query, $specialization)
    {
        return $query->where('specialization', $specialization);
    }
}
