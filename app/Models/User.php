<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    const ROLE_ADMIN = 1;
    const ROLE_EMPLOYEE = 2;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'dokan_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'integer',
        ];
    }

    public function isOwner(): bool
    {
        return (int) ($this->role ?? self::ROLE_ADMIN) === self::ROLE_ADMIN;
    }

    public function isEmployee(): bool
    {
        return (int) $this->role === self::ROLE_EMPLOYEE;
    }

    public function currentDokan()
    {
        if ($this->isOwner()) {
            return $this->dokans()->first() ?? $this->dokan;
        }
        return $this->dokan;
    }

    public function dokan()
    {
        return $this->belongsTo(Dokan::class, 'dokan_id');
    }

    public function dokans()
    {
        return $this->hasMany(Dokan::class, 'owner_id');
    }
}
