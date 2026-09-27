<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'reminder_minutes')) {
                $table->integer('reminder_minutes')->default(10)->after('notes');
            }
            if (!Schema::hasColumn('appointments', 'reminded_at')) {
                $table->timestamp('reminded_at')->nullable()->after('notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['reminder_minutes', 'reminded_at']);
        });
    }
};
