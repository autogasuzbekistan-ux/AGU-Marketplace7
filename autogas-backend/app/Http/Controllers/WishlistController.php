<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     * GET /api/wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with('product')
            ->get();

        // Return products array
        $products = $wishlistItems->map(function ($item) {
            return $item->product;
        });

        return response()->json($products);
    }

    /**
     * Add product to wishlist
     * POST /api/wishlist
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();

        // Check if already exists
        $exists = Wishlist::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Mahsulot allaqachon sevimlilarda.'
            ], 400);
        }

        // Add to wishlist
        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'message' => 'Mahsulot sevimlilarga qo\'shildi!'
        ], 201);
    }

    /**
     * Remove product from wishlist
     * DELETE /api/wishlist/{product_id}
     */
    public function destroy(Request $request, $productId): JsonResponse
    {
        $user = $request->user();

        $wishlistItem = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if (!$wishlistItem) {
            return response()->json([
                'message' => 'Mahsulot sevimlilarda topilmadi.'
            ], 404);
        }

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Mahsulot sevimlilardan o\'chirildi.'
        ]);
    }

    /**
     * Clear all wishlist items
     * DELETE /api/wishlist
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();

        Wishlist::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => 'Sevimlilar ro\'yxati tozalandi.'
        ]);
    }
}