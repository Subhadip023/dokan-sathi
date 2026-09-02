<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Coustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Display a listing of due sales invoices.
     */
    public function dueInvoices(Request $request): Response
    {
        $request->merge(['due_only' => true]);
        return $this->index($request);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;
        $isDueOnly = $request->boolean('due_only') || $request->routeIs('sales.due');

        $query = Sale::with(['product', 'customer'])
            ->where('dokan_id', $dokanId);

        if ($isDueOnly) {
            $query->where(function ($q) {
                $q->whereIn('payment_status', ['credit', 'partially_paid'])
                  ->orWhere('due_amount', '>', 0);
            });
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                })->orWhereHas('customer', function ($cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                })->orWhere('sale_date', 'like', "%{$search}%");
            });
        }

        $allMatchingSales = $query->latest('sale_date')->latest('id')->get();

        // Group sales into customer invoice transactions
        $invoices = $allMatchingSales->groupBy(function ($sale) {
            $cust = $sale->customer_id ?? 'walkin';
            $time = $sale->created_at ? $sale->created_at->format('Y-m-d H:i') : $sale->sale_date;
            return "{$sale->sale_date}_{$cust}_{$time}";
        })->map(function ($group, $key) {
            $first = $group->first();
            $totalAmount = $group->sum(fn($s) => $s->total_amount);
            $totalProfit = $group->sum(fn($s) => $s->profit);
            $totalPackets = $group->sum('qty');
            $totalPieces = $group->sum(fn($s) => $s->qty * $s->packet_size);

            $groupPaidAmount = $group->sum('paid_amount');
            $groupDueAmount = $group->sum('due_amount');
            $rawStatus = $first->payment_status ?? 'full_paid';

            if ($rawStatus === 'full_paid' || $groupDueAmount <= 0) {
                $paymentStatus = 'full_paid';
                $groupPaidAmount = $totalAmount;
                $groupDueAmount = 0;
            } elseif ($rawStatus === 'credit' || $groupPaidAmount <= 0) {
                $paymentStatus = 'credit';
                $groupPaidAmount = 0;
                $groupDueAmount = $totalAmount;
            } else {
                $paymentStatus = 'partially_paid';
            }

            return [
                'id' => $key,
                'first_sale_id' => $first->id,
                'sale_date' => $first->sale_date,
                'created_at' => $first->created_at ? $first->created_at->format('Y-m-d H:i:s') : $first->sale_date,
                'customer' => $first->customer ? [
                    'id' => $first->customer->id,
                    'name' => $first->customer->name,
                    'phone' => $first->customer->phone,
                ] : null,
                'items_count' => $group->count(),
                'total_packets' => $totalPackets,
                'total_pieces' => $totalPieces,
                'total_amount' => round($totalAmount, 2),
                'paid_amount' => round($groupPaidAmount, 2),
                'due_amount' => round($groupDueAmount, 2),
                'payment_status' => $paymentStatus,
                'total_profit' => round($totalProfit, 2),
                'items' => $group->map(fn($s) => [
                    'id' => $s->id,
                    'product_id' => $s->product_id,
                    'product_name' => $s->product ? $s->product->name : 'Deleted Product',
                    'qty' => $s->qty,
                    'packet_size' => $s->packet_size,
                    'rate' => $s->rate,
                    'cost_rate' => $s->cost_rate,
                    'discount' => $s->discount,
                    'payment_status' => $s->payment_status ?? 'full_paid',
                    'paid_amount' => round($s->paid_amount ?? $s->total_amount, 2),
                    'due_amount' => round($s->due_amount ?? 0, 2),
                    'total_amount' => round($s->total_amount, 2),
                    'profit' => round($s->profit, 2),
                ])->values()->all(),
                'sale_ids' => $group->pluck('id')->all(),
            ];
        })->values();

        if ($isDueOnly) {
            $invoices = $invoices->filter(fn($inv) => $inv['payment_status'] !== 'full_paid' || $inv['due_amount'] > 0)->values();
        }

        // Manual Paginator for Inertia
        $page = \Illuminate\Pagination\Paginator::resolveCurrentPage() ?: 1;
        $perPage = 15;
        $slice = $invoices->slice(($page - 1) * $perPage, $perPage)->values();
        $paginatedInvoices = new \Illuminate\Pagination\LengthAwarePaginator(
            $slice,
            $invoices->count(),
            $perPage,
            $page,
            ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        $user = $request->user();
        $isEmployee = $user->isEmployee();

        // Summary Calculations for Dokan
        $allSales = Sale::where('dokan_id', $dokanId)->get();
        $totalRevenue = $allSales->sum(fn($s) => $s->total_amount);
        $totalPaidCollected = $allSales->sum(fn($s) => ($s->payment_status === 'credit') ? 0 : (($s->payment_status === 'partially_paid') ? $s->paid_amount : $s->total_amount));
        $totalOutstandingDue = $allSales->sum(fn($s) => ($s->payment_status === 'full_paid') ? 0 : (($s->payment_status === 'credit') ? $s->total_amount : $s->due_amount));
        $totalProfit = $isEmployee ? null : $allSales->sum(fn($s) => $s->profit);
        $totalInvoices = $invoices->count();

        if ($isEmployee) {
            $paginatedInvoices->getCollection()->transform(function ($inv) {
                unset($inv['total_profit']);
                if (isset($inv['items'])) {
                    foreach ($inv['items'] as &$item) {
                        unset($item['profit'], $item['cost_rate']);
                    }
                }
                return $inv;
            });
        }

        $products = Product::where('dokan_id', $dokanId)->get(['id', 'name', 'description', 'selling_rate', 'cost_rate', 'packet_size', 'purchased_packets']);
        $customers = Coustomer::where('dokan_id', $dokanId)->get(['id', 'name', 'phone']);

        return Inertia::render('sale/index', [
            'invoices' => $paginatedInvoices,
            'summary' => [
                'totalRevenue' => round($totalRevenue, 2),
                'totalPaidCollected' => round($totalPaidCollected, 2),
                'totalOutstandingDue' => round($totalOutstandingDue, 2),
                'totalProfit' => $isEmployee ? null : round($totalProfit, 2),
                'totalInvoices' => $totalInvoices,
            ],
            'products' => $products,
            'customers' => $customers,
            'filters' => $request->only(['search']),
            'isDueOnly' => $isDueOnly,
        ]);
    }

    /**
     * Show the form for creating a new sale.
     */
    public function create(Request $request): Response
    {
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        $products = Product::where('dokan_id', $dokanId)->get(['id', 'name', 'description', 'selling_rate', 'cost_rate', 'packet_size', 'purchased_packets']);
        $customers = Coustomer::where('dokan_id', $dokanId)->get(['id', 'name', 'phone']);

        return Inertia::render('sale/create', [
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    /**
     * Store newly created resources in storage (supports multiple products per sale).
     */
    public function store(StoreSaleRequest $request)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        DB::transaction(function () use ($request, $dokan) {
            $numItems = count($request->items);
            $extraDiscountPerItem = ($numItems > 0 && $request->filled('order_discount'))
                ? floatval($request->order_discount) / $numItems
                : 0;

            $paymentStatus = $request->input('payment_status', 'full_paid');
            $rawPaidAmount = floatval($request->input('paid_amount', 0));

            // Calculate total invoice order amount
            $totalOrderAmount = 0;
            $preparedItems = [];
            foreach ($request->items as $item) {
                $product = Product::where('dokan_id', $dokan->id)->lockForUpdate()->findOrFail($item['product_id']);
                $totalItemDiscount = (floatval($item['discount'] ?? 0)) + $extraDiscountPerItem;
                $itemTotalAmount = max(0, ($item['qty'] * $product->selling_rate) - $totalItemDiscount);
                $totalOrderAmount += $itemTotalAmount;
                $preparedItems[] = [
                    'product' => $product,
                    'qty' => $item['qty'],
                    'discount' => round($totalItemDiscount, 2),
                    'item_total_amount' => $itemTotalAmount,
                ];
            }

            // Determine total paid and due amounts for invoice
            if ($paymentStatus === 'full_paid') {
                $orderPaid = $totalOrderAmount;
                $orderDue = 0;
            } elseif ($paymentStatus === 'credit') {
                $orderPaid = 0;
                $orderDue = $totalOrderAmount;
            } else { // partially_paid
                $orderPaid = min($totalOrderAmount, max(0, $rawPaidAmount));
                $orderDue = max(0, $totalOrderAmount - $orderPaid);
            }

            foreach ($preparedItems as $prep) {
                $product = $prep['product'];
                $itemAmount = $prep['item_total_amount'];

                if ($totalOrderAmount > 0) {
                    $itemShare = $itemAmount / $totalOrderAmount;
                    $itemPaid = round($orderPaid * $itemShare, 2);
                    $itemDue = round($itemAmount - $itemPaid, 2);
                } else {
                    $itemPaid = 0;
                    $itemDue = 0;
                }

                Sale::create([
                    'dokan_id'       => $dokan->id,
                    'sale_date'      => $request->sale_date,
                    'customer_id'    => $request->customer_id ?: null,
                    'product_id'     => $product->id,
                    'qty'            => $prep['qty'],
                    'packet_size'    => $product->packet_size,
                    'rate'           => $product->selling_rate,
                    'cost_rate'      => $product->cost_rate,
                    'discount'       => $prep['discount'],
                    'payment_status' => $paymentStatus,
                    'paid_amount'    => $itemPaid,
                    'due_amount'     => $itemDue,
                ]);

                // Deduct sold packets from product inventory
                $product->decrement('purchased_packets', $prep['qty']);
            }
        });

        $count = count($request->items);
        $msg = $count > 1 ? "Sale with {$count} products recorded successfully." : "Sale recorded successfully.";

        return redirect()->route('sales.index')->with('success', $msg);
    }

    /**
     * Update payment status of an invoice transaction.
     */
    public function updatePaymentStatus(Request $request)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $request->validate([
            'sale_ids' => 'required|array',
            'payment_status' => 'required|string|in:full_paid,partially_paid,credit',
            'paid_amount' => 'nullable|numeric|min:0',
        ]);

        $sales = Sale::where('dokan_id', $dokan->id)
            ->whereIn('id', $request->sale_ids)
            ->get();

        if ($sales->isEmpty()) {
            abort(404, 'Sale records not found.');
        }

        $totalInvoiceAmount = $sales->sum(fn($s) => $s->total_amount);
        $paymentStatus = $request->payment_status;
        $rawPaidAmount = floatval($request->paid_amount ?? 0);

        if ($paymentStatus === 'full_paid') {
            $orderPaid = $totalInvoiceAmount;
            $orderDue = 0;
        } elseif ($paymentStatus === 'credit') {
            $orderPaid = 0;
            $orderDue = $totalInvoiceAmount;
        } else {
            $orderPaid = min($totalInvoiceAmount, max(0, $rawPaidAmount));
            $orderDue = max(0, $totalInvoiceAmount - $orderPaid);
        }

        foreach ($sales as $sale) {
            $itemAmount = $sale->total_amount;
            if ($totalInvoiceAmount > 0) {
                $share = $itemAmount / $totalInvoiceAmount;
                $itemPaid = round($orderPaid * $share, 2);
                $itemDue = round($itemAmount - $itemPaid, 2);
            } else {
                $itemPaid = 0;
                $itemDue = 0;
            }

            $sale->update([
                'payment_status' => $paymentStatus,
                'paid_amount'    => $itemPaid,
                'due_amount'     => $itemDue,
            ]);
        }

        return redirect()->back()->with('success', 'Payment status updated successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleRequest $request, Sale $sale)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $sale->dokan_id !== $dokan->id) {
            abort(403);
        }

        DB::transaction(function () use ($request, $sale, $dokan) {
            // Restore previous product stock
            $oldProduct = Product::where('dokan_id', $dokan->id)->lockForUpdate()->find($sale->product_id);
            if ($oldProduct) {
                $oldProduct->increment('purchased_packets', $sale->qty);
            }

            // Deduct new product stock
            $newProduct = Product::where('dokan_id', $dokan->id)->lockForUpdate()->findOrFail($request->product_id);
            $newProduct->decrement('purchased_packets', $request->qty);

            $sale->update([
                'sale_date' => $request->sale_date,
                'customer_id' => $request->customer_id ?: null,
                'product_id' => $newProduct->id,
                'qty' => $request->qty,
                'packet_size' => $newProduct->packet_size,
                'rate' => $newProduct->selling_rate,
                'cost_rate' => $newProduct->cost_rate,
                'discount' => $request->discount ?? 0,
            ]);
        });

        return redirect()->route('sales.index')->with('success', 'Sale item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Sale $sale)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $sale->dokan_id !== $dokan->id) {
            abort(403);
        }

        DB::transaction(function () use ($request, $sale, $dokan) {
            $rawSaleIds = $request->input('sale_ids') ?? $request->query('sale_ids');

            $salesToDelete = collect();
            if ($rawSaleIds) {
                $saleIds = is_array($rawSaleIds)
                    ? $rawSaleIds
                    : array_filter(explode(',', (string)$rawSaleIds));

                if (count($saleIds) > 0) {
                    $salesToDelete = Sale::where('dokan_id', $dokan->id)->whereIn('id', $saleIds)->get();
                }
            }

            // Fallback: If no sale_ids array was passed or found, retrieve all sale items belonging to this invoice transaction
            if ($salesToDelete->isEmpty()) {
                $query = Sale::where('dokan_id', $dokan->id)
                    ->where('sale_date', $sale->sale_date);

                if ($sale->customer_id) {
                    $query->where('customer_id', $sale->customer_id);
                } else {
                    $query->whereNull('customer_id');
                }

                if ($sale->created_at) {
                    $query->whereRaw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') = ?", [
                        $sale->created_at->format('Y-m-d H:i')
                    ]);
                } else {
                    $query->where('id', $sale->id);
                }

                $salesToDelete = $query->get();
            }

            foreach ($salesToDelete as $item) {
                if ($item->product_id) {
                    $product = Product::where('dokan_id', $dokan->id)->lockForUpdate()->find($item->product_id);
                    if ($product) {
                        $product->increment('purchased_packets', max(0, (int)$item->qty));
                    }
                }
                $item->delete();
            }
        });

        return redirect()->route('sales.index')->with('success', 'Sale invoice deleted and stock restored.');
    }

    /**
     * Generate and stream PDF invoice for a sale transaction.
     */
    public function downloadInvoice(Request $request)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $saleIds = [];
        if ($request->filled('sale_ids')) {
            $raw = $request->input('sale_ids');
            $saleIds = is_array($raw) ? $raw : array_filter(explode(',', $raw));
        } elseif ($request->filled('first_sale_id')) {
            $firstSale = Sale::where('dokan_id', $dokan->id)->find($request->input('first_sale_id'));
            if ($firstSale) {
                $query = Sale::where('dokan_id', $dokan->id)
                    ->where('sale_date', $firstSale->sale_date);
                if ($firstSale->customer_id) {
                    $query->where('customer_id', $firstSale->customer_id);
                } else {
                    $query->whereNull('customer_id');
                }
                if ($firstSale->created_at) {
                    $query->whereRaw("DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') = ?", [$firstSale->created_at->format('Y-m-d H:i')]);
                }
                $saleIds = $query->pluck('id')->toArray();
            }
        }

        if (empty($saleIds)) {
            abort(404, 'Sale records not found.');
        }

        $sales = Sale::with(['product', 'customer'])
            ->where('dokan_id', $dokan->id)
            ->whereIn('id', $saleIds)
            ->get();

        if ($sales->isEmpty()) {
            abort(404, 'Sale records not found.');
        }

        $firstSale = $sales->first();
        $dokan->load('licenses');
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', [
            'dokan'     => $dokan,
            'sales'     => $sales,
            'firstSale' => $firstSale,
        ]);

        return $pdf->stream("invoice-INV-{$firstSale->id}.pdf");
    }
}
