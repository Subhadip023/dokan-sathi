<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;

        $query = Order::with(['supplier:id,name,company_name,phone', 'items.product', 'addedBy:id,name', 'editedBy:id,name'])
            ->where('dokan_id', $dokanId);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('items', function ($iq) use ($search) {
                      $iq->where('product_name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest('id')->paginate(15)->withQueryString();

        // Calculate Dokan-wide summary stats
        $allOrders = Order::where('dokan_id', $dokanId)->get();
        $totalOrders = $allOrders->count();
        $totalCost = $allOrders->where('status', '!=', 'cancelled')->sum('total_amount');
        $receivedOrders = $allOrders->where('status', 'received')->count();
        $pendingOrders = $allOrders->whereIn('status', ['pending', 'ordered'])->count();

        $suppliers = Supplier::where('dokan_id', $dokanId)->get(['id', 'name', 'company_name', 'phone']);
        $products = Product::where('dokan_id', $dokanId)->get(['id', 'name', 'description', 'cost_rate', 'selling_rate', 'purchased_packets', 'packet_size']);

        return Inertia::render('order/index', [
            'orders' => $orders,
            'summary' => [
                'totalOrders' => $totalOrders,
                'totalCost' => round($totalCost, 2),
                'receivedOrders' => $receivedOrders,
                'pendingOrders' => $pendingOrders,
            ],
            'suppliers' => $suppliers,
            'products' => $products,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created purchase order.
     */
    public function store(StoreOrderRequest $request)
    {
        $dokan = $request->user()->currentDokan();
        $dokanId = $dokan?->id;
        $user = $request->user();

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $dokanId, $user) {
            $orderNumber = 'PO-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
            
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_cost'];
            }

            $order = Order::create([
                'dokan_id' => $dokanId,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'order_number' => $orderNumber,
                'order_date' => $validated['order_date'],
                'status' => $validated['status'],
                'total_amount' => round($totalAmount, 2),
                'notes' => $validated['notes'] ?? null,
                'added_by' => $user->id,
                'edited_by' => $user->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemTotalCost = $itemData['quantity'] * $itemData['unit_cost'];
                $productName = trim($itemData['product_name']);
                $productId = $itemData['product_id'] ?? null;
                $unitCost = (float) $itemData['unit_cost'];
                $sellingRate = isset($itemData['selling_rate']) && $itemData['selling_rate'] !== ''
                    ? (float) $itemData['selling_rate']
                    : $unitCost;
                $packetSize = !empty($itemData['packet_size']) ? (int) $itemData['packet_size'] : 1;
                $description = $itemData['description'] ?? null;

                // Resolve or create product in products table immediately
                if (!$productId && !empty($productName)) {
                    $existingProduct = Product::where('dokan_id', $dokanId)
                        ->where('name', $productName)
                        ->first();

                    if ($existingProduct) {
                        $productId = $existingProduct->id;
                        $existingProduct->update([
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                            'packet_size' => $packetSize,
                            'description' => $description ?? $existingProduct->description,
                        ]);
                    } else {
                        // Create brand new product entry in catalog
                        $newProduct = Product::create([
                            'dokan_id' => $dokanId,
                            'name' => $productName,
                            'description' => $description ?? 'Added via Purchase Order',
                            'reorder_level' => 10,
                            'purchased_packets' => 0,
                            'packet_size' => $packetSize,
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                        ]);
                        $productId = $newProduct->id;
                    }
                } elseif ($productId) {
                    // Update existing catalog product parameters
                    Product::where('id', $productId)
                        ->where('dokan_id', $dokanId)
                        ->update([
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                            'packet_size' => $packetSize,
                        ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'quantity' => $itemData['quantity'],
                    'unit_cost' => $unitCost,
                    'total_cost' => round($itemTotalCost, 2),
                ]);

                // If status is received, increment inventory stock
                if ($validated['status'] === 'received' && $productId) {
                    Product::where('id', $productId)
                        ->where('dokan_id', $dokanId)
                        ->increment('purchased_packets', $itemData['quantity']);
                }
            }
        });

        return redirect()->route('orders.index')->with('success', 'Purchase order created and product catalog updated.');
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $order->dokan_id !== $dokan->id) {
            abort(403);
        }

        $validated = $request->validated();
        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($validated, $order, $oldStatus, $newStatus, $dokan, $request) {
            // Restore inventory stock if old status was received
            if ($oldStatus === 'received') {
                foreach ($order->items as $oldItem) {
                    if ($oldItem->product_id) {
                        Product::where('id', $oldItem->product_id)
                            ->where('dokan_id', $dokan->id)
                            ->decrement('purchased_packets', $oldItem->quantity);
                    }
                }
            }

            // Remove existing items
            $order->items()->delete();

            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_cost'];
            }

            $order->update([
                'supplier_id' => $validated['supplier_id'] ?? null,
                'order_date' => $validated['order_date'],
                'status' => $newStatus,
                'total_amount' => round($totalAmount, 2),
                'notes' => $validated['notes'] ?? null,
                'edited_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemTotalCost = $itemData['quantity'] * $itemData['unit_cost'];
                $productName = trim($itemData['product_name']);
                $productId = $itemData['product_id'] ?? null;
                $unitCost = (float) $itemData['unit_cost'];
                $sellingRate = isset($itemData['selling_rate']) && $itemData['selling_rate'] !== ''
                    ? (float) $itemData['selling_rate']
                    : $unitCost;
                $packetSize = !empty($itemData['packet_size']) ? (int) $itemData['packet_size'] : 1;
                $description = $itemData['description'] ?? null;

                // Resolve or create product in products table
                if (!$productId && !empty($productName)) {
                    $existingProduct = Product::where('dokan_id', $dokan->id)
                        ->where('name', $productName)
                        ->first();

                    if ($existingProduct) {
                        $productId = $existingProduct->id;
                        $existingProduct->update([
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                            'packet_size' => $packetSize,
                            'description' => $description ?? $existingProduct->description,
                        ]);
                    } else {
                        $newProduct = Product::create([
                            'dokan_id' => $dokan->id,
                            'name' => $productName,
                            'description' => $description ?? 'Added via Purchase Order',
                            'reorder_level' => 10,
                            'purchased_packets' => 0,
                            'packet_size' => $packetSize,
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                        ]);
                        $productId = $newProduct->id;
                    }
                } elseif ($productId) {
                    Product::where('id', $productId)
                        ->where('dokan_id', $dokan->id)
                        ->update([
                            'cost_rate' => $unitCost,
                            'selling_rate' => $sellingRate,
                            'packet_size' => $packetSize,
                        ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'quantity' => $itemData['quantity'],
                    'unit_cost' => $unitCost,
                    'total_cost' => round($itemTotalCost, 2),
                ]);

                // Increment inventory stock if new status is received
                if ($newStatus === 'received' && $productId) {
                    Product::where('id', $productId)
                        ->where('dokan_id', $dokan->id)
                        ->increment('purchased_packets', $itemData['quantity']);
                }
            }
        });

        return redirect()->route('orders.index')->with('success', 'Purchase order updated successfully.');
    }

    /**
     * Quick status update for an order.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $order->dokan_id !== $dokan->id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,ordered,received,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        if ($oldStatus === $newStatus) {
            return redirect()->back();
        }

        DB::transaction(function () use ($order, $oldStatus, $newStatus, $dokan, $request) {
            if ($oldStatus === 'received' && $newStatus !== 'received') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)
                            ->where('dokan_id', $dokan->id)
                            ->decrement('purchased_packets', $item->quantity);
                    }
                }
            } elseif ($oldStatus !== 'received' && $newStatus === 'received') {
                foreach ($order->items as $item) {
                    $productId = $item->product_id;

                    if (!$productId && !empty($item->product_name)) {
                        $existingProduct = Product::where('dokan_id', $dokan->id)
                            ->where('name', $item->product_name)
                            ->first();

                        if ($existingProduct) {
                            $productId = $existingProduct->id;
                        } else {
                            $newProduct = Product::create([
                                'dokan_id' => $dokan->id,
                                'name' => $item->product_name,
                                'description' => 'Added via Purchase Order',
                                'reorder_level' => 10,
                                'purchased_packets' => 0,
                                'packet_size' => 1,
                                'cost_rate' => $item->unit_cost ?? 0,
                                'selling_rate' => $item->unit_cost ?? 0,
                            ]);
                            $productId = $newProduct->id;
                        }

                        $item->update(['product_id' => $productId]);
                    }

                    if ($productId) {
                        Product::where('id', $productId)
                            ->where('dokan_id', $dokan->id)
                            ->increment('purchased_packets', $item->quantity);
                    }
                }
            }

            $order->update([
                'status' => $newStatus,
                'edited_by' => $request->user()->id,
            ]);
        });

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Request $request, Order $order)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $order->dokan_id !== $dokan->id) {
            abort(403);
        }

        DB::transaction(function () use ($order, $dokan) {
            if ($order->status === 'received') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)
                            ->where('dokan_id', $dokan->id)
                            ->decrement('purchased_packets', $item->quantity);
                    }
                }
            }
            $order->delete();
        });

        return redirect()->route('orders.index')->with('success', 'Purchase order deleted and inventory updated.');
    }
}
