<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'photo',
        'icon',
        'price',
        'cost_price',
        'stock',
        'min_stock',
        'category',
        'unit',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
    ];

    public function transactionItems()
    {
        return $this->morphMany(TransactionItem::class, 'item');
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }
}
