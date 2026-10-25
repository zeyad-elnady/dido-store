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
     * Enforces the business rule that remaining balance is never zero unless officially delivered.
     */
    public function getRemainingBalanceAttribute(): float
    {
        $verifiedDeposits = (float) $this->deposits()
            ->where('status', 'verified')
            ->sum('amount');

        $remaining = (float) $this->total - $verifiedDeposits;

        // In Dido Store, customers only pay a 50% deposit upfront.
        // The remaining 50% is always collected upon delivery (COD).
        // Unless the order is officially marked DELIVERED or CANCELLED, remaining due is NEVER zero.
        if ($this->status !== self::STATUS_DELIVERED && $this->status !== self::STATUS_CANCELLED) {
            if ($remaining <= 0) {
                $standardDeposit = round((float) $this->total * 0.5, 2);
                return max(1.0, (float) $this->total - $standardDeposit);
            }
        }

        return max(0.0, round($remaining, 2));
    }

    /**
     * Sum of verified deposits for this order.
     * Caps verified deposit calculation for active orders to prevent accidental zero remaining balance.
     */
    public function getVerifiedDepositsAmountAttribute(): float
    {
        $sum = (float) $this->deposits()
            ->where('status', 'verified')
            ->sum('amount');

        if ($this->status !== self::STATUS_DELIVERED && $this->status !== self::STATUS_CANCELLED) {
            $maxDownPayment = round((float) $this->total * 0.5, 2);
            if ($sum > $maxDownPayment) {
                return $maxDownPayment;
            }
        }

        return round($sum, 2);
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
