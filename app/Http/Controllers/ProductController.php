<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\Dokan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dokan = $user->currentDokan();
        $isEmployee = $user->isEmployee();

        $allProducts = Product::where('dokan_id', $dokan?->id)->get();
        $packetSizes = Product::where('dokan_id', $dokan?->id)
            ->whereNotNull('packet_size')
            ->distinct()
            ->orderBy('packet_size', 'asc')
            ->pluck('packet_size');

        $totalPackets = $allProducts->sum('purchased_packets');
        $totalPieces = $allProducts->sum(fn ($p) => $p->purchased_packets * $p->packet_size);
        $totalCostValuation = $isEmployee ? 0 : $allProducts->sum(fn ($p) => $p->purchased_packets * $p->cost_rate);
        $totalSellingValuation = $allProducts->sum(fn ($p) => $p->purchased_packets * $p->selling_rate);

        $products = Product::query()
            ->where('dokan_id', $dokan?->id)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->input('packet_size'), function ($query, $packetSize) {
                $query->where('packet_size', $packetSize);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        if ($isEmployee) {
            $products->getCollection()->transform(function ($product) {
                unset($product->cost_rate);

                return $product;
            });
        }

        return Inertia::render('product/index', [
            'products' => $products,
            'packetSizes' => $packetSizes,
            'summary' => [
                'totalCount' => $allProducts->count(),
                'totalPackets' => $totalPackets,
                'totalPieces' => $totalPieces,
                'totalCostValuation' => $isEmployee ? null : round($totalCostValuation, 2),
                'totalSellingValuation' => round($totalSellingValuation, 2),
            ],
            'filters' => $request->only(['search', 'packet_size']),
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
        $user = $request->user();
        $dokan = $user->currentDokan();

        if ($dokan && $dokan->slug) {
            return redirect()->route('dokans.price-list', array_merge(['dokan' => $dokan->slug], $request->query()));
        }

        if ($dokan) {
            $dokan->load('owner');
        }

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
            'dokan' => $dokan,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display a public price catalog for a specific dokan slug.
     */
    public function publicPriceList(Request $request, Dokan $dokan)
    {
        $dokan->load('owner');

        $products = Product::query()
            ->where('dokan_id', $dokan->id)
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'description', 'packet_size', 'selling_rate', 'purchased_packets', 'reorder_level']);

        return Inertia::render('product/price-list', [
            'products' => $products,
            'dokan' => $dokan,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Download public PDF price list catalog for a Dokan.
     */
    public function downloadPdf(Dokan $dokan)
    {
        $dokan->load('owner');

        $products = Product::query()
            ->where('dokan_id', $dokan->id)
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'description', 'packet_size', 'selling_rate']);

        $pdf = Pdf::loadView('pdf.price-list', [
            'dokan' => $dokan,
            'products' => $products,
        ]);

        $fileName = 'price-list-' . ($dokan->slug ?: 'store') . '.pdf';

        return $pdf->stream($fileName);
    }
}
