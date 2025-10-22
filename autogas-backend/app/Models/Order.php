<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'orders';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'address',
        'region',
        'total_price',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Default attribute values.
     */
    protected $attributes = [
        'status' => 'new',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that placed the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the order.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include orders with a specific status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include new orders.
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope a query to only include completed orders.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the status in Uzbek.
     */
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'new' => 'Yangi',
            'processing' => 'Tayyorlanmoqda',
            'shipped' => 'Yo\'lda',
            'delivered' => 'Yetkazildi',
            'cancelled' => 'Bekor qilindi',
            default => 'Noma\'lum',
        };
    }

    /**
     * Get the formatted total price.
     */
    public function getFormattedTotalAttribute()
    {
        return '$' . number_format($this->total_price, 2);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled()
    {
        return !in_array($this->status, ['delivered', 'cancelled']);
    }

    /**
     * Check if order is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'delivered';
    }
}