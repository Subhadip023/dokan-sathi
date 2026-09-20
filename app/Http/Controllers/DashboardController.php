<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Sale;
use Carbon\Carbon;
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
        $user = $request->user();
        $isEmployee = $user->isEmployee();

        $dokan = $user->currentDokan();
        $dokanId = $dokan?->id;

        if (!$dokanId) {
            return Inertia::render('Dashboard', [
                'totalProducts' => 0,
                'lowStock' => 0,
                'lowStockProducts' => [],
                'totalValue' => 0,
                'salesChartData' => [
                    'last7Days' => [],
                    'last30Days' => [],
                    'last12Months' => [],
                ],
            ]);
        }

        $totalProducts = Product::where('dokan_id', $dokanId)->count();

        $lowStock = Product::where('dokan_id', $dokanId)
            ->whereColumn('purchased_packets', '<=', 'reorder_level')
            ->latest()
            ->get();

        if ($isEmployee) {
            $lowStock->transform(function ($product) {
                unset($product->cost_rate);

                return $product;
            });
        }

        $lowStockCount = $lowStock->count();    

        $totalValue = Product::where('dokan_id', $dokanId)
            ->sum(DB::raw('purchased_packets * selling_rate'));

        // 1. Daily sales aggregation for the last 30 days
        $start30Days = Carbon::today()->subDays(29)->toDateString();
        $today = Carbon::today()->toDateString();

        $dailySales = Sale::where('dokan_id', $dokanId)
            ->whereBetween('sale_date', [$start30Days, $today])
            ->get();

        $dailyGrouped = $dailySales->groupBy('sale_date');

        $last30Days = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateObj = Carbon::today()->subDays($i);
            $dateStr = $dateObj->toDateString();
            $group = $dailyGrouped->get($dateStr, collect());

            $rev = $group->sum(fn($s) => $s->total_amount);
            $pkts = $group->sum('qty');
            $pcs = $group->sum(fn($s) => $s->qty * $s->packet_size);
            $profit = $isEmployee ? null : $group->sum(fn($s) => $s->profit);

            $last30Days[] = [
                'date' => $dateStr,
                'label' => $dateObj->format('d M'),
                'short_label' => $dateObj->format('d'),
                'revenue' => round($rev, 2),
                'packets' => (int) $pkts,
                'pieces' => (int) $pcs,
                'profit' => $profit !== null ? round($profit, 2) : null,
                'invoices_count' => $group->groupBy(function ($sale) {
                    $cust = $sale->customer_id ?? 'walkin';
                    $time = $sale->created_at ? $sale->created_at->format('Y-m-d H:i') : $sale->sale_date;
                    return "{$sale->sale_date}_{$cust}_{$time}";
                })->count(),
            ];
        }

        // 2. Monthly sales aggregation for the last 12 months
        $start12Months = Carbon::today()->subMonths(11)->startOfMonth()->toDateString();

        $monthlySales = Sale::where('dokan_id', $dokanId)
            ->whereBetween('sale_date', [$start12Months, $today])
            ->get();

        $monthlyGrouped = $monthlySales->groupBy(function ($s) {
            return Carbon::parse($s->sale_date)->format('Y-m');
        });

        $last12Months = [];
        for ($i = 11; $i >= 0; $i--) {
            $mObj = Carbon::today()->subMonths($i);
            $key = $mObj->format('Y-m');
            $group = $monthlyGrouped->get($key, collect());

            $rev = $group->sum(fn($s) => $s->total_amount);
            $pkts = $group->sum('qty');
            $pcs = $group->sum(fn($s) => $s->qty * $s->packet_size);
            $profit = $isEmployee ? null : $group->sum(fn($s) => $s->profit);

            $last12Months[] = [
                'date' => $key,
                'label' => $mObj->format('M Y'),
                'short_label' => $mObj->format('M'),
                'revenue' => round($rev, 2),
                'packets' => (int) $pkts,
                'pieces' => (int) $pcs,
                'profit' => $profit !== null ? round($profit, 2) : null,
                'invoices_count' => $group->groupBy(function ($sale) {
                    $cust = $sale->customer_id ?? 'walkin';
                    $time = $sale->created_at ? $sale->created_at->format('Y-m-d H:i') : $sale->sale_date;
                    return "{$sale->sale_date}_{$cust}_{$time}";
                })->count(),
            ];
        }

        $salesChartData = [
            'last7Days' => array_slice($last30Days, -7),
            'last30Days' => $last30Days,
            'last12Months' => $last12Months,
        ];

        return Inertia::render('Dashboard', [
            'totalProducts' => $totalProducts,
            'lowStock' => $lowStockCount,
            'lowStockProducts' => $lowStock,
            'totalValue' => $totalValue,
            'salesChartData' => $salesChartData,
        ]);
    }
}
