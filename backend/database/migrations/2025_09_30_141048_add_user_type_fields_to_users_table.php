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
            // OAuth fields
            $table->string('google_id')->nullable()->after('email');
            $table->string('google_sub_id')->nullable()->after('google_id'); // Store Google sub ID separately
            
            // User type and role fields
            $table->enum('user_type', ['company', 'vendor'])->after('google_sub_id');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending')->after('user_type');
            
            // Company-specific fields
            $table->string('company_name')->nullable()->after('status');
            $table->string('company_id')->nullable()->unique()->after('company_name'); // Generated company ID
            $table->string('gst_number')->nullable()->after('company_id');
            $table->enum('business_type', ['manufacturing', 'trading', 'services', 'construction', 'retail', 'other'])->nullable()->after('gst_number');
            
            // Vendor-specific fields
            $table->string('vendor_name')->nullable()->after('business_type');
            $table->string('associated_company_id')->nullable()->after('vendor_name'); // Company ID they work with
            $table->string('specialization')->nullable()->after('associated_company_id');
            
            // Common profile fields
            $table->string('location')->nullable()->after('specialization');
            $table->text('description')->nullable()->after('location');
            $table->string('contact_phone')->nullable()->after('description');
            $table->string('website')->nullable()->after('contact_phone');
            
            // Make password nullable for OAuth users
            $table->string('password')->nullable()->change();
            
            // Add indexes for performance
            $table->index(['user_type', 'status']);
            $table->index('google_sub_id');
            $table->index('company_id');
            $table->index('associated_company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['user_type', 'status']);
            $table->dropIndex(['google_sub_id']);
            $table->dropIndex(['company_id']);
            $table->dropIndex(['associated_company_id']);
            
            $table->dropColumn([
                'google_id',
                'google_sub_id',
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
            
            // Make password non-nullable again
            $table->string('password')->nullable(false)->change();
        });
    }
};
