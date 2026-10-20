<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Category;

return new class extends Migration
{
    public function up(): void
    {
        $categoryImages = [
            'dresses' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
            'dresses-gowns' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
            'tops-blouses' => 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
            'pants-jeans' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
            'abayas-modest' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
            'modest-fashion' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
            'accessories' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
            'bags-accessories' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
            'bags' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
            'blazers-co-ords' => 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
        ];

        foreach ($categoryImages as $slug => $imageUrl) {
            Category::where('slug', $slug)
                ->where(function ($query) {
                    $query->whereNull('image_path')->orWhere('image_path', '');
                })
                ->update(['image_path' => $imageUrl]);
        }
    }

    public function down(): void
    {
        // No-op
    }
};
