<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\OverheadCost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display the Profit & Loss (P&L) Statement.
     */
    public function pnl(Request $request): Response
    {
        if ($request->user()->isEmployee()) {
            abort(403, 'Unauthorized. Store employees cannot view Profit & Loss reports.');
        }

        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        // Default date range: current month start to end
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Fetch Sales in date range
        $sales = Sale::with('product')
            ->where('dokan_id', $dokanId)
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->get();

        // Fetch Overhead Costs in date range
        $overheadCosts = OverheadCost::where('dokan_id', $dokanId)
            ->whereBetween('cost_date', [$startDate, $endDate])
            ->get();

        // Calculate Core Financial Metrics
        $totalRevenue = $sales->sum(fn($s) => $s->total_amount);
        $totalCogs = $sales->sum(fn($s) => $s->qty * $s->cost_rate);
        $grossProfit = $totalRevenue - $totalCogs;
        $totalOverhead = $overheadCosts->sum('amount');
        $netProfit = $grossProfit - $totalOverhead;

        $grossMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0;
        $netMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;

        // Group Sales by Product for Product Profitability Breakdown
        $productPerformance = $sales->groupBy('product_id')->map(function ($group) {
            $first = $group->first();
            $productName = $first->product ? $first->product->name : 'Unknown Product';
            $packetsSold = $group->sum('qty');
            $revenue = $group->sum(fn($s) => $s->total_amount);
            $cost = $group->sum(fn($s) => $s->qty * $s->cost_rate);
            $profit = $revenue - $cost;
            $margin = $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0;

            return [
                'product_name' => $productName,
                'packets_sold' => $packetsSold,
                'revenue' => round($revenue, 2),
                'cost' => round($cost, 2),
                'profit' => round($profit, 2),
                'margin' => $margin,
            ];
        })->values();

        return Inertia::render('reports/pnl', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'totalRevenue' => round($totalRevenue, 2),
                'totalCogs' => round($totalCogs, 2),
                'grossProfit' => round($grossProfit, 2),
                'grossMargin' => $grossMargin,
                'totalOverhead' => round($totalOverhead, 2),
                'netProfit' => round($netProfit, 2),
                'netMargin' => $netMargin,
            ],
            'productPerformance' => $productPerformance,
            'overheadCosts' => $overheadCosts,
        ]);
    }
}
