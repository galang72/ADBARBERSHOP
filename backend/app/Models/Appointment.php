<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'barber_id',
        'customer_name',
        'customer_phone',
        'appointment_date',
        'appointment_time',
        'services',
        'notes',
        'reminder_minutes',
        'status',
        'reminded_at',
    ];

    protected $casts = [
        'services' => 'array',
        'appointment_date' => 'date',
        'reminded_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', today())
                     ->whereIn('status', ['pending', 'confirmed'])
                     ->where('status', '!=', 'cancelled');
    }
}
