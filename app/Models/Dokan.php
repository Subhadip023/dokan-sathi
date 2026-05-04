<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dokan extends Model
{
    /** @use HasFactory<\Database\Factories\DokanFactory> */
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'location',
        'owner_id',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function products(){
        return $this->hasMany(Product::class,'dokan_id');
    }
}
