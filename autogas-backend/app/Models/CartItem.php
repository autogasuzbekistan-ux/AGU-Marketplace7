<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    /**
     * Ma'lumotlar bazasi jadvali
     */
    protected $table = 'cart_items';

    /**
     * Mass assignment uchun ruxsat berilgan ustunlar
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];

    /**
     * Casting - ustunlar uchun ma'lumot turlarini belgilash
     */
    protected $casts = [
        'user_id' => 'integer',
        'product_id' => 'integer',
        'quantity' => 'integer',
    ];

    /**
     * Default qiymatlar
     */
    protected $attributes = [
        'quantity' => 1,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * CartItem foydalanuvchiga tegishli
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * CartItem mahsulotga tegishli
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Jami narxni hisoblash
     */
    public function getTotalPriceAttribute()
    {
        return $this->quantity * $this->product->price;
    }

    /**
     * Miqdorni oshirish
     */
    public function incrementQuantity($amount = 1)
    {
        $this->quantity += $amount;
        $this->save();
    }

    /**
     * Miqdorni kamaytirish
     */
    public function decrementQuantity($amount = 1)
    {
        $this->quantity = max(1, $this->quantity - $amount);
        $this->save();
    }
}