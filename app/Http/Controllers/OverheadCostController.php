<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOverheadCostRequest;
use App\Http\Requests\UpdateOverheadCostRequest;
use App\Models\OverheadCost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverheadCostController extends Controller
{
    /**
     * Display a listing of the overhead costs.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->dokans()->first();

        $query = OverheadCost::where('dokan_id', $dokan?->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('cost_date', 'like', "%{$search}%")
                  ->orWhere('amount', 'like', "%{$search}%");
            });
        }

        $overheadCosts = $query->latest('cost_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $allCosts = OverheadCost::where('dokan_id', $dokan?->id)->get();
        $totalOverheadCost = $allCosts->sum('amount');
        $totalCount = $allCosts->count();

        return Inertia::render('overhead-cost/index', [
            'overheadCosts' => $overheadCosts,
            'summary' => [
                'totalCost' => round($totalOverheadCost, 2),
                'totalCount' => $totalCount,
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created overhead cost in storage.
     */
    public function store(StoreOverheadCostRequest $request)
    {
        $dokan = $request->user()->dokans()->first();

        OverheadCost::create([
            'dokan_id' => $dokan->id,
            'cost_date' => $request->cost_date,
            'description' => $request->description,
            'amount' => $request->amount,
        ]);

        return redirect()->route('overhead-costs.index')->with('success', 'Overhead cost recorded successfully.');
    }

    /**
     * Update the specified overhead cost in storage.
     */
    public function update(UpdateOverheadCostRequest $request, OverheadCost $overheadCost)
    {
        $dokan = $request->user()->dokans()->first();
        if ($overheadCost->dokan_id !== $dokan?->id) {
            abort(403);
        }

        $overheadCost->update([
            'cost_date' => $request->cost_date,
            'description' => $request->description,
            'amount' => $request->amount,
        ]);

        return redirect()->route('overhead-costs.index')->with('success', 'Overhead cost updated successfully.');
    }

    /**
     * Remove the specified overhead cost from storage.
     */
    public function destroy(Request $request, OverheadCost $overheadCost)
    {
        $dokan = $request->user()->dokans()->first();
        if ($overheadCost->dokan_id !== $dokan?->id) {
            abort(403);
        }

        $overheadCost->delete();

        return redirect()->route('overhead-costs.index')->with('success', 'Overhead cost deleted successfully.');
    }
}
