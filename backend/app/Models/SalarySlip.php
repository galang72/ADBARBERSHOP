<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalarySlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'barber_id',
        'user_id',
        'year',
        'month',
        'period_name',
        'base_salary',
        'commission_total',
        'bonus',
        'overtime',
        'deduction_late',
        'deduction_absence',
        'deduction_other',
        'deduction_note',
        'total_income',
        'total_deduction',
        'net_salary',
        'status',
        'paid_at',
        'paid_by',
        'note',
        'total_customers',
        'total_services',
        'total_transaction_amount',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'commission_total' => 'decimal:2',
        'bonus' => 'decimal:2',
        'overtime' => 'decimal:2',
        'deduction_late' => 'decimal:2',
        'deduction_absence' => 'decimal:2',
        'deduction_other' => 'decimal:2',
        'total_income' => 'decimal:2',
        'total_deduction' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'total_transaction_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // Relationships
    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForPeriod($query, $year, $month)
    {
        return $query->where('year', $year)->where('month', $month);
    }

    public function scopeForBarber($query, $barberId)
    {
        return $query->where('barber_id', $barberId);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Accessors
    public function getFormattedNetSalaryAttribute()
    {
        return 'Rp ' . number_format($this->net_salary, 0, ',', '.');
    }

    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'draft' => ['label' => 'Draft', 'color' => 'gray'],
            'approved' => ['label' => 'Disetujui', 'color' => 'blue'],
            'paid' => ['label' => 'Dibayar', 'color' => 'green'],
            default => ['label' => $this->status, 'color' => 'gray'],
        };
    }
}
