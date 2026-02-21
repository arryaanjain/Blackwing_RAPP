<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auction_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auction_id')->constrained('auctions')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('users')->onDelete('cascade');
            $table->decimal('initial_price', 15, 2)->nullable();
            $table->decimal('current_best_bid', 15, 2)->nullable();
            $table->unsignedInteger('current_rank')->nullable();
            $table->boolean('auto_bid_enabled')->default(false);
            $table->decimal('minimum_acceptable_price', 15, 2)->nullable();
            $table->timestamps();

            $table->unique(['auction_id', 'vendor_id']);
            $table->index(['auction_id', 'current_rank']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auction_participants');
    }
};

