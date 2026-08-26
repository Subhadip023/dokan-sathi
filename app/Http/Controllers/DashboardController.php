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
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        if (!$dokanId) {
            return Inertia::render('Dashboard', [
                'totalProducts' => 0,
                'lowStock' => 0,
                'lowStockProducts' => [],
                'totalValue' => 0,
            ]);
        }

        $totalProducts = Product::where('dokan_id', $dokanId)->count();

        $lowStock = Product::where('dokan_id', $dokanId)
            ->whereColumn('purchased_packets', '<=', 'reorder_level')
            ->get();

        $lowStockCount = $lowStock->count();    

        $totalValue = Product::where('dokan_id', $dokanId)
            ->sum(DB::raw('purchased_packets * packet_size * selling_rate'));

        return Inertia::render('Dashboard', [
            'totalProducts' => $totalProducts,
            'lowStock' => $lowStockCount,
            'lowStockProducts' => $lowStock,
            'totalValue' => $totalValue,
        ]);
    }
}
