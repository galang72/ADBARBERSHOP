<?php

namespace Database\Seeders;

use App\Models\Barber;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        $barbers = [
            [
                'name' => 'Ahmad Rizky',
                'phone' => '081234567801',
                'email' => 'ahmad.rizky@barbershop.com',
                'specialties' => ['Potong Rambut', 'Cuci Blow', 'Coloring'],
                'bio' => 'Spesialis potong rambut modern dengan pengalaman 5 tahun',
                'status' => 'active',
                'commission_rate' => 35,
                'salary' => 2500000,
            ],
            [
                'name' => 'Budi Santoso',
                'phone' => '081234567802',
                'email' => 'budi.santoso@barbershop.com',
                'specialties' => ['Shaving', 'Hair Tattoo', 'Perm'],
                'bio' => 'Ahli dalam shaving tradisional dan hair tattoo',
                'status' => 'active',
                'commission_rate' => 35,
                'salary' => 2500000,
            ],
            [
                'name' => 'Candra Wijaya',
                'phone' => '081234567803',
                'email' => 'candra.wijaya@barbershop.com',
                'specialties' => ['Potong Rambut Anak', 'Creambath', 'Smoothing'],
                'bio' => 'Ramah dengan anak-anak, spesialis potong rambut keluarga',
                'status' => 'active',
                'commission_rate' => 30,
                'salary' => 2200000,
            ],
            [
                'name' => 'Dedi Kurniawan',
                'phone' => '081234567804',
                'email' => 'dedi.kurniawan@barbershop.com',
                'specialties' => ['Potong Rambut', 'Shaving', 'Facial'],
                'bio' => 'All-rounder dengan pelayanan terbaik',
                'status' => 'active',
                'commission_rate' => 30,
                'salary' => 2200000,
            ],
        ];

        foreach ($barbers as $barberData) {
            // Create user first
            $user = User::create([
                'name' => $barberData['name'],
                'email' => $barberData['email'],
                'phone' => $barberData['phone'],
                'password' => Hash::make('password'),
                'role' => 'barber',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            // Create barber with user_id
            Barber::create([
                'user_id' => $user->id,
                'name' => $barberData['name'],
                'phone' => $barberData['phone'],
                'email' => $barberData['email'],
                'specialties' => $barberData['specialties'],
                'bio' => $barberData['bio'],
                'status' => $barberData['status'],
                'commission_rate' => $barberData['commission_rate'],
                'salary' => $barberData['salary'],
            ]);
        }
    }
}
