<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->enum('minimum_decrement_type', ['percent', 'fixed'])->default('fixed');
            $table->decimal('minimum_decrement_value', 15, 2)->default(0);
            $table->unsignedInteger('extension_window_seconds')->default(300);   // 5 min
            $table->unsignedInteger('extension_duration_seconds')->default(300); // 5 min
            $table->enum('status', ['scheduled', 'running', 'completed'])->default('scheduled');
            $table->timestamps();

            $table->index(['status', 'start_time']);
            $table->index(['status', 'end_time']);
            $table->index('listing_id');
            $table->index('buyer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};

