<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        $suppliers = Supplier::with(['addedBy:id,name', 'editedBy:id,name'])
            ->where('dokan_id', $dokanId)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('company_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('supplier/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created supplier in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        $data = $request->validated();
        $data['added_by'] = $request->user()->id;
        $data['edited_by'] = $request->user()->id;

        Supplier::create($data);

        return redirect()->route('suppliers.index')->with('success', 'Supplier added successfully.');
    }

    /**
     * Update the specified supplier in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $supplier->dokan_id !== $dokan->id) {
            abort(403);
        }

        $data = $request->validated();
        $data['edited_by'] = $request->user()->id;

        $supplier->update($data);

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified supplier from storage.
     */
    public function destroy(Request $request, Supplier $supplier)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $supplier->dokan_id !== $dokan->id) {
            abort(403);
        }

        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }
}
