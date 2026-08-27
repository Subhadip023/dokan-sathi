<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'supplier_id',
        'order_number',
        'order_date',
        'status',
        'total_amount',
        'notes',
        'added_by',
        'edited_by',
    ];

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function editedBy()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }
}
