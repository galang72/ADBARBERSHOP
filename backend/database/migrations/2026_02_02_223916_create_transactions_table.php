<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // INV-20240202-0001
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained(); // Cashier/staff who created the transaction
            $table->foreignId('barber_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('queue_id')->nullable()->constrained()->nullOnDelete();
            
            // Totals
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            
            // Payment
            $table->enum('payment_method', ['cash', 'debit', 'credit', 'qris', 'transfer'])->default('cash');
            $table->decimal('paid_amount', 12, 2);
            $table->decimal('change_amount', 12, 2)->default(0);
            
            // Additional info
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled', 'refunded'])->default('pending');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
