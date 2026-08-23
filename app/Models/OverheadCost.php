<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OverheadCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'dokan_id',
        'cost_date',
        'description',
        'amount',
    ];

    protected $casts = [
        'cost_date' => 'date:Y-m-d',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the dokan that owns the overhead cost.
     */
    public function dokan(): BelongsTo
    {
        return $this->belongsTo(Dokan::class);
    }
}
