<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->string('blockchain_tx_hash')->nullable()->after('status');
            $table->string('receipt_tx_hash')->nullable()->after('blockchain_tx_hash');
        });

        Schema::table('bids', function (Blueprint $table) {
            $table->string('blockchain_tx_hash')->nullable()->after('valid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('auctions', function (Blueprint $table) {
            $table->dropColumn(['blockchain_tx_hash', 'receipt_tx_hash']);
        });

        Schema::table('bids', function (Blueprint $table) {
            $table->dropColumn('blockchain_tx_hash');
        });
    }
};
