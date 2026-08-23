<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $remedies = [
            'Arnica Montana',
            'Nux Vomica',
            'Belladonna',
            'Aconite',
            'Lycopodium',
            'Bryonia Alba',
            'Rhus Tox',
            'Gelsemium',
            'Pulsatilla',
            'Sulphur',
            'Calcarea Carb',
            'Silicea',
            'Arsenicum Album',
            'Thuja Occidentalis',
            'Cantharis',
            'Hypericum',
            'Ledum Pal',
            'Ignatia Amara'
        ];

        $potencies = ['6CH', '30CH', '200CH', '1M', '10M', 'Q (Mother Tincture)', '6X', '12X'];

        $costRate = $this->faker->randomFloat(2, 50, 300);
        $sellingRate = $costRate + $this->faker->randomFloat(2, 10, 100);

        return [
            'name' => $this->faker->randomElement($remedies) . ' ' . $this->faker->randomElement($potencies),
            'description' => $this->faker->realText(50),
            'reorder_level' => $this->faker->numberBetween(2, 10),
            'purchased_packets' => $this->faker->numberBetween(5, 50),
            'packet_size' => $this->faker->randomElement([1, 5, 10, 20]),
            'cost_rate' => $costRate,
            'selling_rate' => $sellingRate,
        ];
    }

}
