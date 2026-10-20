<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;

return new class extends Migration
{
    public function up(): void
    {
        // Only seed if no active products exist
        if (Product::count() > 0) {
            return;
        }

        $items = [
            [
                'category_id' => 1,
                'name_en' => 'SHEIN Elegant Pleated Satin Midi Dress',
                'name_ar' => 'فستان ستان ميدي بليسيه أنيق من شي إن',
                'slug' => 'shein-elegant-pleated-satin-midi-dress',
                'description_en' => 'Luxurious satin midi dress featuring fine accordion pleating, a tasteful square neckline, and a flattering cinch waist. Perfect for dinners, engagements, and formal gatherings.',
                'description_ar' => 'فستان ميدي فاخر مصنوع من الستان الفاخر بتكسيرات بليسيه ناعمة وقصة رقبة مربعة راقية وخصر محدد يبرز القوام. مثالي للمناسبات والعشاء والسهرات.',
                'selling_price' => 1450,
                'discount_price' => 1190,
                'cost_price' => 750,
                'sizes' => ['S', 'M', 'L', 'XL'],
                'colors' => ['Champagne Gold', 'Emerald Green', 'Soft Rose', 'Midnight Black'],
                'stock_quantity' => 8,
                'is_available' => true,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => 2,
                'name_en' => 'SHEIN MOTF Tailored Double-Breasted Blazer',
                'name_ar' => 'بليزر رسمي دبل بريست من تشكيلة MOTF',
                'slug' => 'shein-motf-tailored-double-breasted-blazer',
                'description_en' => 'High-end tailored double-breasted blazer from the premium MOTF line with peaked lapels and horn-effect buttons.',
                'description_ar' => 'بليزر رسمي فاخر بصفين أزرار من خط MOTF الفاخر بياقة مدببة وقصة محددة وأزرار بلون مميز.',
                'selling_price' => 1850,
                'discount_price' => 1550,
                'cost_price' => 980,
                'sizes' => ['S', 'M', 'L'],
                'colors' => ['Onyx Black', 'Oatmeal Beige', 'Rich Camel'],
                'stock_quantity' => 5,
                'is_available' => true,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => 1,
                'name_en' => 'SHEIN Floral Tiered Bohemian Maxi Dress',
                'name_ar' => 'فستان ماكسي فلورال بوهيمي بطبقات متعددة',
                'slug' => 'shein-floral-tiered-bohemian-maxi-dress',
                'description_en' => 'Breezy multi-tiered chiffon maxi dress with delicate vintage floral print, balloon sleeves, and elasticated smocked bodice.',
                'description_ar' => 'فستان ماكسي بطبقات كشكش من الشيفون بطبعة زهور كلاسيكية ناعمة وأكمام منفوخة مريحة تناسب الخروجات.',
                'selling_price' => 1350,
                'discount_price' => null,
                'cost_price' => 690,
                'sizes' => ['M', 'L', 'XL'],
                'colors' => ['Terracotta Floral', 'Sage Green Floral'],
                'stock_quantity' => 12,
                'is_available' => true,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => 2,
                'name_en' => 'SHEIN Silk Touch Bow-Tie Neck Blouse',
                'name_ar' => 'بلوزة ناعمة بربطة عنق شيك ملمس الحرير',
                'slug' => 'shein-silk-touch-bow-tie-neck-blouse',
                'description_en' => 'Fluid silk-touch blouse featuring a versatile pussy-bow necktie and subtle gathered shoulders.',
                'description_ar' => 'بلوزة حريرية ناعمة بانسيابية عالية بربطة عنق أنيقة تمنحك إطلالة راقية للعمل والجامعة والمناسبات.',
                'selling_price' => 890,
                'discount_price' => 740,
                'cost_price' => 420,
                'sizes' => ['S', 'M', 'L', 'XL'],
                'colors' => ['Royal Cobalt', 'Ivory Pearl', 'Emerald Deep'],
                'stock_quantity' => 15,
                'is_available' => true,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => 4,
                'name_en' => 'SHEIN Modest Linen Open Front Kimono & Slip Set',
                'name_ar' => 'طقم كيمونو كتان مفتوح مع فستان داخلي محتشم',
                'slug' => 'shein-modest-linen-open-front-kimono-slip-set',
                'description_en' => 'Two-piece modest ensemble comprising an airy open-front linen-blend kimono and a coordinated sleeveless maxi inner slip.',
                'description_ar' => 'طقم محتشم من قطعتين يشمل كيمونو مفتوح من خامة الكتان الصيفي مع فستان ماكسي داخلي مريح بدون أكمام.',
                'selling_price' => 1950,
                'discount_price' => 1690,
                'cost_price' => 1050,
                'sizes' => ['Free Size (38-46)'],
                'colors' => ['Desert Sage', 'Dusty Rose', 'Neutral Sand'],
                'stock_quantity' => 6,
                'is_available' => true,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
            ],
        ];

        // Ensure category 1, 2, 4 exist
        $firstCatId = Category::first()?->id ?? 1;

        foreach ($items as $data) {
            $imageUrl = $data['image'];
            unset($data['image']);

            // Fallback category if category_id does not exist
            if (!Category::where('id', $data['category_id'])->exists()) {
                $data['category_id'] = $firstCatId;
            }

            $product = Product::create($data);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $imageUrl,
                'sort_order' => 1,
                'is_primary' => true,
            ]);
        }
    }

    public function down(): void
    {
        // Keep data on rollback
    }
};
