<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // Haircut
            [
                'name' => 'Potong Rambut',
                'description' => 'Potong rambut standar dengan cuci',
                'price' => 35000,
                'duration_minutes' => 30,
                'category' => 'haircut',
                'icon' => 'scissors',
            ],
            [
                'name' => 'Potong Rambut Anak',
                'description' => 'Potong rambut untuk anak di bawah 12 tahun',
                'price' => 25000,
                'duration_minutes' => 20,
                'category' => 'haircut',
                'icon' => 'baby',
            ],
            [
                'name' => 'Potong + Cuci Blow',
                'description' => 'Paket lengkap potong, cuci, dan blow',
                'price' => 50000,
                'duration_minutes' => 45,
                'category' => 'haircut',
                'icon' => 'wind',
            ],
            // Shaving
            [
                'name' => 'Cukur Jenggot/Kumis',
                'description' => 'Penataan jenggot dan kumis',
                'price' => 20000,
                'duration_minutes' => 15,
                'category' => 'shaving',
                'icon' => 'razor',
            ],
            [
                'name' => 'Full Shaving',
                'description' => 'Cukur bersih dengan pisau klasik',
                'price' => 35000,
                'duration_minutes' => 25,
                'category' => 'shaving',
                'icon' => 'sparkles',
            ],
            // Treatment
            [
                'name' => 'Creambath',
                'description' => 'Perawatan rambut dengan creambath',
                'price' => 75000,
                'duration_minutes' => 60,
                'category' => 'treatment',
                'icon' => 'droplets',
            ],
            [
                'name' => 'Hair Coloring',
                'description' => 'Pewarnaan rambut',
                'price' => 150000,
                'duration_minutes' => 90,
                'category' => 'treatment',
                'icon' => 'palette',
            ],
            [
                'name' => 'Smoothing',
                'description' => 'Pelurusan rambut permanen',
                'price' => 200000,
                'duration_minutes' => 120,
                'category' => 'treatment',
                'icon' => 'align-center',
            ],
            // Premium
            [
                'name' => 'Paket Premium',
                'description' => 'Potong + Cuci + Shaving + Facial',
                'price' => 100000,
                'duration_minutes' => 75,
                'category' => 'premium',
                'icon' => 'crown',
            ],
            [
                'name' => 'Hair Tattoo',
                'description' => 'Ukiran rambut dengan motif',
                'price' => 50000,
                'duration_minutes' => 30,
                'category' => 'premium',
                'icon' => 'pen-tool',
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
