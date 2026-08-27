<?php

namespace Database\Seeders;

use App\Models\Coustomer;
use App\Models\Dokan;
use App\Models\License;
use App\Models\Product;
use App\Models\User;
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
    }
}
