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
        Schema::create('coustomer_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokan_id')->constrained('dokans')->onDelete('cascade');
            $table->string('name');
            // 1 = Percentage discount (e.g. 10% off), 2 = Fixed flat discount (e.g. ₹10 off), 3 = Cost Plus (Cost + Transportation fee)
            $table->unsignedTinyInteger('discount_type')->default(1);
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coustomer_groups');
    }
};
