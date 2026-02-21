<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auction_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auction_id')->constrained('auctions')->onDelete('cascade');
            $table->string('event_type', 80);
            $table->json('payload_json');
            $table->string('integrity_hash', 64)->nullable(); // SHA-256 for blockchain readiness
            $table->timestamp('created_at')->useCurrent();

            $table->index(['auction_id', 'event_type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auction_audit_log');
    }
};

