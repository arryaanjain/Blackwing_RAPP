<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $table = 'user_wallets';

    protected $fillable = ['user_id', 'balance'];

    protected $casts = [
        'balance' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'user_id', 'user_id');
    }

    /**
     * Deduct points. Returns false if balance is insufficient.
     */
    public function deduct(int $amount, string $description, string $referenceType = null, string $referenceId = null): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        $this->decrement('balance', $amount);

        WalletTransaction::create([
            'user_id'        => $this->user_id,
            'type'           => 'debit',
            'amount'         => $amount,
            'description'    => $description,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
        ]);

        return true;
    }

    /**
     * Credit points to the wallet.
     */
    public function credit(int $amount, string $description, string $referenceType = null, string $referenceId = null): void
    {
        $this->increment('balance', $amount);

        WalletTransaction::create([
            'user_id'        => $this->user_id,
            'type'           => 'credit',
            'amount'         => $amount,
            'description'    => $description,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
        ]);
    }
}

