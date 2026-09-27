<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('barber_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name'); // For walk-in customers
            $table->string('queue_number'); // e.g., A001, A002
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'cancelled'])->default('waiting');
            $table->text('services'); // JSON array of service IDs
            $table->text('notes')->nullable();
            $table->timestamp('called_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
