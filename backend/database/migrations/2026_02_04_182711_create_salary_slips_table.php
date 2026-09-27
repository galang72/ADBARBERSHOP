<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barber_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Periode
            $table->integer('year');
            $table->integer('month');
            $table->string('period_name'); // e.g., "Januari 2026"
            
            // Komponen Pendapatan
            $table->decimal('base_salary', 15, 2)->default(0); // Gaji pokok
            $table->decimal('commission_total', 15, 2)->default(0); // Total komisi
            $table->decimal('bonus', 15, 2)->default(0); // Bonus (opsional)
            $table->decimal('overtime', 15, 2)->default(0); // Lembur (opsional)
            
            // Komponen Potongan
            $table->decimal('deduction_late', 15, 2)->default(0); // Potongan telat
            $table->decimal('deduction_absence', 15, 2)->default(0); // Potongan absen
            $table->decimal('deduction_other', 15, 2)->default(0); // Potongan lain
            $table->text('deduction_note')->nullable(); // Keterangan potongan
            
            // Total
            $table->decimal('total_income', 15, 2)->default(0); // Total pendapatan
            $table->decimal('total_deduction', 15, 2)->default(0); // Total potongan
            $table->decimal('net_salary', 15, 2)->default(0); // Gaji bersih (take home)
            
            // Status
            $table->enum('status', ['draft', 'approved', 'paid'])->default('draft');
            $table->timestamp('paid_at')->nullable();
            $table->string('paid_by')->nullable();
            $table->text('note')->nullable();
            
            // Metadata
            $table->integer('total_customers')->default(0); // Jumlah pelanggan
            $table->integer('total_services')->default(0); // Jumlah layanan
            $table->decimal('total_transaction_amount', 15, 2)->default(0); // Total nilai transaksi
            
            $table->timestamps();
            
            // Unique constraint untuk mencegah duplikat slip gaji per barber per bulan
            $table->unique(['barber_id', 'year', 'month']);
            
            // Index untuk performa
            $table->index(['user_id', 'year', 'month']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_slips');
    }
};
