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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('vendor_name');
            $table->string('vendor_id')->unique(); // Auto-generated unique ID like VEND-1460
            $table->string('specialization'); // Web Development, Design, etc.
            $table->text('location')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('pending');
            $table->json('skills')->nullable(); // Array of skills
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->text('portfolio_url')->nullable();
            $table->integer('years_of_experience')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['user_id']);
            $table->index(['status']);
            $table->index(['vendor_id']);
            $table->index(['specialization']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
