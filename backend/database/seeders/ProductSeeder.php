<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Pomade
            [
                'name' => 'Pomade Waterbased',
                'sku' => 'POM-001',
                'description' => 'Pomade berbasis air, mudah dicuci',
                'price' => 75000,
                'cost_price' => 45000,
                'stock' => 20,
                'min_stock' => 5,
                'category' => 'pomade',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Pomade Oilbased',
                'sku' => 'POM-002',
                'description' => 'Pomade oilbased hold kuat',
                'price' => 85000,
                'cost_price' => 50000,
                'stock' => 15,
                'min_stock' => 5,
                'category' => 'pomade',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Clay Pomade',
                'sku' => 'POM-003',
                'description' => 'Pomade clay matte finish',
                'price' => 95000,
                'cost_price' => 55000,
                'stock' => 10,
                'min_stock' => 3,
                'category' => 'pomade',
                'unit' => 'pcs',
            ],
            // Hair Care
            [
                'name' => 'Shampoo Pria',
                'sku' => 'HC-001',
                'description' => 'Shampoo khusus rambut pria',
                'price' => 65000,
                'cost_price' => 40000,
                'stock' => 25,
                'min_stock' => 5,
                'category' => 'haircare',
                'unit' => 'bottle',
            ],
            [
                'name' => 'Hair Tonic',
                'sku' => 'HC-002',
                'description' => 'Tonic penumbuh rambut',
                'price' => 55000,
                'cost_price' => 32000,
                'stock' => 18,
                'min_stock' => 5,
                'category' => 'haircare',
                'unit' => 'bottle',
            ],
            [
                'name' => 'Hair Vitamin',
                'sku' => 'HC-003',
                'description' => 'Vitamin rambut spray',
                'price' => 45000,
                'cost_price' => 25000,
                'stock' => 30,
                'min_stock' => 10,
                'category' => 'haircare',
                'unit' => 'bottle',
            ],
            // Aksesoris
            [
                'name' => 'Sisir Saku',
                'sku' => 'ACC-001',
                'description' => 'Sisir saku portable',
                'price' => 25000,
                'cost_price' => 12000,
                'stock' => 50,
                'min_stock' => 10,
                'category' => 'accessories',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Sisir Rambut',
                'sku' => 'ACC-002',
                'description' => 'Sisir rambut standar',
                'price' => 15000,
                'cost_price' => 7000,
                'stock' => 40,
                'min_stock' => 10,
                'category' => 'accessories',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Handuk Kecil',
                'sku' => 'ACC-003',
                'description' => 'Handuk muka ukuran kecil',
                'price' => 35000,
                'cost_price' => 20000,
                'stock' => 20,
                'min_stock' => 5,
                'category' => 'accessories',
                'unit' => 'pcs',
            ],
            // Minuman
            [
                'name' => 'Kopi Hitam',
                'sku' => 'DRK-001',
                'description' => 'Kopi hitam hangat',
                'price' => 15000,
                'cost_price' => 5000,
                'stock' => 100,
                'min_stock' => 20,
                'category' => 'drink',
                'unit' => 'cup',
            ],
            [
                'name' => 'Teh Manis',
                'sku' => 'DRK-002',
                'description' => 'Teh manis dingin',
                'price' => 10000,
                'cost_price' => 3000,
                'stock' => 100,
                'min_stock' => 20,
                'category' => 'drink',
                'unit' => 'cup',
            ],
            [
                'name' => 'Air Mineral',
                'sku' => 'DRK-003',
                'description' => 'Air mineral 600ml',
                'price' => 8000,
                'cost_price' => 4000,
                'stock' => 100,
                'min_stock' => 20,
                'category' => 'drink',
                'unit' => 'bottle',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
