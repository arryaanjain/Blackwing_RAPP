<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('listing_vendor_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->onDelete('cascade');
            $table->foreignId('vendor_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('granted_at')->useCurrent();
            $table->foreignId('granted_by')->constrained('users');
            
            $table->unique(['listing_id', 'vendor_user_id']);
            $table->index(['vendor_user_id', 'listing_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('listing_vendor_access');
    }
};
