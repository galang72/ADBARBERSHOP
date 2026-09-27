<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'gender',
        'birthdate',
        'address',
        'notes',
        'visit_count',
        'total_spent',
        'last_visit',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'last_visit' => 'datetime',
        'total_spent' => 'decimal:2',
    ];

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
}
