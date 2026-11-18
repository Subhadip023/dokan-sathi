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
            $table->foreignId('coustomer_group_id')
                ->nullable()
                ->after('dokan_id')
                ->constrained('coustomer_groups')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coustomers', function (Blueprint $table) {
            $table->dropForeign(['coustomer_group_id']);
            $table->dropColumn('coustomer_group_id');
        });
    }
};
