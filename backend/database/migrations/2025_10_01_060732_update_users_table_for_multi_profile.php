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
        Schema::table('users', function (Blueprint $table) {
            // Remove profile-specific columns that will now be in companies/vendors tables
            $table->dropColumn([
                'user_type',
                'status',
                'company_name',
                'company_id',
                'gst_number',
                'business_type',
                'vendor_name',
                'associated_company_id',
                'specialization',
                'location',
                'description',
                'contact_phone',
                'website'
            ]);
            
            // Add fields for multi-profile support
            $table->string('current_profile_type')->nullable(); // 'company' or 'vendor'
            $table->unsignedBigInteger('current_profile_id')->nullable(); // ID of current active profile
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restore original columns
            $table->enum('user_type', ['company', 'vendor'])->nullable();
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->string('company_name')->nullable();
            $table->string('company_id')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('business_type')->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('associated_company_id')->nullable();
            $table->string('specialization')->nullable();
            $table->text('location')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website')->nullable();
            
            // Remove multi-profile columns
            $table->dropColumn([
                'current_profile_type',
                'current_profile_id',
                'is_active'
            ]);
        });
    }
};
