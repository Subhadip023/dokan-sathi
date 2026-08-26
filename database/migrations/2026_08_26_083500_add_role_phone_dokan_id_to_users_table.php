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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->unsignedTinyInteger('role')->default(1)->comment('1: Admin/Owner, 2: Staff/Employee')->after('phone');
            }
            if (!Schema::hasColumn('users', 'dokan_id')) {
                $table->foreignId('dokan_id')->nullable()->constrained('dokans')->nullOnDelete()->after('role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['dokan_id']);
            $table->dropColumn(['phone', 'role', 'dokan_id']);
        });
    }
};
