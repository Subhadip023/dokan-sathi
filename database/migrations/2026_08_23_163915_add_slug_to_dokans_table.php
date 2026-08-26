<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Dokan;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dokans', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        // Generate slugs for existing dokans
        $dokans = Dokan::all();
        foreach ($dokans as $dokan) {
            if (!$dokan->slug) {
                $baseSlug = Str::slug($dokan->name) ?: 'dokan';
                $slug = $baseSlug;
                $count = 1;
                while (Dokan::where('slug', $slug)->where('id', '!=', $dokan->id)->exists()) {
                    $slug = $baseSlug . '-' . $count++;
                }
                $dokan->slug = $slug;
                $dokan->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokans', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
