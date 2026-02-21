<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique();
            $table->foreignId('listing_id')->constrained('listings')->onDelete('cascade');
            $table->foreignId('vendor_user_id')->constrained('users');
            $table->decimal('quoted_price', 15, 2);
            $table->text('proposal_details');
            $table->json('line_items')->nullable(); // For detailed breakdown
            $table->integer('delivery_days');
            $table->text('terms_and_conditions')->nullable();
            $table->json('attachments')->nullable(); // File URLs/paths
            $table->enum('status', ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'])->default('submitted');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['listing_id', 'status']);
            $table->index(['vendor_user_id', 'status']);
            $table->index('submitted_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('quotes');
    }
};
