<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auction_id')->constrained('auctions')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('users')->onDelete('cascade');
            $table->decimal('bid_amount', 15, 2);
            $table->boolean('is_auto_bid')->default(false);
            $table->dateTime('timestamp');
            $table->boolean('valid')->default(true);
            $table->timestamps();

            // Optimised query indexes
            $table->index(['auction_id', 'valid', 'bid_amount']);
            $table->index(['auction_id', 'vendor_id', 'timestamp']);
            $table->index(['auction_id', 'vendor_id', 'valid', 'bid_amount']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bids');
    }
};

