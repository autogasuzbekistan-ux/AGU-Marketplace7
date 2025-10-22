<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Product $product;

    /**
     * Savat (Cart) bilan bog'liq himoyalangan API endpoint'larini test qilish
     */

    // Har bir testdan oldin ishga tushadigan funksiya
    protected function setUp(): void
    {
        parent::setUp();
        // Test uchun oddiy foydalanuvchi yaratamiz
        $this->user = User::factory()->create();
        
        // Test uchun mahsulot yaratamiz
        $this->product = Product::factory()->create();
    }

    public function test_unauthenticated_user_cannot_access_cart_endpoints(): void
    {
        // Arrange: Tizimga kirmagan holda (Sanctum::actingAs ni chaqirmaymiz)

        // Act & Assert: Barcha savat yo'llariga so'rov yuborib, 401 (Unauthorized) statusini tekshiramiz
        $this->getJson('/api/cart')->assertUnauthorized();
        $this->postJson('/api/cart/items', ['product_id' => 1])->assertUnauthorized();
        $this->putJson('/api/cart/items/1', ['quantity' => 2])->assertUnauthorized();
        $this->deleteJson('/api/cart/items/1')->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_their_empty_cart(): void
    {
        // Arrange: Foydalanuvchini tizimga kiritamiz
        Sanctum::actingAs($this->user);

        // Act: Foydalanuvchining savatini olish uchun so'rov yuboramiz
        $response = $this->getJson('/api/cart');

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200);
        $response->assertJson(['items' => []]); // Yangi foydalanuvchining savati bo'sh bo'lishi kerak
    }

    public function test_authenticated_user_can_add_a_product_to_the_cart(): void
    {
        // Arrange: Foydalanuvchini tizimga kiritamiz
        Sanctum::actingAs($this->user);
        
        // Qo'shiladigan ma'lumotlar
        $cartData = ['product_id' => $this->product->id, 'quantity' => 2];

        // Act: Savatga mahsulot qo'shish uchun so'rov yuboramiz
        $response = $this->postJson('/api/cart/items', $cartData);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200); // Yoki 201 (Created)
        $response->assertJsonFragment(['product_id' => $this->product->id, 'quantity' => 2]);

        // Ma'lumotlar bazasida yozuv paydo bo'lganini tekshirish
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);
    }

    public function test_authenticated_user_can_update_item_quantity_in_cart(): void
    {
        // Arrange: Foydalanuvchini tizimga kiritamiz
        Sanctum::actingAs($this->user);
        
        // Avval mahsulotni savatga qo'shamiz
        $this->user->cartItems()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        // Act: Mahsulot sonini yangilash uchun so'rov yuboramiz
        $response = $this->putJson("/api/cart/items/{$this->product->id}", ['quantity' => 5]);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200);
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 5,
        ]);
    }

    public function test_authenticated_user_can_remove_an_item_from_cart(): void
    {
        // Arrange: Foydalanuvchini tizimga kiritamiz
        Sanctum::actingAs($this->user);
        
        // Avval mahsulotni savatga qo'shamiz
        $this->user->cartItems()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        // Act: Mahsulotni o'chirish uchun so'rov yuboramiz
        $response = $this->deleteJson("/api/cart/items/{$this->product->id}");

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);
    }
}