<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Deposit;
use App\Models\Setting;
use App\Models\FounderProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin User ──────────────────────────────────────────────
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@didostore.com',
            'password' => Hash::make('password123'),
        ]);

        // ── Founder Profile ─────────────────────────────────────────
        FounderProfile::create([
            'company_name_en' => 'Dido Store Egypt',
            'company_name_ar' => 'ديدو ستور مصر',
            'founder_name_en' => 'Dalia (Dido)',
            'founder_name_ar' => 'داليا (ديدو)',
            'bio_en' => "Dalia is the owner of Dido Store Egypt. She personally handpicks every authentic SHEIN piece with a refined eye for contemporary fashion, making international chic accessible to women across Egypt with transparent pricing and doorstep delivery.",
            'bio_ar' => "داليا هي صاحبة متجر ديدو ستور والرؤية العصرية وراء كل قطعة. تختار بنفسها أرقى تصاميم شي إن الأصلية لتمنحكِ تجربة تسوق مريحة وأنيقة، مع دفع محلي سهل وتوصيل سريع لباب منزلكِ في جميع أنحاء مصر.",
            'photo_path' => '/dalia-founder.jpg',
        ]);

        // ── Categories ──────────────────────────────────────────────
        $categories = [
            ['name_en' => 'Dresses', 'name_ar' => 'فساتين', 'slug' => 'dresses', 'sort_order' => 1],
            ['name_en' => 'Tops & Blouses', 'name_ar' => 'بلوزات وتوبات', 'slug' => 'tops-blouses', 'sort_order' => 2],
            ['name_en' => 'Pants & Jeans', 'name_ar' => 'بنطلونات وجينز', 'slug' => 'pants-jeans', 'sort_order' => 3],
            ['name_en' => 'Abayas & Modest', 'name_ar' => 'عبايات ومحتشم', 'slug' => 'abayas-modest', 'sort_order' => 4],
            ['name_en' => 'Accessories', 'name_ar' => 'إكسسوارات', 'slug' => 'accessories', 'sort_order' => 5],
            ['name_en' => 'Bags', 'name_ar' => 'شنط', 'slug' => 'bags', 'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            Category::create(array_merge($cat, ['is_active' => true]));
        }

        // ── Products ────────────────────────────────────────────────
        $products = [
            [
                'category_id' => 1, 'name_en' => 'Elegant Floral Midi Dress', 'name_ar' => 'فستان ميدي زهور أنيق',
                'slug' => 'elegant-floral-midi-dress', 'description_en' => 'A beautiful floral midi dress perfect for any occasion. Made with lightweight fabric for comfort.',
                'description_ar' => 'فستان ميدي بطباعة زهور جميلة مناسب لأي مناسبة. مصنوع من قماش خفيف للراحة.',
                'selling_price' => 850, 'discount_price' => 680, 'cost_price' => 350,
                'sizes' => ['S', 'M', 'L', 'XL'], 'colors' => ['Black', 'Navy', 'Burgundy'],
                'stock_quantity' => 15, 'is_available' => true, 'is_featured' => true,
            ],
            [
                'category_id' => 1, 'name_en' => 'Satin Slip Dress', 'name_ar' => 'فستان ساتان',
                'slug' => 'satin-slip-dress', 'description_en' => 'Luxurious satin slip dress with adjustable straps.',
                'description_ar' => 'فستان ساتان فاخر بأحزمة قابلة للتعديل.',
                'selling_price' => 920, 'discount_price' => null, 'cost_price' => 400,
                'sizes' => ['S', 'M', 'L'], 'colors' => ['Champagne', 'Black', 'Emerald'],
                'stock_quantity' => 8, 'is_available' => true, 'is_featured' => true,
            ],
            [
                'category_id' => 2, 'name_en' => 'Oversized Linen Blouse', 'name_ar' => 'بلوزة كتان أوفرسايز',
                'slug' => 'oversized-linen-blouse', 'description_en' => 'Breathable linen blouse with a relaxed fit.',
                'description_ar' => 'بلوزة كتان بتصميم واسع ومريح.',
                'selling_price' => 450, 'discount_price' => 360, 'cost_price' => 180,
                'sizes' => ['S', 'M', 'L', 'XL'], 'colors' => ['White', 'Beige', 'Light Blue'],
                'stock_quantity' => 25, 'is_available' => true, 'is_featured' => false,
            ],
            [
                'category_id' => 2, 'name_en' => 'Ribbed Crop Top', 'name_ar' => 'كروب توب ريبد',
                'slug' => 'ribbed-crop-top', 'description_en' => 'Trendy ribbed crop top for casual outfits.',
                'description_ar' => 'كروب توب ريبد عصري للإطلالات الكاجوال.',
                'selling_price' => 280, 'discount_price' => null, 'cost_price' => 120,
                'sizes' => ['S', 'M', 'L'], 'colors' => ['Black', 'White', 'Pink', 'Grey'],
                'stock_quantity' => 30, 'is_available' => true, 'is_featured' => false,
            ],
            [
                'category_id' => 3, 'name_en' => 'High-Waist Wide Leg Pants', 'name_ar' => 'بنطلون واسع خصر عالي',
                'slug' => 'high-waist-wide-leg-pants', 'description_en' => 'Elegant wide-leg pants with a high waist for a flattering silhouette.',
                'description_ar' => 'بنطلون واسع بخصر عالي لإطلالة أنيقة.',
                'selling_price' => 580, 'discount_price' => 465, 'cost_price' => 250,
                'sizes' => ['S', 'M', 'L', 'XL'], 'colors' => ['Black', 'Camel', 'Grey'],
                'stock_quantity' => 20, 'is_available' => true, 'is_featured' => true,
            ],
            [
                'category_id' => 3, 'name_en' => 'Stretchy Skinny Jeans', 'name_ar' => 'جينز اسكيني مطاط',
                'slug' => 'stretchy-skinny-jeans', 'description_en' => 'Comfortable stretch skinny jeans in classic wash.',
                'description_ar' => 'جينز اسكيني مطاط مريح بلون كلاسيكي.',
                'selling_price' => 650, 'discount_price' => null, 'cost_price' => 300,
                'sizes' => ['28', '30', '32', '34'], 'colors' => ['Dark Blue', 'Light Blue', 'Black'],
                'stock_quantity' => 18, 'is_available' => true, 'is_featured' => false,
            ],
            [
                'category_id' => 4, 'name_en' => 'Embroidered Open Abaya', 'name_ar' => 'عباية مفتوحة مطرزة',
                'slug' => 'embroidered-open-abaya', 'description_en' => 'Stunning open abaya with delicate embroidery details.',
                'description_ar' => 'عباية مفتوحة مذهلة بتفاصيل تطريز رقيقة.',
                'selling_price' => 1200, 'discount_price' => 960, 'cost_price' => 500,
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'], 'colors' => ['Black', 'Navy', 'Olive'],
                'stock_quantity' => 10, 'is_available' => true, 'is_featured' => true,
            ],
            [
                'category_id' => 5, 'name_en' => 'Layered Gold Necklace Set', 'name_ar' => 'طقم سلاسل ذهبية',
                'slug' => 'layered-gold-necklace-set', 'description_en' => 'Beautiful layered necklace set in gold tone.',
                'description_ar' => 'طقم سلاسل طبقات باللون الذهبي.',
                'selling_price' => 180, 'discount_price' => null, 'cost_price' => 60,
                'sizes' => [], 'colors' => ['Gold', 'Silver'],
                'stock_quantity' => 40, 'is_available' => true, 'is_featured' => false,
            ],
            [
                'category_id' => 6, 'name_en' => 'Mini Crossbody Bag', 'name_ar' => 'شنطة كروس صغيرة',
                'slug' => 'mini-crossbody-bag', 'description_en' => 'Chic mini crossbody bag perfect for everyday use.',
                'description_ar' => 'شنطة كروس صغيرة شيك مناسبة للاستخدام اليومي.',
                'selling_price' => 350, 'discount_price' => 280, 'cost_price' => 140,
                'sizes' => [], 'colors' => ['Black', 'Tan', 'Pink', 'White'],
                'stock_quantity' => 22, 'is_available' => true, 'is_featured' => true,
            ],
            [
                'category_id' => 6, 'name_en' => 'Structured Tote Bag', 'name_ar' => 'شنطة توت منظمة',
                'slug' => 'structured-tote-bag', 'description_en' => 'Large structured tote bag for work or shopping.',
                'description_ar' => 'شنطة توت كبيرة للشغل أو التسوق.',
                'selling_price' => 520, 'discount_price' => null, 'cost_price' => 220,
                'sizes' => [], 'colors' => ['Black', 'Brown', 'Cream'],
                'stock_quantity' => 12, 'is_available' => true, 'is_featured' => false,
            ],
        ];

        foreach ($products as $prod) {
            Product::create($prod);
        }

        // ── Settings ────────────────────────────────────────────────
        $settings = [
            // Contact
            ['key' => 'whatsapp_number', 'value' => '201023402591', 'group' => 'contact'],
            ['key' => 'phone_number', 'value' => '01023402591', 'group' => 'contact'],
            ['key' => 'instagram_url', 'value' => 'https://www.instagram.com/bydido.studio?dlrf=ZmMyeW41cHBvd3Y5', 'group' => 'contact'],
            ['key' => 'tiktok_url', 'value' => 'https://www.tiktok.com/@didos.studio?_r=1&_t=ZS-9Aim7g6jSsB', 'group' => 'contact'],

            // Payment
            ['key' => 'instapay_account', 'value' => 'didostore@instapay', 'group' => 'payment'],
            ['key' => 'vodafone_cash_number', 'value' => '01023402591', 'group' => 'payment'],
            ['key' => 'telda_number', 'value' => '01023402591', 'group' => 'payment'],

            // Banners
            ['key' => 'homepage_banners', 'value' => json_encode([
                ['title_en' => 'New Collection', 'title_ar' => 'مجموعة جديدة', 'subtitle_en' => 'Up to 30% off on selected items', 'subtitle_ar' => 'خصم يصل لـ 30% على منتجات مختارة', 'link' => '/products?offers=1'],
                ['title_en' => 'Summer Essentials', 'title_ar' => 'أساسيات الصيف', 'subtitle_en' => 'Lightweight and breathable styles', 'subtitle_ar' => 'أزياء خفيفة ومريحة', 'link' => '/products'],
            ]), 'group' => 'banners'],
        ];

        foreach ($settings as $s) {
            Setting::create($s);
        }
    }
}
