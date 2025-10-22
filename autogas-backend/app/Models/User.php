<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'region',
        'managed_by',
        'is_active',
        'balance',                  // ← YANGI
        'warehouse_address',        // ← YANGI
        'warehouse_capacity',       // ← YANGI
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'balance' => 'decimal:2',
        'warehouse_capacity' => 'integer',
    ];
    /**
     * Products added by this seller
    */
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }
 
    /**
     * Check if user is Owner
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if user is Admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is Kontragent (Magazine worker)
     */
    public function isKontragent(): bool
    {
        return $this->role === 'kontragent';
    }

    /**
     * Check if user is Customer
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user has permission to access something
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }

    /**
     * Get all kontragents managed by this admin
     */
    public function kontragents()
    {
        return $this->hasMany(User::class, 'managed_by', 'id')
            ->where('role', 'kontragent');
    }

    /**
     * Get all activity logs for this user
     */
    public function activities()
    {
        return $this->hasMany(ActivityLog::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get recent activities
     */
    public function recentActivities(int $limit = 10)
    {
        return $this->activities()->limit($limit)->get();
    }

    /**
     * Log activity
     */
    public function logActivity(string $action, array $data = [])
    {
        return ActivityLog::create([
            'user_id' => $this->id,
            'action' => $action,
            'model_type' => $data['model_type'] ?? null,
            'model_id' => $data['model_id'] ?? null,
            'changes' => $data['changes'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all orders for this user
     */
    public function orders()
    {
        return $this->hasMany(Order::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get all cart items for this user
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get all reviews by this user
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get user's wishlist
     */
    public function wishlist()
    {
        return $this->hasMany(Wishlist::class);
    }
}