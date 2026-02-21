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
        Schema::table('listings', function (Blueprint $table) {
            // Drop foreign keys and indices first
            try { $table->dropForeign(['company_user_id']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['company_user_id', 'status']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['visibility', 'status', 'deadline']); } catch (\Throwable $e) {}
            try { $table->dropIndex(['category', 'status']); } catch (\Throwable $e) {}
            // Drop unique index on blockchain_id if present
            try { $table->dropUnique('listings_blockchain_id_unique'); } catch (\Throwable $e) {}
        });
        
        Schema::table('listings', function (Blueprint $table) {
            // Drop columns that don't match the model
            $table->dropColumn([
                'blockchain_id',
                'company_user_id',
                'quantity',
                'max_price',
                'delivery_timeline',
                'location',
                'requirements',
                'attachments',
                'accept_crypto',
                'duration_in_days',
                'deadline',
                'published_at'
            ]);
        });
        
        Schema::table('listings', function (Blueprint $table) {
            // Add columns that match the model
            $table->string('listing_number')->unique()->after('id');
            $table->foreignId('company_id')->after('listing_number')->constrained('companies')->onDelete('cascade');
            $table->decimal('base_price', 12, 2)->nullable()->after('category');
            $table->json('requirements')->nullable()->after('visibility');
            $table->json('specifications')->nullable()->after('requirements');
            $table->timestamp('opens_at')->nullable()->after('specifications');
            $table->timestamp('closes_at')->nullable()->after('opens_at');
            $table->foreignId('created_by')->after('status')->constrained('users')->onDelete('cascade');
            $table->boolean('blockchain_enabled')->default(false)->after('created_by');
            $table->string('blockchain_tx_hash')->nullable()->after('blockchain_enabled');
            
            // Add new indices
            $table->index(['company_id', 'status']);
            $table->index(['visibility', 'status', 'closes_at']);
            $table->index(['category', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // Reverse the changes
            $table->dropColumn([
                'listing_number',
                'company_id',
                'base_price',
                'requirements',
                'specifications',
                'opens_at',
                'closes_at',
                'created_by',
                'blockchain_enabled',
                'blockchain_tx_hash'
            ]);
            
            // Add back the old columns
            $table->string('blockchain_id')->unique()->nullable();
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('max_price', 12, 2);
            $table->string('delivery_timeline');
            $table->string('location')->nullable();
            $table->json('requirements')->nullable();
            $table->json('attachments')->nullable();
            $table->boolean('accept_crypto')->default(false);
            $table->integer('duration_in_days');
            $table->timestamp('deadline')->nullable();
            $table->timestamp('published_at')->nullable();
        });
    }
};
