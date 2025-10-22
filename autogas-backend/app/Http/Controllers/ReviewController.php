<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Get all reviews for a product
     * GET /api/products/{product}/reviews
     */
    public function index($productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $reviews = Review::where('product_id', $productId)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Create a new review
     * POST /api/products/{product}/reviews
     */
    public function store(Request $request, $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $user = $request->user();

        // Check if user already reviewed this product
        $existingReview = Review::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Siz allaqachon bu mahsulotga sharh qoldirgansiz.'
            ], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $review->load('user:id,name');

        return response()->json([
            'message' => 'Sharh muvaffaqiyatli qo\'shildi!',
            'review' => $review
        ], 201);
    }

    /**
     * Update a review
     * PUT /api/reviews/{review}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        // Check if user owns this review
        if ($review->user_id !== $user->id) {
            return response()->json([
                'message' => 'Sizda bu sharhni tahrirlash huquqi yo\'q.'
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Sharh yangilandi',
            'review' => $review
        ]);
    }

    /**
     * Delete a review
     * DELETE /api/reviews/{review}
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        // Check if user owns this review or is admin
        if ($review->user_id !== $user->id && !$user->hasRole(['owner', 'admin'])) {
            return response()->json([
                'message' => 'Sizda bu sharhni o\'chirish huquqi yo\'q.'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Sharh o\'chirildi'
        ]);
    }
}