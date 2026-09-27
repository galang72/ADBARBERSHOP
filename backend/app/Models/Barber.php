<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barber extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'specialties',
        'photo',
        'status',
        'bio',
        'commission_rate',
        'salary',
    ];

    protected $casts = [
        'specialties' => 'array',
        'commission_rate' => 'decimal:2',
        'salary' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function queues()
    {
        return $this->hasMany(Queue::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function salarySlips()
    {
        return $this->hasMany(SalarySlip::class)->orderBy('year', 'desc')->orderBy('month', 'desc');
    }

    // Get today's queues
    public function todayQueues()
    {
        return $this->queues()->today();
    }

    // Get today's completed jobs
    public function todayCompleted()
    {
        return $this->queues()->today()->where('status', 'completed');
    }

    // Calculate commission from transactions
    public function calculateCommission($startDate = null, $endDate = null)
    {
        $query = $this->transactions()
            ->where('status', 'completed');
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            $query->today();
        }

        $totalSales = $query->sum('total_amount');
        return ($totalSales * $this->commission_rate) / 100;
    }
}
