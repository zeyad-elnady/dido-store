<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'customer_id',
        'status',
        'subtotal',
        'shipping_fee',
        'customs_fee',
        'discount_amount',
        'total',
        'shipping_address',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'customs_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    // Constants
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_ORDERED_FROM_SHEIN = 'ordered_from_shein';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_ORDERED_FROM_SHEIN,
        self::STATUS_SHIPPED,
        self::STATUS_DELIVERED,
        self::STATUS_CANCELLED,
    ];

    // Relationships

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function customsFeeHistory(): HasMany
    {
        return $this->hasMany(CustomsFeeHistory::class)->orderBy('created_at', 'desc');
    }

    // Accessors

    /**
     * Calculate remaining balance: total - sum of verified deposits.
     */
    public function getRemainingBalanceAttribute(): float
    {
        $verifiedDeposits = $this->deposits()
            ->where('status', 'verified')
            ->sum('amount');

        return max(0, (float) $this->total - (float) $verifiedDeposits);
    }

    /**
     * Sum of verified deposits for this order.
     */
    public function getVerifiedDepositsAmountAttribute(): float
    {
        return (float) $this->deposits()
            ->where('status', 'verified')
            ->sum('amount');
    }

    /**
     * Recalculate the order total from components.
     */
    public function recalculateTotal(): void
    {
        $this->total = (float) $this->subtotal
            + (float) $this->shipping_fee
            + (float) $this->customs_fee
            - (float) $this->discount_amount;
        $this->save();
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $lastOrder = self::withTrashed()->orderBy('id', 'desc')->first();
        $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
        return 'DIDO-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if contact button should be shown.
     */
    public function canContactCustomer(): bool
    {
        return in_array($this->status, [self::STATUS_SHIPPED, self::STATUS_DELIVERED]);
    }
}
