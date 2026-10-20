<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'whatsapp_number',
        'tiktok_username',
        'instagram_username',
        'source_platform',
    ];

    // Relationships

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    // Accessors

    public function getTotalOrdersAttribute(): int
    {
        return $this->orders()->count();
    }

    /**
     * Get the contact link based on the customer's source platform.
     */
    public function getContactLinkAttribute(): ?string
    {
        return match ($this->source_platform) {
            'whatsapp' => $this->whatsapp_number
                ? 'https://wa.me/' . preg_replace('/[^0-9]/', '', $this->whatsapp_number)
                : null,
            'instagram' => $this->instagram_username
                ? 'https://ig.me/m/' . ltrim($this->instagram_username, '@')
                : null,
            'tiktok' => $this->tiktok_username
                ? 'https://www.tiktok.com/@' . ltrim($this->tiktok_username, '@')
                : null,
            default => null,
        };
    }

    /**
     * Build a contact link with a prefilled message for WhatsApp.
     */
    public function getContactLinkWithMessage(string $message = ''): ?string
    {
        if ($this->source_platform === 'whatsapp' && $this->whatsapp_number) {
            $number = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
            $encoded = urlencode($message);
            return "https://wa.me/{$number}?text={$encoded}";
        }
        return $this->contact_link;
    }
}
