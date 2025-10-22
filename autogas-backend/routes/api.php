<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Ochiq yo'llar (autentifikatsiyasiz) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Mahsulotlar uchun ochiq yo'llar
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

// --- Himoyalangan yo'llar (autentifikatsiya talab qilinadi) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Foydalanuvchi profili
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    
    // Foydalanuvchi buyurtmalari
    Route::get('/user/orders', [OrderController::class, 'listForUser']);

    // Savatcha (Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{product}', [CartController::class, 'update']);
    Route::delete('/cart/{product}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Wishlist (Sevimlilar)
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy']);
    Route::delete('/wishlist', [WishlistController::class, 'clear']);

    // Buyurtmalar
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    // Sharhlar
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    // --- OWNER yo'llari (faqat owner roli uchun) ---
    Route::middleware('role:owner')->prefix('owner')->group(function () {
        // Adminlarni boshqarish
        Route::get('/admins', [AdminController::class, 'getAdmins']);
        Route::post('/admins', [AdminController::class, 'createAdmin']);
        Route::put('/admins/{id}', [AdminController::class, 'updateAdmin']);
        Route::put('/admins/{id}/toggle', [AdminController::class, 'toggleAdminStatus']);
        Route::delete('/admins/{id}', [AdminController::class, 'deleteAdmin']);
        
        // Kontragentlarni ko'rish
        Route::get('/kontragents', [AdminController::class, 'getKontragents']);
        Route::get('/kontragents/{id}/sales', [AdminController::class, 'getKontragentSales']);
        
        // Dashboard statistikasi
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
        
        // Activity logs
        Route::get('/activities', [AdminController::class, 'getActivityLogs']);
    });

    // --- ADMIN yo'llari (owner va admin rollari uchun) ---
    Route::middleware('role:owner,admin')->prefix('admin')->group(function () {
        // Kontragentlarni boshqarish
        Route::get('/kontragents', [AdminController::class, 'getKontragents']);
        Route::post('/kontragents', [AdminController::class, 'createKontragent']);
        Route::put('/kontragents/{id}', [AdminController::class, 'updateKontragent']);
        Route::put('/kontragents/{id}/toggle', [AdminController::class, 'toggleKontragentStatus']);
        Route::get('/kontragents/{id}/sales', [AdminController::class, 'getKontragentSales']);
        
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
        
        // Mahsulotlarni boshqarish
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        
        // Buyurtmalarni boshqarish
        Route::get('/orders', [OrderController::class, 'index']);
        Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });

    // --- KONTRAGENT yo'llari (SOTUVCHILAR) ---
    Route::middleware('role:kontragent')->prefix('kontragent')->group(function () {
        // Dashboard va statistika
        Route::get('/dashboard', [AdminController::class, 'getKontragentDashboard']);
        
        // Buyurtmalar (sotuvlar)
        Route::get('/sales', [AdminController::class, 'getMySales']);
        
        // Mahsulot qo'shish (omborga)
        Route::post('/products', [AdminController::class, 'addProductToWarehouse']);
    });
});