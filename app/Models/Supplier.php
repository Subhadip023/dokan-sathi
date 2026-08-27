<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'name',
        'company_name',
        'phone',
        'email',
        'address',
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
}
