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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokan_id')->constrained();
            $table->date('sale_date');
            $table->foreignId('customer_id')->nullable()->constrained('coustomers');
            $table->foreignId('product_id')->constrained();
            $table->unsignedInteger('qty');           // pieces sold — always pieces, never packets
            $table->unsignedInteger('packet_size');   // snapshot from product
            $table->decimal('rate', 10, 2);           // snapshot — selling price per packet
            $table->decimal('cost_rate', 10, 2);      // snapshot — cost per packet
            $table->decimal('discount', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
