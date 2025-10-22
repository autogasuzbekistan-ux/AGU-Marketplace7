<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    /**
     * Foydalanuvchining savatini ko'rsatish
     * GET /api/cart
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $cartItems = CartItem::where('user_id', $user->id)
            ->with('product')
            ->get();

        $items = $cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $item->product,
                'quantity' => $item->quantity,
                'total_price' => $item->quantity * $item->product->price,
            ];
        });

        $total = $items->sum('total_price');

        return response()->json([
            'items' => $items,
            'total' => $total,
        ]);
    }

    /**
     * Savatga mahsulot qo'shish
     * POST /api/cart
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $user = $request->user();
        $quantity = $validated['quantity'] ?? 1;

        // Check product stock
        $product = Product::findOrFail($validated['product_id']);
        if ($product->stockStatus === 'out_of_stock') {
            return response()->json([
                'message' => 'Mahsulot stokda yo\'q'
            ], 400);
        }

        // Agar mahsulot allaqachon savatda bo'lsa, miqdorni oshirish
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'quantity' => $quantity,
            ]);
        }

        // Return full cart
        return $this->index($request);
    }

    /**
     * Savat elementini yangilash
     * PUT /api/cart/{product_id}
     */
    public function update(Request $request, $productId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        // Return full cart
        return $this->index($request);
    }

    /**
     * Savat elementini o'chirish
     * DELETE /api/cart/{product_id}
     */
    public function destroy(Request $request, $productId): JsonResponse
    {
        $user = $request->user();

        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $cartItem->delete();

        // Return full cart
        return $this->index($request);
    }

    /**
     * Butun savatni tozalash
     * DELETE /api/cart
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();

        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'items' => [],
            'total' => 0,
            'message' => 'Savat tozalandi'
        ]);
    }
}