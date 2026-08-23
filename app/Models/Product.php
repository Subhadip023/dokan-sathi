<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'name',
        'description',
        'reorder_level',
        'purchased_packets',
        'packet_size',
        'cost_rate',
        'selling_rate',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'product_id');
    }
}
