<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Company extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'company_id',
        'share_id',
        'gst_number',
        'business_type',
        'location',
        'description',
        'contact_phone',
        'website',
        'status',
        'blockchain_tx_hash',
        'blockchain_verified',
        'blockchain_registered_at',
    ];

    protected $casts = [
        'status' => 'string',
        'blockchain_verified' => 'boolean',
        'blockchain_registered_at' => 'datetime',
    ];

    /**
     * Boot method to auto-generate company_id and share_id
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($company) {
            if (!$company->company_id) {
                $company->company_id = self::generateCompanyId();
            }
            if (!$company->share_id) {
                $company->share_id = self::generateShareId();
            }
        });
    }

    /**
     * Generate unique company ID
     */
    public static function generateCompanyId(): string
    {
        do {
            $id = 'COMP-' . rand(1000, 9999);
        } while (self::where('company_id', $id)->exists());
        
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
            \App\Models\Vendor::where('share_id', $id)->exists()
        );
        
        return $id;
    }

    /**
     * Get the user that owns the company
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all listings created by this company
     */
    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    /**
     * Check if company profile is complete
     */
    public function isComplete(): bool
    {
        $requiredFields = ['company_name', 'business_type'];
        
        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get company data for API responses
     */
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'company_id' => $this->company_id,
            'share_id' => $this->share_id,
            'gst_number' => $this->gst_number,
            'business_type' => $this->business_type,
            'location' => $this->location,
            'description' => $this->description,
            'contact_phone' => $this->contact_phone,
            'website' => $this->website,
            'status' => $this->status,
            'blockchain_tx_hash' => $this->blockchain_tx_hash,
            'blockchain_verified' => $this->blockchain_verified,
            'blockchain_registered_at' => $this->blockchain_registered_at,
            'is_complete' => $this->isComplete(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Scope for active companies
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for pending companies
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
