<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'investor_name',
        'amount',
        'investment_date',
        'payment_method',
        'note',
        'added_by',
        'edited_by',
    ];

    protected $casts = [
        'investment_date' => 'date',
        'amount' => 'decimal:2',
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
}
