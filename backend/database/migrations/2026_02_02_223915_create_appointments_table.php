<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('barber_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->text('services'); // JSON array of service IDs
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->timestamp('reminded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
