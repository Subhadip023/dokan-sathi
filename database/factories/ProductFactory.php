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

        return [
            'name' => $this->faker->randomElement($remedies) . ' ' . $this->faker->randomElement($potencies),
            'description' => $this->faker->realText(50),
            'price' => $this->faker->randomFloat(2, 85, 450),
            'quantity' => $this->faker->numberBetween(5, 50),
        ];
    }

}
