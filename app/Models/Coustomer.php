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
        'email',
        'shop_name',
        'added_by',
        'edited_by',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function editedBy()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'customer_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }
}
