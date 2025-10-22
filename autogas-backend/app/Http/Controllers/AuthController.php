<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // 1. Kelgan ma'lumotlarni tekshirish (validation)
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 2. Foydalanuvchini autentifikatsiya qilishga urinish
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            // Agar email yoki parol noto'g'ri bo'lsa
            return response()->json([
                'message' => 'Email yoki parol noto\'g\'ri.',
            ], 401); // 401 Unauthorized xatolik kodi
        }

        // 3. Muvaffaqiyatli autentifikatsiya
        $user = $request->user();

        // Foydalanuvchi uchun yangi token yaratish
        $token = $user->createToken('auth-token')->plainTextToken;

        // 4. Frontend'ga javob qaytarish
        return response()->json([
            'message' => 'Tizimga muvaffaqiyatli kirdingiz!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Foydalanuvchi rolini ham yuboramiz
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 1. Kelgan ma'lumotlarni tekshirish (validation)
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // 2. Yangi foydalanuvchi yaratish
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'customer', // Standart rol 'customer'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Foydalanuvchi yaratishda xatolik yuz berdi.'], 500);
        }

        // 3. Muvaffaqiyatli javob qaytarish
        return response()->json([
            'message' => 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tkazildi!',
        ], 201); // 201 Created status kodi
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Foydalanuvchining joriy sessiyasi (token)ni bekor qilish
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Tizimdan muvaffaqiyatli chiqdingiz.'
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil muvaffaqiyatli yangilandi!',
            'user' => $user->only('id', 'name', 'email', 'role'),
        ]);
    }

    /**
     * Update the user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Joriy parol to'g'riligini tekshirish
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Joriy parol noto\'g\'ri.',
            ], 422); // Unprocessable Entity
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return response()->json([
            'message' => 'Parol muvaffaqiyatli o\'zgartirildi!',
        ]);
    }
}