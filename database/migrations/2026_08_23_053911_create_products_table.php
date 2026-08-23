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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokan_id')->constrained();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('reorder_level')->default(5);
            $table->unsignedInteger('purchased_packets');
            $table->unsignedInteger('packet_size')->default(1);
            $table->decimal('cost_rate', 10, 2); 
            $table->decimal('selling_rate', 10, 2); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
