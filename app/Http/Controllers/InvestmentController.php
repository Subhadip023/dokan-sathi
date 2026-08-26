<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\UpdateInvestmentRequest;
use App\Models\Investment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestmentController extends Controller
{
    /**
     * Display a listing of investments.
     */
    public function index(Request $request): Response
    {
        if ($request->user()->isEmployee()) {
            abort(403, 'Unauthorized. Staff members cannot access capital investment records.');
        }

        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        $query = Investment::with(['addedBy:id,name', 'editedBy:id,name'])
            ->where('dokan_id', $dokanId);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('investor_name', 'like', "%{$search}%")
                  ->orWhere('payment_method', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%");
            });
        }

        $investments = (clone $query)->latest('investment_date')->latest('id')->paginate(15)->withQueryString();

        // Calculate summary statistics for current Dokan
        $allInvestments = Investment::where('dokan_id', $dokanId);
        $totalCapital = round($allInvestments->sum('amount'), 2);
        $investorsCount = $allInvestments->distinct('investor_name')->count('investor_name');
        $averageInvestment = $investorsCount > 0 ? round($totalCapital / $investorsCount, 2) : 0;

        return Inertia::render('investments/index', [
            'investments' => $investments,
            'summary' => [
                'totalCapital' => $totalCapital,
                'investorsCount' => $investorsCount,
                'averageInvestment' => $averageInvestment,
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created investment in storage.
     */
    public function store(StoreInvestmentRequest $request)
    {
        $data = $request->validated();
        $data['added_by'] = $request->user()->id;
        $data['edited_by'] = $request->user()->id;

        Investment::create($data);

        return redirect()->route('investments.index')->with('success', 'Capital investment recorded successfully.');
    }

    /**
     * Update the specified investment in storage.
     */
    public function update(UpdateInvestmentRequest $request, Investment $investment)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $investment->dokan_id !== $dokan->id) {
            abort(403);
        }

        $data = $request->validated();
        $data['edited_by'] = $request->user()->id;

        $investment->update($data);

        return redirect()->route('investments.index')->with('success', 'Capital investment record updated successfully.');
    }

    /**
     * Remove the specified investment from storage.
     */
    public function destroy(Request $request, Investment $investment)
    {
        if ($request->user()->isEmployee()) {
            abort(403);
        }

        $dokan = $request->user()->currentDokan();
        if (!$dokan || $investment->dokan_id !== $dokan->id) {
            abort(403);
        }

        $investment->delete();

        return redirect()->route('investments.index')->with('success', 'Investment record deleted successfully.');
    }
}
