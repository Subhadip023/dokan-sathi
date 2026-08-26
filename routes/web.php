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
use App\Http\Controllers\DokanController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\InvestmentController;

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
    
    Route::get('/dokan/settings', [DokanController::class, 'edit'])->name('dokan.edit');
    Route::patch('/dokan/settings', [DokanController::class, 'update'])->name('dokan.update');

    Route::patch('/products/sync-quantity', [ProductController::class, 'syncQuantity'])->name('products.syncQuantity');
    Route::get('/price-list', [ProductController::class, 'priceList'])->name('products.price-list');
    Route::resource('products', ProductController::class);
    Route::resource('coustomers', CoustomerController::class);
    Route::resource('sales', SaleController::class);
    Route::resource('overhead-costs', OverheadCostController::class);
    Route::resource('staff', StaffController::class);
    Route::resource('investments', InvestmentController::class)->except(['create', 'edit', 'show']);
    Route::get('/reports/pnl', [ReportController::class, 'pnl'])->name('reports.pnl');
    Route::get('/seed-products', DemoController::class)->name('products.seed');
});

// Public store selling price catalog routes
Route::get('/{dokan:slug}/price-list', [ProductController::class, 'publicPriceList'])->name('dokans.price-list');
Route::get('/{dokan:slug}/price-list/pdf', [ProductController::class, 'downloadPdf'])->name('dokans.price-list.pdf');

require __DIR__.'/auth.php';
