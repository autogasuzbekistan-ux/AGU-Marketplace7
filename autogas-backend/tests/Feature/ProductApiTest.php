<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
 
class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Ochiq (public) mahsulot endpoint'larini test qilish
     */
    public function test_public_user_can_list_products(): void
    {
        // Arrange: Test uchun 5 ta mahsulot yaratamiz
        Product::factory()->count(5)->create();

        // Act: /api/products endpoint'iga GET so'rovini yuboramiz
        $response = $this->getJson('/api/products');

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200); // Javob statusi 200 (OK) ekanligini tekshirish
        $response->assertJsonStructure([ // Javobning JSON strukturasi to'g'riligini tekshirish
            'data' => [
                '*' => ['id', 'name', 'description', 'price', 'imageUrl', 'category', 'stockStatus']
            ],
            'links',
            'current_page',
            'total'
        ]);
        $response->assertJsonCount(5, 'data'); // `data` massivida 5 ta mahsulot borligini tekshirish
    }

    public function test_public_user_can_view_a_single_product(): void
    {
        // Arrange: Bitta mahsulot yaratamiz
        $product = Product::factory()->create();

        // Act: Yaratilgan mahsulotni olish uchun so'rov yuboramiz
        $response = $this->getJson('/api/products/' . $product->id);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $product->id); // Javobdagi ID to'g'riligini tekshirish
        $response->assertJsonPath('data.name', $product->name); // Javobdagi nom to'g'riligini tekshirish
    }
}