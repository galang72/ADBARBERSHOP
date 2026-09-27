<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'user_id',
        'barber_id',
        'queue_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'payment_method',
        'paid_amount',
        'change_amount',
        'notes',
        'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function queue()
    {
        return $this->belongsTo(Queue::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->invoice_number)) {
                // Get today's transaction count + 1 for unique invoice
                $todayCount = static::whereDate('created_at', today())->count() + 1;
                $transaction->invoice_number = 'INV-' . now()->format('Ymd') . '-' . str_pad($todayCount, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
