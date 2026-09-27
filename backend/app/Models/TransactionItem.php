<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'item_type',
        'item_id',
        'item_name',
        'quantity',
        'unit_price',
        'discount_amount',
        'total_price',
        'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function item()
    {
        return $this->morphTo();
    }
}
