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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('company_id')->unique(); // Auto-generated unique ID like COMP-1460
            $table->string('gst_number')->nullable();
            $table->string('business_type')->nullable();
            $table->text('location')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('pending');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['user_id']);
            $table->index(['status']);
            $table->index(['company_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
