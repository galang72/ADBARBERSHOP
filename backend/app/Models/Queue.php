<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'barber_id',
        'customer_name',
        'queue_number',
        'status',
        'services',
        'notes',
        'called_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'services' => 'array',
        'called_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}
