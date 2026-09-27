<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@barbershop.com',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Cashier
        User::create([
            'name' => 'Kasir Satu',
            'email' => 'kasir@barbershop.com',
            'phone' => '081234567891',
            'password' => Hash::make('password'),
            'role' => 'cashier',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Barber
        User::create([
            'name' => 'Barber Satu',
            'email' => 'barber@barbershop.com',
            'phone' => '081234567892',
            'password' => Hash::make('password'),
            'role' => 'barber',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}
