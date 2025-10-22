<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'changes',
        'ip_address',
        'user_agent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'changes' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get human-readable action description
     */
    public function getDescriptionAttribute(): string
    {
        $descriptions = [
            'login' => 'Tizimga kirdi',
            'logout' => 'Tizimdan chiqdi',
            'created_admin' => 'Yangi admin yaratdi',
            'updated_admin' => 'Adminni tahrirladi',
            'deactivated_admin' => 'Adminni blokladi',
            'activated_admin' => 'Adminni faollashtirdi',
            'created_kontragent' => 'Yangi kontragent qo\'shdi',
            'updated_kontragent' => 'Kontragentni tahrirladi',
            'created_product' => 'Yangi mahsulot qo\'shdi',
            'updated_product' => 'Mahsulotni tahrirladi',
            'deleted_product' => 'Mahsulotni o\'chirdi',
            'created_order' => 'Yangi buyurtma yaratdi',
            'updated_order' => 'Buyurtmani yangiladi',
            'completed_order' => 'Buyurtmani tugatdi',
            'cancelled_order' => 'Buyurtmani bekor qildi',
        ];

        return $descriptions[$this->action] ?? $this->action;
    }

    /**
     * Scope: Filter by action type
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }

    /**
     * Scope: Recent activities
     */
    public function scopeRecent($query, int $limit = 50)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}