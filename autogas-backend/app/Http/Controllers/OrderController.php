<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get all orders (Admin only)
     * GET /api/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user:id,name,email', 'items.product'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }

        $orders = $query->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * Get user's orders
     * GET /api/user/orders
     */
    public function listForUser(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Create new order
     * POST /api/orders
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'region' => 'required|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            // Calculate total price
            $totalPrice = 0;
            foreach ($validated['items'] as $item) {
                $totalPrice += $item['price'] * $item['quantity'];
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'address' => $validated['address'],
                'region' => $validated['region'],
                'total_price' => $totalPrice,
                'status' => 'new',
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            // Clear user's cart
            CartItem::where('user_id', $user->id)->delete();

            // Log activity
            $user->logActivity('created_order', [
                'model_type' => 'Order',
                'model_id' => $order->id,
                'changes' => [
                    'total_price' => $totalPrice,
                    'items_count' => count($validated['items'])
                ]
            ]);

            DB::commit();

            // Load order with items
            $order->load('items.product');

            return response()->json([
                'message' => 'Buyurtma muvaffaqiyatli yaratildi!',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Buyurtma yaratishda xatolik yuz berdi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single order
     * GET /api/orders/{order}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $order = Order::with('items.product')->findOrFail($id);

        // Check if user owns this order (unless admin/owner)
        if (!$user->hasRole(['owner', 'admin']) && $order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Sizda bu buyurtmani ko\'rish huquqi yo\'q.'
            ], 403);
        }

        return response()->json($order);
    }

    /**
     * Update order status (Admin only)
     * PUT /api/admin/orders/{order}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        
        $order->status = $validated['status'];
        $order->save();

        // Log activity
        $request->user()->logActivity('updated_order_status', [
            'model_type' => 'Order',
            'model_id' => $order->id,
            'changes' => [
                'old_status' => $oldStatus,
                'new_status' => $validated['status']
            ]
        ]);

        return response()->json([
            'message' => 'Buyurtma holati yangilandi',
            'order' => $order
        ]);
    }

    /**
     * Cancel order
     * POST /api/orders/{order}/cancel
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        // Check if user owns this order
        if ($order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Sizda bu buyurtmani bekor qilish huquqi yo\'q.'
            ], 403);
        }

        // Check if order can be cancelled
        if (in_array($order->status, ['delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'Bu buyurtmani bekor qilish mumkin emas.'
            ], 400);
        }

        $order->status = 'cancelled';
        $order->save();

        // Log activity
        $user->logActivity('cancelled_order', [
            'model_type' => 'Order',
            'model_id' => $order->id,
        ]);

        return response()->json([
            'message' => 'Buyurtma bekor qilindi',
            'order' => $order
        ]);
    }
}