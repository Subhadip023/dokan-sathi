<?php

namespace Database\Seeders;

use App\Models\Coustomer;
use App\Models\Dokan;
use App\Models\Investment;
use App\Models\License;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OverheadCost;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDokanSeeder extends Seeder
{
    /**
     * Seed a complete demo Dokan with owner, products, and customers in one file.
     */
    public function run(): void
    {
        // 1. Create Demo User / Store Owner
        $owner = User::firstOrCreate(
            ['email' => 'demo@dokansathi.com'],
            [
                'name'     => 'Demo Store Owner',
                'phone'    => '9876543210',
                'password' => Hash::make('12345678'),
                'role'     => User::ROLE_ADMIN,
            ]
        );

        // 2. Create Demo Dokan
        $dokan = Dokan::updateOrCreate(
            ['slug' => 'demo-store'],
            [
                'name'        => 'Demo General Store',
                'description' => 'Your one-stop daily essentials and grocery shop.',
                'location'    => '123 Market Street, City Center',
                'phone'       => '9876543210',
                'email'       => 'contact@demostore.com',
                'owner_id'    => $owner->id,
            ]
        );

        // Assign current dokan_id to user
        $owner->update(['dokan_id' => $dokan->id]);

        // 3. Create Sample Products for Demo Dokan
        $products = [
            [
                'name'              => 'Fortune Sunflower Oil (1L)',
                'description'       => 'Refined sunflower cooking oil 1 Liter pouch',
                'purchased_packets' => 50,
                'packet_size'       => 10,
                'cost_rate'         => 120.00,
                'selling_rate'      => 145.00,
                'reorder_level'     => 5,
            ],
            [
                'name'              => 'Aashirvaad Shuddh Atta (5kg)',
                'description'       => '100% pure whole wheat flour',
                'purchased_packets' => 30,
                'packet_size'       => 5,
                'cost_rate'         => 210.00,
                'selling_rate'      => 245.00,
                'reorder_level'     => 5,
            ],
            [
                'name'              => 'Tata Salt Vacuum Evaporated (1kg)',
                'description'       => 'Iodized table salt 1kg pack',
                'purchased_packets' => 100,
                'packet_size'       => 20,
                'cost_rate'         => 22.00,
                'selling_rate'      => 28.00,
                'reorder_level'     => 10,
            ],
            [
                'name'              => 'Amul Butter Pasteurized (500g)',
                'description'       => 'Delicious salted butter slab',
                'purchased_packets' => 40,
                'packet_size'       => 8,
                'cost_rate'         => 240.00,
                'selling_rate'      => 275.00,
                'reorder_level'     => 5,
            ],
            [
                'name'              => 'Amul Taaza Toned Milk (1L)',
                'description'       => 'Pasteurized toned milk tetra pack',
                'purchased_packets' => 60,
                'packet_size'       => 12,
                'cost_rate'         => 64.00,
                'selling_rate'      => 72.00,
                'reorder_level'     => 8,
            ],
            [
                'name'              => 'Taj Mahal Tea (500g)',
                'description'       => 'Premium black tea leaves box',
                'purchased_packets' => 25,
                'packet_size'       => 5,
                'cost_rate'         => 310.00,
                'selling_rate'      => 360.00,
                'reorder_level'     => 3,
            ],
            [
                'name'              => 'Maggi 2-Minute Masala Noodles (70g)',
                'description'       => 'Instant noodles pack of 12',
                'purchased_packets' => 80,
                'packet_size'       => 12,
                'cost_rate'         => 140.00,
                'selling_rate'      => 168.00,
                'reorder_level'     => 10,
            ],
            [
                'name'              => 'Surf Excel Easy Wash Detergent (1kg)',
                'description'       => 'Detergent powder for stain removal',
                'purchased_packets' => 35,
                'packet_size'       => 5,
                'cost_rate'         => 130.00,
                'selling_rate'      => 155.00,
                'reorder_level'     => 5,
            ],
            [
                'name'              => 'Dettol Antiseptic Liquid (500ml)',
                'description'       => 'First aid and personal hygiene disinfectant liquid',
                'purchased_packets' => 20,
                'packet_size'       => 4,
                'cost_rate'         => 190.00,
                'selling_rate'      => 225.00,
                'reorder_level'     => 3,
            ],
            [
                'name'              => 'Cadbury Dairy Milk Silk (150g)',
                'description'       => 'Smooth chocolate bar',
                'purchased_packets' => 45,
                'packet_size'       => 15,
                'cost_rate'         => 140.00,
                'selling_rate'      => 175.00,
                'reorder_level'     => 6,
            ],
        ];

        foreach ($products as $prodData) {
            Product::updateOrCreate(
                [
                    'dokan_id' => $dokan->id,
                    'name'     => $prodData['name'],
                ],
                array_merge($prodData, ['dokan_id' => $dokan->id])
            );
        }

        // 4. Create Sample Customers for Demo Dokan
        $customers = [
            [
                'name'      => 'Rahul Sharma',
                'phone'     => '9830012345',
                'email'     => 'rahul.sharma@example.com',
                'shop_name' => 'Sharma Corner Shop',
            ],
            [
                'name'      => 'Priya Roy',
                'phone'     => '9831123456',
                'email'     => 'priya.roy@example.com',
                'shop_name' => 'Roy Variety Store',
            ],
            [
                'name'      => 'Amit Patel',
                'phone'     => '9832234567',
                'email'     => 'amit.patel@example.com',
                'shop_name' => 'Patel Supermarket',
            ],
            [
                'name'      => 'Snehash Sen',
                'phone'     => '9833345678',
                'email'     => 'snehash.sen@example.com',
                'shop_name' => 'Sen Traders',
            ],
            [
                'name'      => 'Anjali Gupta',
                'phone'     => '9834456789',
                'email'     => 'anjali.gupta@example.com',
                'shop_name' => 'Gupta Enterprise',
            ],
        ];

        foreach ($customers as $custData) {
            Coustomer::updateOrCreate(
                [
                    'dokan_id' => $dokan->id,
                    'phone'    => $custData['phone'],
                ],
                array_merge($custData, [
                    'dokan_id' => $dokan->id,
                    'added_by' => $owner->id,
                ])
            );
        }

        // 5. Create Sample Licenses for Demo Dokan
        $licenses = [
            ['name' => 'DL No. 20B/21B', 'number' => 'DL-WB-KOL-2026-10492', 'is_active' => true],
            ['name' => 'FSSAI License', 'number' => '12824001000987', 'is_active' => true],
            ['name' => 'GSTIN', 'number' => '19ABCDE1234F1ZH', 'is_active' => true],
            ['name' => 'Trade License', 'number' => 'TL-2026/984321', 'is_active' => true],
        ];

        foreach ($licenses as $licData) {
            License::updateOrCreate(
                [
                    'dokan_id' => $dokan->id,
                    'name'     => $licData['name'],
                ],
                array_merge($licData, ['dokan_id' => $dokan->id])
            );
        }

        // 6. Create Staff Member
        User::firstOrCreate(
            ['email' => 'cashier@demostore.com'],
            [
                'name'     => 'Ramesh Verma (Cashier)',
                'phone'    => '9876543211',
                'password' => Hash::make('12345678'),
                'role'     => User::ROLE_EMPLOYEE,
                'dokan_id' => $dokan->id,
            ]
        );

        // 7. Create Suppliers
        $suppliers = [
            [
                'name'         => 'Rajesh Agarwal',
                'company_name' => 'Hindustan Unilever Supply Hub',
                'phone'        => '9830198765',
                'email'        => 'rajesh@hulhub.example.com',
                'address'      => 'Wholesale Mandi, Block B-12',
            ],
            [
                'name'         => 'Vikram Mehta',
                'company_name' => 'ITC Daily Needs Wholesale',
                'phone'        => '9830298765',
                'email'        => 'mehta@itcagency.example.com',
                'address'      => 'Central Trade Depot, Unit 4',
            ],
            [
                'name'         => 'Sunil Ghosh',
                'company_name' => 'Amul Fresh Dairy Agency',
                'phone'        => '9830398765',
                'email'        => 'sunil@amulagency.example.com',
                'address'      => 'Cold Chain Complex, Sector 2',
            ],
        ];

        $createdSuppliers = [];
        foreach ($suppliers as $sup) {
            $createdSuppliers[] = Supplier::updateOrCreate(
                ['dokan_id' => $dokan->id, 'phone' => $sup['phone']],
                array_merge($sup, ['dokan_id' => $dokan->id, 'added_by' => $owner->id])
            );
        }

        // 8. Create Overhead Costs
        $overheadCosts = [
            ['cost_date' => Carbon::today()->subDays(2)->toDateString(), 'description' => 'Commercial Electricity Bill', 'amount' => 1450.00],
            ['cost_date' => Carbon::today()->subDays(5)->toDateString(), 'description' => 'Store Monthly Rent', 'amount' => 8500.00],
            ['cost_date' => Carbon::today()->subDays(12)->toDateString(), 'description' => 'Packaging Material & Carry Bags', 'amount' => 650.00],
            ['cost_date' => Carbon::today()->subDays(18)->toDateString(), 'description' => 'High-Speed Internet / POS Connection', 'amount' => 899.00],
            ['cost_date' => Carbon::today()->subDays(25)->toDateString(), 'description' => 'Sanitation & Cleaning Supplies', 'amount' => 450.00],
        ];

        foreach ($overheadCosts as $cost) {
            OverheadCost::updateOrCreate(
                ['dokan_id' => $dokan->id, 'cost_date' => $cost['cost_date'], 'description' => $cost['description']],
                array_merge($cost, ['dokan_id' => $dokan->id])
            );
        }

        // 9. Create Investments
        $investments = [
            [
                'investor_name'   => 'Demo Store Owner',
                'amount'          => 200000.00,
                'investment_date' => Carbon::today()->subMonths(6)->toDateString(),
                'payment_method'  => 'Bank Transfer',
                'note'            => 'Initial Store Capital & Inventory Advance',
            ],
            [
                'investor_name'   => 'Store Renovation Partner',
                'amount'          => 50000.00,
                'investment_date' => Carbon::today()->subMonths(2)->toDateString(),
                'payment_method'  => 'UPI / Online',
                'note'            => 'LED Display, Glass Racks & Billing Counter',
            ],
        ];

        foreach ($investments as $inv) {
            Investment::updateOrCreate(
                ['dokan_id' => $dokan->id, 'note' => $inv['note']],
                array_merge($inv, ['dokan_id' => $dokan->id, 'added_by' => $owner->id])
            );
        }

        // 10. Create Orders
        $dbProducts = Product::where('dokan_id', $dokan->id)->get();
        if ($dbProducts->count() > 0 && !empty($createdSuppliers)) {
            $order1 = Order::updateOrCreate(
                ['dokan_id' => $dokan->id, 'order_number' => 'PO-2026-001'],
                [
                    'supplier_id'  => $createdSuppliers[0]->id,
                    'order_date'   => Carbon::today()->subDays(10)->toDateString(),
                    'status'       => 'received',
                    'total_amount' => 5400.00,
                    'notes'        => 'Weekly stock refill - all goods checked and verified.',
                    'added_by'     => $owner->id,
                ]
            );

            OrderItem::firstOrCreate(
                ['order_id' => $order1->id, 'product_id' => $dbProducts[0]->id],
                [
                    'product_name' => $dbProducts[0]->name,
                    'quantity'     => 20,
                    'unit_cost'    => $dbProducts[0]->cost_rate,
                    'total_cost'   => 20 * $dbProducts[0]->cost_rate,
                ]
            );

            $order2 = Order::updateOrCreate(
                ['dokan_id' => $dokan->id, 'order_number' => 'PO-2026-002'],
                [
                    'supplier_id'  => $createdSuppliers[1]->id,
                    'order_date'   => Carbon::today()->subDays(3)->toDateString(),
                    'status'       => 'pending',
                    'total_amount' => 3800.00,
                    'notes'        => 'Order placed via phone, delivery expected tomorrow.',
                    'added_by'     => $owner->id,
                ]
            );

            OrderItem::firstOrCreate(
                ['order_id' => $order2->id, 'product_id' => $dbProducts[1]->id],
                [
                    'product_name' => $dbProducts[1]->name,
                    'quantity'     => 15,
                    'unit_cost'    => $dbProducts[1]->cost_rate,
                    'total_cost'   => 15 * $dbProducts[1]->cost_rate,
                ]
            );
        }

        // 11. Create Realistic Sample Sales for Charts and Sales Table
        $allCustomers = Coustomer::where('dokan_id', $dokan->id)->get();
        
        if ($dbProducts->count() > 0 && Sale::where('dokan_id', $dokan->id)->count() < 15) {
            for ($daysAgo = 28; $daysAgo >= 0; $daysAgo--) {
                $date = Carbon::today()->subDays($daysAgo)->toDateString();
                $salesCountForDay = ($daysAgo % 2 === 0) ? rand(2, 4) : rand(1, 3);

                for ($s = 0; $s < $salesCountForDay; $s++) {
                    $prod = $dbProducts->random();
                    $cust = ($s % 2 === 0 && $allCustomers->count() > 0) ? $allCustomers->random() : null;
                    $qty = rand(1, 4);
                    $rate = $prod->selling_rate;
                    $costRate = $prod->cost_rate;
                    $total = $qty * $rate;
                    $discount = ($daysAgo % 5 === 0) ? rand(5, 20) : 0;
                    $payable = max(0, $total - $discount);

                    // Mix of payment statuses
                    if ($cust && $daysAgo % 4 === 0) {
                        $paymentStatus = Sale::STATUS_CREDIT;
                        $paidAmount = 0;
                        $dueAmount = $payable;
                    } elseif ($cust && $daysAgo % 3 === 0) {
                        $paymentStatus = Sale::STATUS_PARTIALLY_PAID;
                        $paidAmount = round($payable * 0.5, 2);
                        $dueAmount = round($payable - $paidAmount, 2);
                    } else {
                        $paymentStatus = Sale::STATUS_FULL_PAID;
                        $paidAmount = $payable;
                        $dueAmount = 0;
                    }

                    Sale::create([
                        'dokan_id'       => $dokan->id,
                        'sale_date'      => $date,
                        'customer_id'    => $cust?->id,
                        'product_id'     => $prod->id,
                        'qty'            => $qty,
                        'packet_size'    => $prod->packet_size,
                        'rate'           => $rate,
                        'cost_rate'      => $costRate,
                        'discount'       => $discount,
                        'payment_status' => $paymentStatus,
                        'paid_amount'    => $paidAmount,
                        'due_amount'     => $dueAmount,
                    ]);
                }
            }
        }
    }
}
