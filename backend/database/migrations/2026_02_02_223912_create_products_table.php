<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5); // Minimum stock alert
            $table->string('category')->default('general');
            $table->string('unit')->default('pcs'); // pieces, bottle, etc
            $table->string('photo')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
