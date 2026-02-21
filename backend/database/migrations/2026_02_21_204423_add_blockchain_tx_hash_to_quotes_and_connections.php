<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add blockchain_tx_hash to quotes, vendor_company_connections,
     * and vendor_company_connection_requests tables.
     */
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('blockchain_tx_hash')->nullable()->after('review_notes');
        });

        Schema::table('vendor_company_connections', function (Blueprint $table) {
            $table->string('blockchain_tx_hash')->nullable()->after('revocation_reason');
        });

        Schema::table('vendor_company_connection_requests', function (Blueprint $table) {
            $table->string('blockchain_tx_hash')->nullable()->after('review_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('blockchain_tx_hash');
        });

        Schema::table('vendor_company_connections', function (Blueprint $table) {
            $table->dropColumn('blockchain_tx_hash');
        });

        Schema::table('vendor_company_connection_requests', function (Blueprint $table) {
            $table->dropColumn('blockchain_tx_hash');
        });
    }
};
