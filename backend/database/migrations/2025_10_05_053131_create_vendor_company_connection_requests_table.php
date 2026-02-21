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
        Schema::create('vendor_company_connection_requests', function (Blueprint $table) {
            $table->id();
            
            // Request details
            $table->foreignId('vendor_user_id')->constrained('users')->onDelete('cascade');
            $table->string('company_share_id'); // The share_id the vendor is trying to connect to
            $table->foreignId('company_user_id')->nullable()->constrained('users')->onDelete('cascade'); // Resolved after request
            
            // Request data
            $table->text('message')->nullable(); // Optional message from vendor
            $table->enum('status', ['pending', 'approved', 'denied', 'cancelled'])->default('pending');
            
            // Approval details
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            
            // Metadata
            $table->json('vendor_profile_data')->nullable(); // Snapshot of vendor info at request time
            $table->timestamp('expires_at')->nullable(); // Optional expiration for requests
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('vendor_user_id', 'vcr_vendor_idx');
            $table->index('company_share_id', 'vcr_share_id_idx');
            $table->index('company_user_id', 'vcr_company_idx');
            $table->index('status', 'vcr_status_idx');
            $table->index(['vendor_user_id', 'company_share_id'], 'vcr_vendor_share_idx'); // Prevent duplicate requests
            
            // Unique constraint to prevent duplicate pending requests
            $table->unique(['vendor_user_id', 'company_share_id', 'status'], 'vcr_unique_pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_company_connection_requests');
    }
};
