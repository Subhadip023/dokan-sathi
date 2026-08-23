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
            ['name' => 'Symphytum', 'desc' => 'Bone fractures, eye injuries, promotes healing'],
            ['name' => 'Calendula', 'desc' => 'Wounds, cuts, antiseptic healing'],
            ['name' => 'Bellis Perennis', 'desc' => 'Deep tissue injuries, post-surgery soreness'],
            ['name' => 'Strontium Carb', 'desc' => 'Chronic joint pain, ankle sprains'],

            // Digestive Issues
            ['name' => 'Nux Vomica', 'desc' => 'Acidity, indigestion, hangover, sedentary life'],
            ['name' => 'Lycopodium', 'desc' => 'Gas, bloating, liver complaints'],
            ['name' => 'Carbo Veg', 'desc' => 'Deep bloating, weakness, corpse reviver'],
            ['name' => 'Colocynthis', 'desc' => 'Abdominal cramps relieved by doubling up'],
            ['name' => 'Ipecac', 'desc' => 'Constant nausea, vomiting, persistent cough'],
            ['name' => 'Hydrastis Can', 'desc' => 'Constipation, catarrh, stomach weakness'],
            ['name' => 'Aloe Soc', 'desc' => 'Diarrhea, urgency, rectal weakness'],
            ['name' => 'Podophyllum', 'desc' => 'Profuse watery diarrhea, liver congestion'],
            ['name' => 'Chelidonium', 'desc' => 'Liver and gallbladder complaints, jaundice'],
            ['name' => 'China Off', 'desc' => 'Weakness after fluid loss, bloating, malaria'],
            ['name' => 'Antimonium Crud', 'desc' => 'Thick white coated tongue, indigestion'],
            ['name' => 'Robinia', 'desc' => 'Severe acidity, heartburn worse at night'],

            // Cold, Fever & Respiratory
            ['name' => 'Aconite Nap', 'desc' => 'Sudden fever, anxiety, fear of death'],
            ['name' => 'Belladonna', 'desc' => 'High fever, red face, throbbing headache'],
            ['name' => 'Gelsemium', 'desc' => 'Dizziness, dullness, flu with shivering'],
            ['name' => 'Pulsatilla', 'desc' => 'Thirstless cold, emotional, thick discharge'],
            ['name' => 'Arsenicum Alb', 'desc' => 'Food poisoning, burning pain, restlessness'],
            ['name' => 'Antim Tart', 'desc' => 'Rattling cough, difficult expectoration'],
            ['name' => 'Eupatorium Perf', 'desc' => 'Bone-breaking pain in fever, dengue like'],
            ['name' => 'Allium Cepa', 'desc' => 'Watery eyes and nose, sneezing'],
            ['name' => 'Drosera', 'desc' => 'Whooping cough, spasmodic cough at night'],
            ['name' => 'Spongia Tosta', 'desc' => 'Croup, barking cough, heart complaints'],
            ['name' => 'Hepar Sulph', 'desc' => 'Abscess, extreme sensitivity to cold'],
            ['name' => 'Sambucus Nig', 'desc' => 'Nasal obstruction in infants, night sweats'],
            ['name' => 'Ars Iod', 'desc' => 'Allergic rhinitis, chronic respiratory issues'],
            ['name' => 'Bromium', 'desc' => 'Laryngeal croup, difficulty breathing'],
            ['name' => 'Phosphorus', 'desc' => 'Burning chest, pneumonia, tall thin patients'],

            // Mind & Nervous System
            ['name' => 'Ignatia Amara', 'desc' => 'Grief, emotional shock, mood swings'],
            ['name' => 'Kali Phos', 'desc' => 'Brain tonic, nerve weakness, insomnia'],
            ['name' => 'Aconite Nap', 'desc' => 'Panic attacks, sudden fear, restlessness'],
            ['name' => 'Coffea Cruda', 'desc' => 'Sleeplessness due to overactive mind'],
            ['name' => 'Passiflora Inc', 'desc' => 'Insomnia, restlessness, nervous exhaustion'],
            ['name' => 'Valeriana', 'desc' => 'Nervous irritability, hysteria, insomnia'],
            ['name' => 'Avena Sativa', 'desc' => 'Nerve tonic, debility, exhaustion'],
            ['name' => 'Stramonium', 'desc' => 'Violent fear, night terrors, stammering'],
            ['name' => 'Zincum Met', 'desc' => 'Restless legs, nervous exhaustion, twitching'],
            ['name' => 'Anacardium', 'desc' => 'Memory weakness, lack of confidence, exam fear'],

            // Skin Conditions
            ['name' => 'Sulphur', 'desc' => 'Itching, skin eruptions, hot feet'],
            ['name' => 'Graphites', 'desc' => 'Eczema, thick skin, constipation'],
            ['name' => 'Thuja Occ', 'desc' => 'Warts, skin tags, sycotic complaints'],
            ['name' => 'Silicea', 'desc' => 'Expelling foreign bodies, brittle nails'],
            ['name' => 'Petroleum', 'desc' => 'Dry cracked skin, eczema worse in winter'],
            ['name' => 'Mezereum', 'desc' => 'Intense itching, thick crusts, shingles'],
            ['name' => 'Natrum Sulph', 'desc' => 'Liver complaints, asthma worse in damp'],
            ['name' => 'Urtica Urens', 'desc' => 'Hives, allergic rash, burns'],
            ['name' => 'Croton Tig', 'desc' => 'Eczema of genitals, vesicular eruptions'],

            // Women & Hormonal
            ['name' => 'Sepia', 'desc' => 'Hormonal imbalance, indifference'],
            ['name' => 'Pulsatilla', 'desc' => 'Irregular periods, emotional sensitivity'],
            ['name' => 'Caulophyllum', 'desc' => 'Uterine weakness, irregular contractions'],
            ['name' => 'Sabina', 'desc' => 'Heavy menstrual bleeding, fibroids'],
            ['name' => 'Lachesis', 'desc' => 'Menopause, hot flushes, left-sided complaints'],
            ['name' => 'Helonias', 'desc' => 'Uterine prolapse, tired women, albuminuria'],
            ['name' => 'Viburnum Op', 'desc' => 'Menstrual cramps, threatened miscarriage'],
            ['name' => 'Cyclamen', 'desc' => 'Menstrual disorders, visual disturbances'],

            // Children
            ['name' => 'Chamomilla', 'desc' => 'Teething issues, extreme irritability'],
            ['name' => 'Cina', 'desc' => 'Worm infestations in children'],
            ['name' => 'Calcarea Carb', 'desc' => 'Fat fair and flabby, bone weakness, slow milestones'],
            ['name' => 'Baryta Carb', 'desc' => 'Delayed development, shy children, tonsils'],
            ['name' => 'Tuberculinum', 'desc' => 'Recurrent colds, restless children, travel desire'],
            ['name' => 'Medorrhinum', 'desc' => 'Hyperactive children, asthma, family history'],
            ['name' => 'Borax', 'desc' => 'Mouth ulcers, fear of downward motion, infants'],

            // Heart & Circulation
            ['name' => 'Crataegus', 'desc' => 'Heart tonic, weak heart, hypertension'],
            ['name' => 'Digitalis', 'desc' => 'Slow weak pulse, heart failure symptoms'],
            ['name' => 'Spigelia', 'desc' => 'Left-sided headache, heart palpitations'],
            ['name' => 'Cactus Grand', 'desc' => 'Constricting chest pain, heart complaints'],
            ['name' => 'Aurum Met', 'desc' => 'Hypertension, depression, heart disease'],
            ['name' => 'Baryta Mur', 'desc' => 'Arteriosclerosis, high blood pressure elderly'],

            // Urinary & Kidney
            ['name' => 'Berberis Vulg', 'desc' => 'Kidney stones, urinary tract pain'],
            ['name' => 'Cantharis', 'desc' => 'Urinary burning, scalds and burns'],
            ['name' => 'Lycopodium', 'desc' => 'Right kidney stones, red sand in urine'],
            ['name' => 'Uva Ursi', 'desc' => 'Cystitis, burning urination, blood in urine'],
            ['name' => 'Pareira Brava', 'desc' => 'Kidney stones, severe straining urination'],
            ['name' => 'Ocimum Can', 'desc' => 'Uric acid stones, brick red sediment'],

            // Biochemic Salts
            ['name' => 'Calcarea Fluor', 'desc' => 'Varicose veins, bone spurs, relaxed ligaments'],
            ['name' => 'Calcarea Phos', 'desc' => 'Bone weakness, growing pains, anemia'],
            ['name' => 'Calcarea Sulph', 'desc' => 'Slow healing wounds, suppurating conditions'],
            ['name' => 'Ferrum Phos', 'desc' => 'First stage of inflammation, anemia'],
            ['name' => 'Kali Mur', 'desc' => 'Second stage of inflammation, white discharges'],
            ['name' => 'Kali Sulph', 'desc' => 'Third stage, yellow discharges, skin conditions'],
            ['name' => 'Mag Phos', 'desc' => 'Muscle cramps, neuralgic pain, spasms'],
            ['name' => 'Natrum Mur', 'desc' => 'Chronic headache, salt craving, sun pain'],
            ['name' => 'Natrum Phos', 'desc' => 'Acidity, excess lactic acid, worms'],
            ['name' => 'Natrum Sulph', 'desc' => 'Liver complaints, asthma, watery secretions'],
            ['name' => 'Silicea', 'desc' => 'Lack of confidence, slow healing, expels splinters'],

            // Mother Tinctures (Q only)
            ['name' => 'Withania Somnifera', 'desc' => 'Adaptogen, stress, energy, immunity', 'potencies' => ['Q']],
            ['name' => 'Alfalfa', 'desc' => 'General tonic, weight gain, appetite stimulant', 'potencies' => ['Q']],
            ['name' => 'Ginkgo Biloba', 'desc' => 'Memory, circulation, vertigo', 'potencies' => ['Q']],
            ['name' => 'Hydrastis Can', 'desc' => 'Anticancer tonic, mucous membrane healer', 'potencies' => ['Q']],
            ['name' => 'Phytolacca', 'desc' => 'Throat pain, mastitis, rheumatism', 'potencies' => ['Q']],
            ['name' => 'Sabal Serr', 'desc' => 'Prostate enlargement, urinary issues men', 'potencies' => ['Q']],
            ['name' => 'Sanguinaria Can', 'desc' => 'Right-sided migraine, menopause issues', 'potencies' => ['Q']],
            ['name' => 'Staphysagria', 'desc' => 'Suppressed anger, post-surgery pain', 'potencies' => ['Q']],
            ['name' => 'Thuja Occ', 'desc' => 'Warts, skin tags, anti-sycotic', 'potencies' => ['Q']],
            ['name' => 'Echinacea', 'desc' => 'Immunity booster, septic conditions', 'potencies' => ['Q']],
        ];

        $defaultPotencies = ['30CH', '200CH', '1M', 'Q'];

        foreach ($medicines as $med) {
            $potencies = $med['potencies'] ?? $defaultPotencies;
            foreach ($potencies as $potency) {
                $costRate = rand(50, 300);
                $sellingRate = $costRate + rand(20, 100);
                \App\Models\Product::create([
                    'name'              => $med['name'] . ' ' . $potency,
                    'description'       => $med['desc'],
                    'purchased_packets' => rand(5, 60),
                    'packet_size'       => 1,
                    'cost_rate'         => $costRate,
                    'selling_rate'      => $sellingRate,
                    'reorder_level'     => rand(5, 15),
                    'dokan_id'          => 1,
                ]);
            }
        }
    }
}

// php artisan db:seed --class=ProductSeeder