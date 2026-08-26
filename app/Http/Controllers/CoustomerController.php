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
        $user = $request->user();
        $isEmployee = $user->isEmployee();
        $dokan = $user->currentDokan();
        $dokanId = $dokan?->id;

        $coustomers = Coustomer::with(['addedBy:id,name', 'editedBy:id,name', 'sales'])
            ->where('dokan_id', $dokanId)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('shop_name', 'like', "%{$search}%");
                });
            })
            ->oldest()
            ->paginate(15)
            ->withQueryString();

        $coustomers->getCollection()->transform(function ($customer) use ($isEmployee) {
            $sales = $customer->sales;
            $customer->total_sales_amount = round($sales->sum(fn($s) => $s->total_amount), 2);
            $customer->total_profit = $isEmployee ? null : round($sales->sum(fn($s) => $s->profit), 2);
            unset($customer->sales);
            return $customer;
        });

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
        $data = $request->validated();
        $data['added_by'] = $request->user()->id;
        $data['edited_by'] = $request->user()->id;

        Coustomer::create($data);

        return redirect()->route('coustomers.index')->with('success', 'Customer added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCoustomerRequest $request, Coustomer $coustomer)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $coustomer->dokan_id !== $dokan->id) {
            abort(403);
        }

        $data = $request->validated();
        $data['edited_by'] = $request->user()->id;

        $coustomer->update($data);

        return redirect()->route('coustomers.index')->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Coustomer $coustomer)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $coustomer->dokan_id !== $dokan->id) {
            abort(403);
        }

        $coustomer->delete();

        return redirect()->route('coustomers.index')->with('success', 'Customer deleted successfully.');
    }
}
