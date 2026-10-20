<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DepositController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Health Check ─────────────────────────────────────────────────
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    // ── Public Routes ────────────────────────────────────────────────
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show'])->where('slug', '[a-z0-9\-]+');

    Route::get('/settings/public', [SettingController::class, 'publicSettings']);
    Route::get('/founder', [SettingController::class, 'getFounder']);
    Route::get('/banners', [SettingController::class, 'getBanners']);

    // Public order & deposit
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}/track', [OrderController::class, 'track']);
    Route::post('/orders/{orderNumber}/deposits', [DepositController::class, 'storeByOrderNumber']);

    // ── Admin Auth ───────────────────────────────────────────────────
    Route::post('/admin/login', [AuthController::class, 'login']);

    // ── Admin Protected Routes ───────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);

        // Categories
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::get('/categories', [CategoryController::class, 'index']);

        // Products
        Route::apiResource('products', ProductController::class)->except(['show']);
        Route::get('/products/{product}', [ProductController::class, 'showById']);
        Route::patch('/products/{product}/stock', [ProductController::class, 'updateStock']);
        Route::delete('/product-images/{productImage}', [ProductController::class, 'deleteImage']);
        Route::post('/upload', [ProductController::class, 'uploadImage']);

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Orders
        Route::apiResource('orders', OrderController::class);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::patch('/orders/{order}/customs-fee', [OrderController::class, 'updateCustomsFee']);
        Route::get('/orders/{order}/contact-link', [OrderController::class, 'contactLink']);

        // Deposits
        Route::apiResource('deposits', DepositController::class)->only(['index', 'show', 'store']);
        Route::patch('/deposits/{deposit}/verify', [DepositController::class, 'verify']);

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index']);

        // Settings
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
        Route::get('/founder', [SettingController::class, 'getFounder']);
        Route::put('/founder', [SettingController::class, 'updateFounder']);
        Route::put('/banners', [SettingController::class, 'updateBanners']);
    });
});
