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

        // ── Customers ───────────────────────────────────────────────
        $customers = [
            [
                'name' => 'سارة أحمد', 'phone' => '01012345678',
                'whatsapp_number' => '201012345678', 'source_platform' => 'whatsapp',
            ],
            [
                'name' => 'نورهان محمد', 'phone' => '01098765432',
                'instagram_username' => 'nourhan.m', 'source_platform' => 'instagram',
            ],
            [
                'name' => 'ياسمين علي', 'phone' => '01155512345',
                'tiktok_username' => 'yasmin.ali', 'source_platform' => 'tiktok',
            ],
            [
                'name' => 'فاطمة خالد', 'phone' => '01222334455',
                'whatsapp_number' => '201222334455', 'source_platform' => 'whatsapp',
            ],
        ];

        foreach ($customers as $cust) {
            Customer::create($cust);
        }

        // ── Sample Orders ───────────────────────────────────────────
        // Order 1: Delivered
        $order1 = Order::create([
            'order_number' => 'DIDO-000001',
            'customer_id' => 1,
            'status' => 'delivered',
            'subtotal' => 1140,
            'shipping_fee' => 60,
            'customs_fee' => 150,
            'discount_amount' => 0,
            'total' => 1350,
            'shipping_address' => 'شارع المعز، القاهرة',
        ]);

        OrderItem::create([
            'order_id' => $order1->id, 'product_id' => 1, 'product_name' => 'Elegant Floral Midi Dress',
            'unit_price' => 680, 'quantity' => 1, 'size' => 'M', 'color' => 'Black', 'line_total' => 680,
        ]);
        OrderItem::create([
            'order_id' => $order1->id, 'product_id' => 3, 'product_name' => 'Oversized Linen Blouse',
            'unit_price' => 360, 'quantity' => 1, 'size' => 'L', 'color' => 'White', 'line_total' => 360,
        ]);
        OrderItem::create([
            'order_id' => $order1->id, 'product_id' => 8, 'product_name' => 'Layered Gold Necklace Set',
            'unit_price' => 180, 'quantity' => 1, 'size' => null, 'color' => 'Gold', 'line_total' => 100,
        ]);

        // Status history for order 1
        foreach (['pending', 'confirmed', 'ordered_from_shein', 'shipped', 'delivered'] as $i => $status) {
            OrderStatusHistory::create([
                'order_id' => $order1->id, 'old_status' => $i === 0 ? null : Order::STATUSES[$i - 1],
                'new_status' => $status, 'changed_by' => $admin->id, 'created_at' => now()->subDays(10 - $i * 2),
            ]);
        }

        // Deposit for order 1
        Deposit::create([
            'order_id' => $order1->id, 'customer_id' => 1, 'amount' => 700,
            'method' => 'instapay', 'transfer_date' => now()->subDays(10),
            'screenshot_path' => 'deposits/sample_1.jpg', 'status' => 'verified',
            'verified_by' => $admin->id, 'verified_at' => now()->subDays(9),
        ]);
        Deposit::create([
            'order_id' => $order1->id, 'customer_id' => 1, 'amount' => 650,
            'method' => 'vodafone_cash', 'transfer_date' => now()->subDays(3),
            'screenshot_path' => 'deposits/sample_2.jpg', 'status' => 'verified',
            'verified_by' => $admin->id, 'verified_at' => now()->subDays(2),
        ]);

        // Order 2: Pending
        $order2 = Order::create([
            'order_number' => 'DIDO-000002',
            'customer_id' => 2,
            'status' => 'pending',
            'subtotal' => 1240,
            'shipping_fee' => 60,
            'customs_fee' => 0,
            'discount_amount' => 0,
            'total' => 1300,
            'shipping_address' => 'المعادي، القاهرة',
        ]);

        OrderItem::create([
            'order_id' => $order2->id, 'product_id' => 7, 'product_name' => 'Embroidered Open Abaya',
            'unit_price' => 960, 'quantity' => 1, 'size' => 'M', 'color' => 'Black', 'line_total' => 960,
        ]);
        OrderItem::create([
            'order_id' => $order2->id, 'product_id' => 9, 'product_name' => 'Mini Crossbody Bag',
            'unit_price' => 280, 'quantity' => 1, 'size' => null, 'color' => 'Tan', 'line_total' => 280,
        ]);

        OrderStatusHistory::create([
            'order_id' => $order2->id, 'old_status' => null,
            'new_status' => 'pending', 'changed_by' => null, 'created_at' => now()->subDay(),
        ]);

        Deposit::create([
            'order_id' => $order2->id, 'customer_id' => 2, 'amount' => 500,
            'method' => 'telda', 'transfer_date' => now()->subDay(),
            'screenshot_path' => 'deposits/sample_3.jpg', 'status' => 'pending',
        ]);

        // Order 3: Confirmed
        $order3 = Order::create([
            'order_number' => 'DIDO-000003',
            'customer_id' => 3,
            'status' => 'confirmed',
            'subtotal' => 930,
            'shipping_fee' => 60,
            'customs_fee' => 0,
            'discount_amount' => 0,
            'total' => 990,
            'shipping_address' => 'الإسكندرية',
        ]);

        OrderItem::create([
            'order_id' => $order3->id, 'product_id' => 5, 'product_name' => 'High-Waist Wide Leg Pants',
            'unit_price' => 465, 'quantity' => 2, 'size' => 'M', 'color' => 'Black', 'line_total' => 930,
        ]);

        OrderStatusHistory::create([
            'order_id' => $order3->id, 'old_status' => null,
            'new_status' => 'pending', 'changed_by' => null, 'created_at' => now()->subDays(3),
        ]);
        OrderStatusHistory::create([
            'order_id' => $order3->id, 'old_status' => 'pending',
            'new_status' => 'confirmed', 'changed_by' => $admin->id, 'created_at' => now()->subDays(2),
        ]);

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
