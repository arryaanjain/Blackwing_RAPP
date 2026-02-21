<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RefreshToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'device_name',
        'expires_at',
        'last_used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    public static function generateToken(): string
    {
        return hash('sha256', Str::random(64) . time());
    }

    public static function createForUser(User $user, string $deviceName = null): self
    {
        return static::create([
            'user_id' => $user->id,
            'token' => static::generateToken(),
            'device_name' => $deviceName,
            'expires_at' => now()->addDays(7), // 7 days
        ]);
    }

    public function rotate(): self
    {
        // Create new refresh token
        $newToken = static::createForUser($this->user, $this->device_name);
        
        // Delete the old token
        $this->delete();
        
        return $newToken;
    }
}
