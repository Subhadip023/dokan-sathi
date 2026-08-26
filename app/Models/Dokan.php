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
        'slug',
        'description',
        'location',
        'phone',
        'email',
        'logo',
        'owner_id',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($dokan) {
            if (empty($dokan->slug)) {
                $baseSlug = \Illuminate\Support\Str::slug($dokan->name) ?: 'dokan';
                $slug = $baseSlug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $count++;
                }
                $dokan->slug = $slug;
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function products(){
        return $this->hasMany(Product::class,'dokan_id');
    }

    public function coustomers(){
        return $this->hasMany(Coustomer::class, 'dokan_id');
    }

    public function sales(){
        return $this->hasMany(Sale::class, 'dokan_id');
    }

    public function staff(){
        return $this->hasMany(User::class, 'dokan_id');
    }
}
