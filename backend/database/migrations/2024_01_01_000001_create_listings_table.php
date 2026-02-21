<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->string('blockchain_id')->unique()->nullable(); // For blockchain integration
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->integer('quantity');
            $table->decimal('max_price', 12, 2);
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->enum('status', ['draft', 'active', 'closed', 'cancelled'])->default('draft');
            $table->string('category');
            $table->string('delivery_timeline');
            $table->string('location')->nullable();
            $table->json('requirements')->nullable(); // Technical specs
            $table->json('attachments')->nullable(); // File paths
            $table->boolean('accept_crypto')->default(false);
            $table->integer('duration_in_days');
            $table->timestamp('deadline')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            $table->index(['company_user_id', 'status']);
            $table->index(['visibility', 'status', 'deadline']);
            $table->index(['category', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('listings');
    }
};
