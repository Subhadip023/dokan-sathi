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
        Schema::table('coustomers', function (Blueprint $table) {
            $table->string('email')->nullable()->after('phone');
            $table->string('shop_name')->nullable()->after('email');
            $table->foreignId('added_by')->nullable()->after('shop_name')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coustomers', function (Blueprint $table) {
            $table->dropForeign(['added_by']);
            $table->dropColumn(['email', 'shop_name', 'added_by']);
        });
    }
};
