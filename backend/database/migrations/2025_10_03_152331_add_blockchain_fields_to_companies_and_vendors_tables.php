<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add blockchain fields to companies table
        Schema::table('companies', function (Blueprint $table) {
            $table->string('share_id')->unique()->nullable()->after('company_id');
            $table->string('blockchain_tx_hash')->nullable()->after('share_id');
            $table->boolean('blockchain_verified')->default(false)->after('blockchain_tx_hash');
            $table->timestamp('blockchain_registered_at')->nullable()->after('blockchain_verified');
        });

        // Add blockchain fields to vendors table
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('share_id')->unique()->nullable()->after('vendor_id');
            $table->string('blockchain_tx_hash')->nullable()->after('share_id');
            $table->boolean('blockchain_verified')->default(false)->after('blockchain_tx_hash');
            $table->timestamp('blockchain_registered_at')->nullable()->after('blockchain_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove blockchain fields from companies table
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['share_id', 'blockchain_tx_hash', 'blockchain_verified', 'blockchain_registered_at']);
        });

        // Remove blockchain fields from vendors table
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['share_id', 'blockchain_tx_hash', 'blockchain_verified', 'blockchain_registered_at']);
        });
    }
};
