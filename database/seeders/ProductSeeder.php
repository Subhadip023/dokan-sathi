<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $medicines = [
            // Pain & Injuries
            ['name' => 'Arnica Montana', 'desc' => 'Injuries, bruising, muscle soreness'],
            ['name' => 'Rhus Tox', 'desc' => 'Joint pain, stiffness, worse in cold weather'],
            ['name' => 'Bryonia Alba', 'desc' => 'Joint pain aggravated by movement, dry cough'],
            ['name' => 'Hypericum', 'desc' => 'Nerve injuries, sharp shooting pain'],
            ['name' => 'Ruta Grav', 'desc' => 'Sprains, tendon injuries, eye strain'],
            ['name' => 'Ledum Pal', 'desc' => 'Puncture wounds, insect bites, gout'],

            // Digestive Issues
            ['name' => 'Nux Vomica', 'desc' => 'Acidity, indigestion, hangover, sedentary life'],
            ['name' => 'Lycopodium', 'desc' => 'Gas, bloating, liver complaints'],
            ['name' => 'Carbo Veg', 'desc' => 'Deep bloating, weakness, "corpse reviver"'],
            ['name' => 'Colocynthis', 'desc' => 'Abdominal cramps relieved by doubling up'],
            ['name' => 'Ipecac', 'desc' => 'Constant nausea, vomiting, persistent cough'],
            ['name' => 'Hydrastis Can', 'desc' => 'Constipation, catarrh, stomach weakness'],

            // Cold, Fever & Respiratory
            ['name' => 'Aconite Nap', 'desc' => 'Sudden fever, anxiety, fear of death'],
            ['name' => 'Belladonna', 'desc' => 'High fever, red face, throbbing headache'],
            ['name' => 'Gelsemium', 'desc' => 'Dizziness, dullness, flu with shivering'],
            ['name' => 'Pulsatilla', 'desc' => 'Thirstless cold, emotional, thick discharge'],
            ['name' => 'Arsenicum Alb', 'desc' => 'Food poisoning, burning pain, restlessness'],
            ['name' => 'Antim Tart', 'desc' => 'Rattling cough, difficult expectoration'],
            ['name' => 'Eupatorium Perf', 'desc' => 'Bone-breaking pain in fever (Dengue like)'],
            ['name' => 'Allium Cepa', 'desc' => 'Watery eyes and nose, sneezing'],

            // Mind & Skin
            ['name' => 'Ignatia Amara', 'desc' => 'Grief, emotional shock, mood swings'],
            ['name' => 'Sulphur', 'desc' => 'Itching, skin eruptions, hot feet'],
            ['name' => 'Graphites', 'desc' => 'Eczema, thick skin, constipation'],
            ['name' => 'Thuja Occ', 'desc' => 'Warts, skin tags, sycotic complaints'],
            ['name' => 'Hepar Sulph', 'desc' => 'Abscess, extreme sensitivity to cold'],
            ['name' => 'Silicea', 'desc' => 'Expelling foreign bodies, brittle nails'],

            // Special & Biochemic
            ['name' => 'Calcarea Carb', 'desc' => 'Fat, fair and flabby, bone weakness'],
            ['name' => 'Calcarea Fluor', 'desc' => 'Varicose veins, bone spurs'],
            ['name' => 'Ferrum Phos', 'desc' => 'First stage of inflammation, anemia'],
            ['name' => 'Kali Phos', 'desc' => 'Brain tonic, nerve weakness, insomnia'],
            ['name' => 'Mag Phos', 'desc' => 'Muscle cramps, neuralgic pain'],
            ['name' => 'Natrum Mur', 'desc' => 'Chronic headache, salt craving, sun pain'],

            // Mother Tinctures / Others
            ['name' => 'Berberis Vulg', 'desc' => 'Kidney stones, urinary tract pain'],
            ['name' => 'Cantharis', 'desc' => 'Urinary burning, scalds and burns'],
            ['name' => 'Cina', 'desc' => 'Worm infestations in children'],
            ['name' => 'Chamomilla', 'desc' => 'Teething issues, extreme irritability'],
            ['name' => 'Sanguinaria', 'desc' => 'Right-sided migraine, menopause issues'],
            ['name' => 'Sepia', 'desc' => 'Hormonal imbalance, indifference'],
            ['name' => 'Spigelia', 'desc' => 'Left-sided headache, heart palpitations'],
            ['name' => 'Staphysagria', 'desc' => 'Suppressed anger, post-surgery pain'],
        ];

        $potencies = ['30CH', '200CH', '1M', 'Q'];

        foreach ($medicines as $med) {
            foreach ($potencies as $potency) {
                \App\Models\Product::create([
                    'name' => $med['name'] . ' ' . $potency,
                    'description' => $med['desc'],
                    'price' => rand(95, 450),
                    'quantity' => rand(5, 60),
                ]);
            }


        }
    }
}
