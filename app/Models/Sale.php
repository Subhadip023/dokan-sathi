<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\SaleFactory> */
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'sale_date',
        'customer_id',
        'product_id',
        'qty',
        'packet_size',
        'rate',
        'cost_rate',
        'discount',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function customer()
    {
        return $this->belongsTo(Coustomer::class, 'customer_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // qty is stored in PACKETS. rate & cost_rate are price PER PACKET.
    // total_amount = (packets * rate_per_packet) - discount
    public function getTotalAmountAttribute(): float
    {
        $amount = ($this->qty * $this->rate) - $this->discount;
        return max(0, round($amount, 2));
    }

    // profit = revenue - cost
    public function getProfitAttribute(): float
    {
        $revenue = ($this->qty * $this->rate) - $this->discount;
        $cost    = $this->qty * $this->cost_rate;
        return round($revenue - $cost, 2);
    }

    // Pieces equivalent (for display)
    public function getTotalPiecesAttribute(): int
    {
        return $this->qty * $this->packet_size;
    }
}
