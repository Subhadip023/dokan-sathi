<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $dokan = $request->user()->dokans()->first();
        $totalProducts = Product::where('dokan_id', $dokan->id)->count();

        $lowStock = Product::where('dokan_id', $dokan->id)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->get();

        $lowStockCount = $lowStock->count();    

        $totalValue = Product::where('dokan_id', $dokan->id)
            ->sum(DB::raw('quantity * price'));

        return Inertia::render('Dashboard', [
            'totalProducts' => $totalProducts,
            'lowStock' => $lowStockCount,
            'lowStockProducts' => $lowStock,
            'totalValue' => $totalValue,
        ]);
    }
}
