<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 2 ta Owner yaratish
        $owners = [
            [
                'name' => 'Asosiy Owner',
                'email' => 'owner1@autogas.uz',
                'phone' => '+998901111111',
                'password' => Hash::make('owner123'),
                'role' => 'owner',
                'is_active' => true,
            ],
            [
                'name' => 'Ikkinchi Owner',
                'email' => 'owner2@autogas.uz',
                'phone' => '+998901111112',
                'password' => Hash::make('owner123'),
                'role' => 'owner',
                'is_active' => true,
            ],
        ];

        foreach ($owners as $owner) {
            User::create($owner);
        }

        // 5 ta Admin yaratish
        $admins = [
            [
                'name' => 'Admin Toshkent',
                'email' => 'admin1@autogas.uz',
                'phone' => '+998901112221',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Samarqand',
                'email' => 'admin2@autogas.uz',
                'phone' => '+998901112222',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Buxoro',
                'email' => 'admin3@autogas.uz',
                'phone' => '+998901112223',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Farg\'ona',
                'email' => 'admin4@autogas.uz',
                'phone' => '+998901112224',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Andijon',
                'email' => 'admin5@autogas.uz',
                'phone' => '+998901112225',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ],
        ];

        foreach ($admins as $admin) {
            User::create($admin);
        }

        // 12 viloyat uchun kontragentlar yaratish
        $regions = [
            ['name' => 'Toshkent', 'code' => 'TAS'],
            ['name' => 'Samarqand', 'code' => 'SAM'],
            ['name' => 'Buxoro', 'code' => 'BUX'],
            ['name' => 'Andijon', 'code' => 'AND'],
            ['name' => 'Farg\'ona', 'code' => 'FAR'],
            ['name' => 'Namangan', 'code' => 'NAM'],
            ['name' => 'Qashqadaryo', 'code' => 'QAS'],
            ['name' => 'Surxondaryo', 'code' => 'SUR'],
            ['name' => 'Jizzax', 'code' => 'JIZ'],
            ['name' => 'Sirdaryo', 'code' => 'SIR'],
            ['name' => 'Xorazm', 'code' => 'XOR'],
            ['name' => 'Navoiy', 'code' => 'NAV'],
        ];

        foreach ($regions as $index => $region) {
            User::create([
                'name' => $region['name'] . ' Magazin',
                'email' => strtolower($region['code']) . '@magazin.uz',
                'phone' => '+998902' . str_pad($index + 1, 7, '0', STR_PAD_LEFT),
                'password' => Hash::make('magazin123'),
                'role' => 'kontragent',
                'region' => $region['name'],
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Seeder muvaffaqiyatli bajarildi!');
        $this->command->info('📊 Yaratilgan foydalanuvchilar:');
        $this->command->info('   - 2 ta Owner (owner1@autogas.uz, owner2@autogas.uz)');
        $this->command->info('   - 5 ta Admin (admin1@autogas.uz ... admin5@autogas.uz)');
        $this->command->info('   - 12 ta Kontragent (tas@magazin.uz ... nav@magazin.uz)');
        $this->command->info('🔐 Parol: owner123 / admin123 / magazin123');
    }
}