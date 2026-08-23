<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coustomer extends Model
{
    /** @use HasFactory<\Database\Factories\CoustomerFactory> */
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'name',
        'phone',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'customer_id');
    }
}
