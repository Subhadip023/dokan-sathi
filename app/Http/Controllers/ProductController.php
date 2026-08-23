<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    

    public function index(Request $request)
    {
        $dokan = $request->user()->dokans()->first();

        $allProducts = Product::where('dokan_id', $dokan?->id)->get();
        $totalPackets = $allProducts->sum('purchased_packets');
        $totalPieces = $allProducts->sum(fn($p) => $p->purchased_packets * $p->packet_size);
        $totalCostValuation = $allProducts->sum(fn($p) => $p->purchased_packets * $p->cost_rate);
        $totalSellingValuation = $allProducts->sum(fn($p) => $p->purchased_packets * $p->selling_rate);

        return Inertia::render('product/index', [
            'products' => Product::query()
                ->where('dokan_id', $dokan?->id)
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'summary' => [
                'totalCount' => $allProducts->count(),
                'totalPackets' => $totalPackets,
                'totalPieces' => $totalPieces,
                'totalCostValuation' => round($totalCostValuation, 2),
                'totalSellingValuation' => round($totalSellingValuation, 2),
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        Product::create($request->validated());
        return redirect()->route('products.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());
        
    }
    public function syncQuantity(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:products,id',
            'purchased_packets' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($request->id);
        $product->purchased_packets = $request->purchased_packets;
        $product->save();

        return redirect()->back()->with('success', 'Packets updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
    }

    /**
     * Display a public/internal clean selling price catalog.
     */
    public function priceList(Request $request)
    {
        $dokan = $request->user()->dokans()->first();

        $products = Product::query()
            ->where('dokan_id', $dokan?->id)
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'description', 'packet_size', 'selling_rate', 'purchased_packets', 'reorder_level']);

        return Inertia::render('product/price-list', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }
}
