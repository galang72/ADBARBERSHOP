<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            [
                'key' => 'shop_name',
                'value' => 'BarberShop Pro',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Nama Toko',
                'description' => 'Nama barbershop yang akan ditampilkan',
            ],
            [
                'key' => 'shop_address',
                'value' => 'Jl. Raya No. 123, Jakarta',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Alamat Toko',
                'description' => 'Alamat lengkap barbershop',
            ],
            [
                'key' => 'shop_phone',
                'value' => '021-1234567',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Telepon Toko',
                'description' => 'Nomor telepon barbershop',
            ],
            [
                'key' => 'queue_prefix',
                'value' => 'A',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Prefix Nomor Antrian',
                'description' => 'Awalan untuk nomor antrian (contoh: A001)',
            ],
            // Payment
            [
                'key' => 'tax_rate',
                'value' => '0',
                'type' => 'number',
                'group' => 'payment',
                'label' => 'Pajak (%)',
                'description' => 'Persentase pajak yang diterapkan',
            ],
            [
                'key' => 'enable_tax',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'payment',
                'label' => 'Aktifkan Pajak',
                'description' => 'Nyalakan/mematikan perhitungan pajak',
            ],
            [
                'key' => 'currency',
                'value' => 'IDR',
                'type' => 'string',
                'group' => 'payment',
                'label' => 'Mata Uang',
                'description' => 'Kode mata uang',
            ],
            // Business Hours
            [
                'key' => 'opening_time',
                'value' => '09:00',
                'type' => 'string',
                'group' => 'business_hours',
                'label' => 'Jam Buka',
                'description' => 'Jam buka barbershop',
            ],
            [
                'key' => 'closing_time',
                'value' => '21:00',
                'type' => 'string',
                'group' => 'business_hours',
                'label' => 'Jam Tutup',
                'description' => 'Jam tutup barbershop',
            ],
            [
                'key' => 'appointment_interval',
                'value' => '30',
                'type' => 'number',
                'group' => 'business_hours',
                'label' => 'Interval Booking (menit)',
                'description' => 'Jarak waktu antar slot booking',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
