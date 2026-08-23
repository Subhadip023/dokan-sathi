<?php

use App\Http\Controllers\DemoController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CoustomerController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\OverheadCostController;
use App\Http\Controllers\ReportController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::patch('/products/sync-quantity', [ProductController::class, 'syncQuantity'])->name('products.syncQuantity');
    Route::get('/price-list', [ProductController::class, 'priceList'])->name('products.price-list');
    Route::resource('products', ProductController::class);
    Route::resource('coustomers', CoustomerController::class);
    Route::resource('sales', SaleController::class);
    Route::resource('overhead-costs', OverheadCostController::class);
    Route::get('/reports/pnl', [ReportController::class, 'pnl'])->name('reports.pnl');
    Route::get('/seed-products', DemoController::class)->name('products.seed');
});

require __DIR__.'/auth.php';
