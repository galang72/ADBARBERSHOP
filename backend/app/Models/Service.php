<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'photo',
        'icon',
        'price',
        'duration_minutes',
        'category',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function transactionItems()
    {
        return $this->morphMany(TransactionItem::class, 'item');
    }
}
