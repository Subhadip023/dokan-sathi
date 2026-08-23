<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCoustomerRequest;
use App\Http\Requests\UpdateCoustomerRequest;
use App\Models\Coustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->dokans()->first();

        $coustomers = Coustomer::where('dokan_id', $dokan?->id)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->oldest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('coustomer/index', [
            'coustomers' => $coustomers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCoustomerRequest $request)
    {
        Coustomer::create($request->validated());

        return redirect()->route('coustomers.index')->with('success', 'Customer added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCoustomerRequest $request, Coustomer $coustomer)
    {
        $dokan = $request->user()->dokans()->first();
        if ($coustomer->dokan_id !== $dokan?->id) {
            abort(403);
        }

        $coustomer->update($request->validated());

        return redirect()->route('coustomers.index')->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Coustomer $coustomer)
    {
        $dokan = $request->user()->dokans()->first();
        if ($coustomer->dokan_id !== $dokan?->id) {
            abort(403);
        }

        $coustomer->delete();

        return redirect()->route('coustomers.index')->with('success', 'Customer deleted successfully.');
    }
}
