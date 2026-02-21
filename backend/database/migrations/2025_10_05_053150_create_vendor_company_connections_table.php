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
        Schema::create('vendor_company_connections', function (Blueprint $table) {
            $table->id();
            
            // Connection participants
            $table->foreignId('vendor_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->string('company_share_id'); // For reference
            
            // Connection metadata
            $table->timestamp('connected_at')->useCurrent();
            $table->foreignId('approved_by')->constrained('users')->onDelete('cascade'); // Who approved the connection
            $table->foreignId('original_request_id')->nullable()->constrained('vendor_company_connection_requests')->onDelete('set null');
            
            // Access control
            $table->boolean('is_active')->default(true);
            $table->json('permissions')->nullable(); // Future: granular permissions
            $table->timestamp('last_accessed_at')->nullable();
            
            // Revocation tracking
            $table->foreignId('revoked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('revoked_at')->nullable();
            $table->text('revocation_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('vendor_user_id', 'vcc_vendor_idx');
            $table->index('company_user_id', 'vcc_company_idx');
            $table->index('company_share_id', 'vcc_share_id_idx');
            $table->index('is_active', 'vcc_active_idx');
            $table->index(['vendor_user_id', 'company_user_id'], 'vcc_vendor_company_idx'); // Quick lookup for existing connections
            
            // Unique constraint to prevent duplicate connections
            $table->unique(['vendor_user_id', 'company_user_id'], 'vcc_unique_connection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_company_connections');
    }
};
