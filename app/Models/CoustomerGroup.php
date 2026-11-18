<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoustomerGroup extends Model
{
    use HasFactory;

    // Discount Type constants (TinyInt)
    const TYPE_PERCENTAGE = 1; // % Discount off standard selling rate (e.g. 10%)
    const TYPE_FIXED      = 2; // Flat ₹ Discount off standard selling rate (e.g. ₹10)
    const TYPE_COST_PLUS  = 3; // Cost Price + Transportation/Handling Fee (e.g. Cost + ₹5)

    protected $fillable = [
        'dokan_id',
        'name',
        'discount_type',
        'discount_value',
        'is_active',
    ];

    protected $casts = [
        'discount_type'  => 'integer',
        'discount_value' => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function coustomers()
    {
        return $this->hasMany(Coustomer::class, 'coustomer_group_id');
    }

    /**
     * Human-readable label for discount type.
     */
    public function getDiscountTypeLabelAttribute(): string
    {
        return match ($this->discount_type) {
            self::TYPE_PERCENTAGE => 'Percentage (%)',
            self::TYPE_FIXED      => 'Flat Discount (₹)',
            self::TYPE_COST_PLUS  => 'Cost + Transport (₹)',
            default               => 'Standard',
        };
    }

    /**
     * Compute effective price given a product cost_rate and selling_rate.
     */
    public function calculateSellingPrice(float $costRate, float $sellingRate): float
    {
        if (!$this->is_active) {
            return $sellingRate;
        }

        return match ($this->discount_type) {
            self::TYPE_PERCENTAGE => max(0, round($sellingRate - ($sellingRate * ($this->discount_value / 100)), 2)),
            self::TYPE_FIXED      => max(0, round($sellingRate - $this->discount_value, 2)),
            self::TYPE_COST_PLUS  => max(0, round($costRate + $this->discount_value, 2)),
            default               => $sellingRate,
        };
    }
}
