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
            $table->foreignId('edited_by')->nullable()->after('added_by')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coustomers', function (Blueprint $table) {
            $table->dropForeign(['edited_by']);
            $table->dropColumn('edited_by');
        });
    }
};
