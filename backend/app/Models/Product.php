<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'selling_price',
        'discount_price',
        'cost_price',
        'sizes',
        'colors',
        'stock_quantity',
        'is_available',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'selling_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'sizes' => 'array',
            'colors' => 'array',
            'stock_quantity' => 'integer',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    // Relationships

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Accessors

    public function getEffectivePriceAttribute(): float
    {
        return $this->discount_price && $this->discount_price < $this->selling_price
            ? (float) $this->discount_price
            : (float) $this->selling_price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->discount_price !== null
            && (float) $this->discount_price < (float) $this->selling_price;
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->is_on_sale) {
            return null;
        }
        return (int) round((1 - $this->discount_price / $this->selling_price) * 100);
    }
}
