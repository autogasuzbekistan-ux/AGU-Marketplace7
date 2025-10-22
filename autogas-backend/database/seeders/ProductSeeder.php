<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Jadvalni eski ma'lumotlardan tozalash
        Product::query()->delete();
        
        // Namunaviy mahsulotlarni fabrika yordamida yaratish
        // Bu yerda 50 ta tasodifiy mahsulot yaratiladi.
        // ProductFactory.php fayli mavjud bo'lishi kerak.
        Product::factory()->count(50)->create();
    }
}
