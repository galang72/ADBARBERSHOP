<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('birthdate')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->integer('visit_count')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->timestamp('last_visit')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
