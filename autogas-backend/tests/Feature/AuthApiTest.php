<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
 
class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Autentifikatsiya (Register, Login) endpoint'larini test qilish
     */
    public function test_user_can_register_with_valid_data(): void
    {
        // Arrange: Ro'yxatdan o'tish uchun to'g'ri ma'lumotlarni tayyorlaymiz
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+998901234567',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        // Act: /api/register endpoint'iga POST so'rovini yuboramiz
        $response = $this->postJson('/api/register', $userData);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(201); // Javob statusi 201 (Created) ekanligini tekshirish
        $response->assertJson(['message' => 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tkazildi!']);

        // Ma'lumotlar bazasida shu email bilan foydalanuvchi paydo bo'lganini tekshirish
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_user_cannot_register_with_invalid_data(): void
    {
        // Arrange: Parollar mos kelmaydigan noto'g'ri ma'lumotlar
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+998901234567',
            'password' => 'password',
            'password_confirmation' => 'wrong-password',
        ];

        // Act: /api/register endpoint'iga POST so'rovini yuboramiz
        $response = $this->postJson('/api/register', $userData);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(422); // 422 (Unprocessable Entity) validatsiya xatoligi
        $response->assertJsonValidationErrors('password'); // 'password' maydoni uchun xatolik borligini tekshirish
    }

    public function test_existing_user_can_login_with_correct_credentials(): void
    {
        // Arrange: Test uchun foydalanuvchi yaratamiz
        $user = User::factory()->create([
            'password' => bcrypt($password = 'i-love-laravel'),
        ]);

        // Act: /api/login endpoint'iga so'rov yuboramiz
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(200);
        $response->assertJsonStructure(['user', 'token']); // Javobda 'user' va 'token' borligini tekshirish
    }

    public function test_user_cannot_login_with_incorrect_credentials(): void
    {
        // Arrange: Test uchun foydalanuvchi yaratamiz
        $user = User::factory()->create();

        // Act: Noto'g'ri parol bilan so'rov yuboramiz
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        // Assert: Natijani tekshiramiz
        $response->assertStatus(401); // 401 (Unauthorized) xatolik kodi
    }
}