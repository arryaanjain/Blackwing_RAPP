<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'google_sub_id',
        'current_profile_type',
        'current_profile_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'google_sub_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relationships
     */
    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get all companies owned by this user
     */
    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    /**
     * Get all vendors owned by this user
     */
    public function vendors()
    {
        return $this->hasMany(Vendor::class);
    }

    /**
     * Get the current company profile (first company for this user)
     */
    public function companyProfile()
    {
        return $this->hasOne(Company::class);
    }

    /**
     * Get the current vendor profile (first vendor for this user)
     */
    public function vendorProfile()
    {
        return $this->hasOne(Vendor::class);
    }

    /**
     * Get the current active profile (company or vendor)
     */
    public function currentProfile()
    {
        if ($this->current_profile_type === 'company') {
            return $this->companies()->find($this->current_profile_id);
        } elseif ($this->current_profile_type === 'vendor') {
            return $this->vendors()->find($this->current_profile_id);
        }
        
        return null;
    }

    /**
     * Get a profile by type (first one found)
     */
    public function getProfileByType(string $type)
    {
        if ($type === 'company') {
            return $this->companies()->first();
        } elseif ($type === 'vendor') {
            return $this->vendors()->first();
        }
        
        return null;
    }

    /**
     * Utility methods for refresh tokens
     */
    public function createRefreshToken(string $deviceName = null): RefreshToken
    {
        return RefreshToken::createForUser($this, $deviceName);
    }

    public function revokeAllRefreshTokens(): void
    {
        $this->refreshTokens()->delete();
    }

    /**
     * Check if user has a company profile
     */
    public function hasCompanyProfile(): bool
    {
        return $this->companies()->exists();
    }

    /**
     * Check if user has a vendor profile
     */
    public function hasVendorProfile(): bool
    {
        return $this->vendors()->exists();
    }

    /**
     * Check if current profile is a company
     */
    public function isCompany(): bool
    {
        return $this->current_profile_type === 'company';
    }

    /**
     * Check if current profile is a vendor
     */
    public function isVendor(): bool
    {
        return $this->current_profile_type === 'vendor';
    }

    /**
     * Listings created by this user (when they're a company)
     */
    public function createdListings()
    {
        return $this->hasMany(Listing::class, 'created_by');
    }

    /**
     * Quotes submitted by this user (when they're a vendor)
     */
    public function submittedQuotes()
    {
        return $this->hasMany(Quote::class, 'vendor_user_id');
    }

    /**
     * Quotes reviewed by this user (when they're a company)
     */
    public function reviewedQuotes()
    {
        return $this->hasMany(Quote::class, 'reviewed_by');
    }

    /**
     * Private listings this vendor has access to
     */
    public function accessibleListings()
    {
        return $this->belongsToMany(Listing::class, 'listing_vendor_access', 'vendor_user_id', 'listing_id')
                    ->withPivot('granted_at', 'granted_by')
                    ->withTimestamps();
    }

    /**
     * Switch to a specific profile
     */
    public function switchToProfile(string $type, int $profileId): bool
    {
        if ($type === 'company' && $this->companies()->where('id', $profileId)->exists()) {
            $this->current_profile_type = 'company';
            $this->current_profile_id = $profileId;
            $this->save();
            return true;
        } elseif ($type === 'vendor' && $this->vendors()->where('id', $profileId)->exists()) {
            $this->current_profile_type = 'vendor';
            $this->current_profile_id = $profileId;
            $this->save();
            return true;
        }
        
        return false;
    }

    /**
     * Get all available profiles for this user
     */
    public function getAvailableProfiles(): array
    {
        $profiles = [];
        
        foreach ($this->companies as $company) {
            $profiles[] = [
                'type' => 'company',
                'id' => $company->id,
                'name' => $company->company_name,
                'identifier' => $company->company_id,
                'status' => $company->status,
                'is_complete' => $company->isComplete(),
                'is_current' => $this->current_profile_type === 'company' && $this->current_profile_id === $company->id,
            ];
        }
        
        foreach ($this->vendors as $vendor) {
            $profiles[] = [
                'type' => 'vendor',
                'id' => $vendor->id,
                'name' => $vendor->vendor_name,
                'identifier' => $vendor->vendor_id,
                'status' => $vendor->status,
                'is_complete' => $vendor->isComplete(),
                'is_current' => $this->current_profile_type === 'vendor' && $this->current_profile_id === $vendor->id,
            ];
        }
        
        return $profiles;
    }

    /**
     * Check if user has a password set
     */
    public function hasPassword(): bool
    {
        return !is_null($this->password);
    }

    /**
     * Generate unique company ID
     */
    public static function generateCompanyId(): string
    {
        do {
            $companyId = 'COMP-' . str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('company_id', $companyId)->exists());
        
        return $companyId;
    }

    /**
     * Google OAuth sub_id decoder
     * Extracts the sub ID from Google ID token
     */
    public static function extractSubIdFromGoogleToken(string $googleId): ?string
    {
        try {
            // If the googleId is already a sub_id (numeric string), return it
            if (is_numeric($googleId)) {
                return $googleId;
            }
            
            // If it's a JWT token, decode it
            if (str_contains($googleId, '.')) {
                $parts = explode('.', $googleId);
                if (count($parts) === 3) {
                    // Decode the payload (second part)
                    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
                    return $payload['sub'] ?? null;
                }
            }
            
            // If it's not a JWT but looks like encoded data, try to decode
            if (strlen($googleId) > 50 && !is_numeric($googleId)) {
                // This might be some other encoded format
                // For now, we'll store it as is and log for investigation
                \Log::info('Unusual Google ID format detected', ['google_id' => $googleId]);
                return $googleId;
            }
            
            return $googleId;
        } catch (\Exception $e) {
            \Log::error('Failed to extract sub_id from Google token', [
                'google_id' => $googleId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create or update user from Google OAuth data
     */
    public static function createOrUpdateFromGoogle(array $googleUser): self
    {
        // Extract sub_id from Google ID
        $subId = static::extractSubIdFromGoogleToken($googleUser['id']);
        
        if (!$subId) {
            throw new \Exception('Could not extract valid sub_id from Google authentication');
        }

        // Check if user already exists by email or sub_id
        $user = static::where('email', $googleUser['email'])
            ->orWhere('google_sub_id', $subId)
            ->first();

        if ($user) {
            // Update existing user's OAuth data
            $user->update([
                'google_id' => $googleUser['id'],
                'google_sub_id' => $subId,
                'email_verified_at' => now(),
            ]);
        } else {
            // Create new user (no profile-specific data)
            $userData = [
                'name' => $googleUser['name'],
                'email' => $googleUser['email'],
                'google_id' => $googleUser['id'],
                'google_sub_id' => $subId,
                'password' => null,
                'email_verified_at' => now(),
                'is_active' => true,
            ];

            $user = static::create($userData);
        }

        return $user;
    }

    /**
     * Complete user profile after OAuth registration
     */
    public function completeProfile(array $profileData): bool
    {
        try {
            $updateData = [];

            if ($this->isCompany()) {
                $updateData = [
                    'company_name' => $profileData['company_name'] ?? null,
                    'gst_number' => $profileData['gst_number'] ?? null,
                    'business_type' => $profileData['business_type'] ?? null,
                    'location' => $profileData['location'] ?? null,
                    'description' => $profileData['description'] ?? null,
                    'contact_phone' => $profileData['contact_phone'] ?? null,
                    'website' => $profileData['website'] ?? null,
                    'status' => 'active',
                ];
            } elseif ($this->isVendor()) {
                $updateData = [
                    'vendor_name' => $profileData['vendor_name'] ?? null,
                    'associated_company_id' => $profileData['associated_company_id'] ?? null,
                    'gst_number' => $profileData['gst_number'] ?? null,
                    'specialization' => $profileData['specialization'] ?? null,
                    'location' => $profileData['location'] ?? null,
                    'description' => $profileData['description'] ?? null,
                    'contact_phone' => $profileData['contact_phone'] ?? null,
                    'website' => $profileData['website'] ?? null,
                    'status' => 'active',
                ];
            }

            $this->update($updateData);
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to complete user profile', [
                'user_id' => $this->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get formatted user data for API responses
     */
    public function getApiData(): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'user_type' => $this->user_type,
            'status' => $this->status,
            'has_password' => $this->hasPassword(),
            'location' => $this->location,
            'description' => $this->description,
            'contact_phone' => $this->contact_phone,
            'website' => $this->website,
            'created_at' => $this->created_at,
            'current_profile_type' => $this->current_profile_type,
            'current_profile_id' => $this->current_profile_id,
        ];

        // Use getAvailableProfiles which includes proper type field
        $data['available_profiles'] = $this->getAvailableProfiles();
        
        // Add current_profile if set
        $data['current_profile'] = null;
        if ($this->current_profile_type && $this->current_profile_id) {
            $currentProfile = $this->currentProfile();
            if ($currentProfile) {
                $currentProfileData = $currentProfile->getApiData();
                // Add the type field for consistency
                $currentProfileData['type'] = $this->current_profile_type;
                $data['current_profile'] = $currentProfileData;
            }
        }

        if ($this->isCompany()) {
            $data['company_data'] = [
                'company_name' => $this->company_name,
                'company_id' => $this->company_id,
                'gst_number' => $this->gst_number,
                'business_type' => $this->business_type,
            ];
        } elseif ($this->isVendor()) {
            $data['vendor_data'] = [
                'vendor_name' => $this->vendor_name,
                'associated_company_id' => $this->associated_company_id,
                'gst_number' => $this->gst_number,
                'specialization' => $this->specialization,
            ];
        }

        return $data;
    }
}
