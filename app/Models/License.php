<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'name',
        'number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }
}
