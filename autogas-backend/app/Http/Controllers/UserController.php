<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Update user profile
     * PUT /api/user/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'phone' => 'required|string|max:20',
        ]);

        $user->update($validated);

        // Log activity
        $user->logActivity('updated_profile', [
            'model_type' => 'User',
            'model_id' => $user->id,
            'changes' => $validated
        ]);

        return response()->json([
            'message' => 'Profil muvaffaqiyatli yangilandi!',
            'user' => $user->only('id', 'name', 'email', 'phone', 'role')
        ]);
    }

    /**
     * Update user password
     * PUT /api/user/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Joriy parol noto\'g\'ri.',
                'errors' => [
                    'current_password' => ['Joriy parol noto\'g\'ri.']
                ]
            ], 422);
        }

        // Update password
        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        // Log activity
        $user->logActivity('changed_password', [
            'model_type' => 'User',
            'model_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Parol muvaffaqiyatli o\'zgartirildi!'
        ]);
    }

    /**
     * Get user profile with statistics
     * GET /api/user/profile
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $user->load([
            'activities' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        $stats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->where('status', 'delivered')->count(),
            'total_spent' => $user->orders()
                ->where('status', 'delivered')
                ->sum('total_price'),
        ];

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'phone', 'role', 'region'),
            'stats' => $stats,
            'recent_activities' => $user->activities
        ]);
    }

    /**
     * Delete user account
     * DELETE /api/user/account
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'password' => 'required|string',
        ]);

        // Verify password
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Parol noto\'g\'ri.',
                'errors' => [
                    'password' => ['Parol noto\'g\'ri.']
                ]
            ], 422);
        }

        // Log before deletion
        $user->logActivity('deleted_account', [
            'model_type' => 'User',
            'model_id' => $user->id,
        ]);

        // Delete all user tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();

        return response()->json([
            'message' => 'Akkaunt muvaffaqiyatli o\'chirildi.'
        ]);
    }
}