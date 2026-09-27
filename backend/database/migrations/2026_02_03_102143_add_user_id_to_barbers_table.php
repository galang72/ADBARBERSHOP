<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->decimal('commission_rate', 5, 2)->default(10.00)->after('status'); // 10% komisi sebagai bonus
            $table->decimal('salary', 12, 2)->default(0)->after('commission_rate');
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'commission_rate', 'salary']);
        });
    }
};
