<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Barcha mahsulotlarni ko'rsatish (Pagination bilan)
     */
    public function index(): JsonResponse
    {
        $products = Product::orderBy('created_at', 'desc')->paginate(15);

        return response()->json($products);
    }

    /**
     * Bitta mahsulotni ko'rsatish
     */
    public function show($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'data' => $product
        ]);
    }

    /**
     * Yangi mahsulot yaratish
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'stockStatus' => 'nullable|in:in_stock,out_of_stock,low_stock',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Mahsulot muvaffaqiyatli yaratildi',
            'data' => $product
        ], 201);
    }

    /**
     * Mahsulotni yangilash
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'imageUrl' => 'nullable|string',
            'stockStatus' => 'nullable|in:in_stock,out_of_stock,low_stock',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Mahsulot muvaffaqiyatli yangilandi',
            'data' => $product
        ]);
    }

    /**
     * Mahsulotni o'chirish
     */
    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Mahsulot muvaffaqiyatli o\'chirildi'
        ]);
    }

    /**
     * Kategoriya bo'yicha filter
     */
    public function byCategory($category): JsonResponse
    {
        $products = Product::where('category', $category)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($products);
    }

    /**
     * Qidiruv
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');

        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('category', 'like', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($products);
    }
}