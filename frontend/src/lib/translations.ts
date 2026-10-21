// =============================================================================
// Dido Store — Bilingual Translations (English & Arabic)
// =============================================================================

export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // ── Brand & Navigation ─────────────────────────────────────────────────────
  brand_name: {
    en: "Dido Store",
    ar: "ديدو ستور",
  },
  brand_tagline: {
    en: "Fashion from SHEIN • Delivered to Egypt",
    ar: "أزياء شي إن • توصيل لجميع محافظات مصر",
  },
  nav_home: {
    en: "Home",
    ar: "الرئيسية",
  },
  nav_catalog: {
    en: "Shop Catalog",
    ar: "جميع المنتجات",
  },
  nav_offers: {
    en: "Special Offers",
    ar: "العروض والتخفيضات",
  },
  nav_tracking: {
    en: "Track Order",
    ar: "تتبع طلبك",
  },
  nav_search_placeholder: {
    en: "Search dresses, tops, bags...",
    ar: "ابحث عن فساتين، بلوزات، شنط...",
  },
  nav_cart: {
    en: "Shopping Bag",
    ar: "حقيبة التسوق",
  },
  currency: {
    en: "EGP",
    ar: "ج.م",
  },
  language_toggle: {
    en: "العربية",
    ar: "English",
  },

  // ── Top Announcement Bar ───────────────────────────────────────────────────
  announcement_text_1: {
    en: "✨ Curated SHEIN Collections • Delivered to your Doorstep in Egypt",
    ar: "✨ أحدث كولكشن من شي إن • توصيل لحد باب بيتك في مصر",
  },
  announcement_text_2: {
    en: "50% Down-Payment via InstaPay or Vodafone Cash",
    ar: "عربون 50% عبر إنستاباي أو فودافون كاش",
  },

  // ── Hero Section ───────────────────────────────────────────────────────────
  hero_badge: {
    en: "Sourced Directly from SHEIN",
    ar: "مستورد مباشرة من شي إن",
  },
  hero_title_1: {
    en: "Trendy Fashion Curated for Egypt",
    ar: "أحدث صيحات الموضة العالمية في مصر",
  },
  hero_subtitle: {
    en: "Browse the best of SHEIN with transparent Egyptian pricing, guaranteed customs clearance, and seamless doorstep delivery. Pay only 50% deposit to lock your order.",
    ar: "تسوقي أفضل تصاميم شي إن بأسعار شفافة بالجنيه المصري، وتخليص جمركي مضمون وتوصيل لباب بيتك. ادفعي 50% عربون فقط لتأكيد طلبك والباقي عند الاستلام.",
  },
  hero_cta_shop: {
    en: "Shop Collection",
    ar: "تسوقي الآن",
  },
  hero_cta_track: {
    en: "Track My Order",
    ar: "تتبعي طلبك",
  },
  hero_stat_curated: {
    en: "Curated Styles",
    ar: "قطعة مختارة",
  },
  hero_stat_deposit: {
    en: "Down-Payment",
    ar: "عربون تأكيد",
  },
  hero_stat_delivery: {
    en: "Governorates",
    ar: "محافظة نصل إليها",
  },

  // ── Trust Pillars / Features ───────────────────────────────────────────────
  feature_shein_title: {
    en: "Authentic SHEIN Pieces",
    ar: "قطع أصلية من شي إن",
  },
  feature_shein_desc: {
    en: "We handpick high-quality, verified trending pieces directly from SHEIN catalogs.",
    ar: "نختار بعناية أفضل القطع الأكثر طلباً وجودة من كتالوج شي إن مباشرة.",
  },
  feature_deposit_title: {
    en: "50% Easy Down-Payment",
    ar: "عربون 50% سهل وسريع",
  },
  feature_deposit_desc: {
    en: "Pay half via InstaPay, Vodafone Cash, or Telda to order. Pay the rest upon doorstep delivery.",
    ar: "ادفعي النصف عبر إنستاباي أو فودافون كاش أو تيلدا. وادفعي الباقي عند الاستلام.",
  },
  feature_delivery_title: {
    en: "All Egypt Governorates",
    ar: "شحن لجميع المحافظات",
  },
  feature_delivery_desc: {
    en: "Direct delivery to Cairo, Giza, Alexandria, Delta, and Upper Egypt within 5–12 business days.",
    ar: "توصيل آمن للقاهرة، الجيزة، الإسكندرية وجميع المحافظات خلال 5 إلى 12 يوم عمل.",
  },
  feature_support_title: {
    en: "Direct WhatsApp Support",
    ar: "خدمة عملاء واتساب مباشرة",
  },
  feature_support_desc: {
    en: "Get instant sizing advice, order confirmation, and updates directly through WhatsApp.",
    ar: "مساعدة فورية في اختيار المقاس، ومتابعة فورية وتأكيد للطلب عبر واتساب.",
  },

  // ── Categories Section ─────────────────────────────────────────────────────
  categories_title: {
    en: "Explore by Category",
    ar: "تسوقي حسب القسم",
  },
  categories_subtitle: {
    en: "Find the pieces that match your unique chic style.",
    ar: "اكتشفي التشكيلات الأنيقة المصممة لتناسب ذوقك الرفيع.",
  },
  view_all_categories: {
    en: "View All Products",
    ar: "عرض كل المنتجات",
  },
  items_count: {
    en: "items",
    ar: "منتج",
  },

  // ── Products / Catalog ─────────────────────────────────────────────────────
  featured_title: {
    en: "Trending New Arrivals",
    ar: "أحدث الوصول والقطع الأكثر طلباً",
  },
  featured_subtitle: {
    en: "Hand-picked styles flying off our shelves this season.",
    ar: "أجمل الإطلالات المختارة بعناية لتتألقي في كل مناسبة.",
  },
  sale_badge: {
    en: "SALE",
    ar: "تخفيض",
  },
  featured_badge: {
    en: "POPULAR",
    ar: "مميز",
  },
  out_of_stock: {
    en: "Out of Stock",
    ar: "نفدت الكمية",
  },
  add_to_cart: {
    en: "Add to Bag",
    ar: "أضيفي للحقيبة",
  },
  quick_view: {
    en: "View Details",
    ar: "تفاصيل المنتج",
  },
  catalog_title: {
    en: "Fashion Catalog",
    ar: "كتالوج الأزياء",
  },
  catalog_subtitle: {
    en: "Explore hundreds of stylish pieces sourced directly from SHEIN.",
    ar: "تصفحي مئات القطع الأنيقة المستوردة مباشرة من شي إن.",
  },
  filter_all: {
    en: "All Items",
    ar: "جميع القطع",
  },
  filter_category: {
    en: "Category",
    ar: "القسم",
  },
  filter_search: {
    en: "Search products...",
    ar: "البحث في المنتجات...",
  },
  filter_sort_by: {
    en: "Sort By",
    ar: "الترتيب حسب",
  },
  sort_featured: {
    en: "Featured",
    ar: "المميز",
  },
  sort_price_low: {
    en: "Price: Low to High",
    ar: "السعر: من الأقل للأعلى",
  },
  sort_price_high: {
    en: "Price: High to Low",
    ar: "السعر: من الأعلى للأقل",
  },
  sort_newest: {
    en: "Newest Arrivals",
    ar: "الأحدث وصولاً",
  },
  filter_only_sale: {
    en: "On Sale Only",
    ar: "العروض فقط",
  },
  filter_clear: {
    en: "Reset Filters",
    ar: "إعادة ضبط التصفية",
  },
  showing_results: {
    en: "Showing",
    ar: "عرض",
  },
  no_products_found: {
    en: "No products found matching your search.",
    ar: "لم يتم العثور على منتجات مطابقة لبحثك.",
  },

  // ── Product Details Page ───────────────────────────────────────────────────
  back_to_catalog: {
    en: "Back to Products",
    ar: "العودة للمنتجات",
  },
  select_size: {
    en: "Select Size",
    ar: "اختاري المقاس",
  },
  select_color: {
    en: "Select Color",
    ar: "اختاري اللون",
  },
  quantity: {
    en: "Quantity",
    ar: "الكمية",
  },
  product_description: {
    en: "Product Details & Material",
    ar: "تفاصيل وخامة المنتج",
  },
  order_breakdown: {
    en: "Deposit & Payment Breakdown",
    ar: "تفاصيل العربون والدفع",
  },
  deposit_notice: {
    en: "This item requires a 50% deposit to be confirmed with SHEIN.",
    ar: "يتطلب هذا المنتج دفع عربون 50% لتأكيده وطلبه من شي إن.",
  },
  due_now: {
    en: "50% Due Now (Deposit):",
    ar: "المطلوب الآن (عربون 50%):",
  },
  due_on_delivery: {
    en: "Remaining Upon Delivery:",
    ar: "المتبقي عند استلام الطلب:",
  },
  product_added_msg: {
    en: "✓ Added to your shopping bag!",
    ar: "✓ تمت الإضافة إلى حقيبة التسوق بنجاح!",
  },
  need_help_whatsapp: {
    en: "Ask questions or get size advice on WhatsApp",
    ar: "استفسري عن المقاس أو توافر الألوان عبر واتساب",
  },
  shein_guarantee_title: {
    en: "100% Sourced from SHEIN",
    ar: "مستورد 100% من شي إن",
  },
  shein_guarantee_desc: {
    en: "We order your selected piece directly from the official SHEIN warehouse and handle international logistics & Egyptian customs on your behalf.",
    ar: "نقوم بطلب قطعتك المختارة مباشرة من مستودعات شي إن الرسمية ونتولى الشحن الدولي والتخليص الجمركي نيابة عنك.",
  },

  // ── Cart Drawer ────────────────────────────────────────────────────────────
  cart_title: {
    en: "Shopping Bag",
    ar: "حقيبة التسوق",
  },
  cart_empty_title: {
    en: "Your bag is empty",
    ar: "حقيبة التسوق فارغة",
  },
  cart_empty_desc: {
    en: "Explore our collection and add stylish SHEIN pieces to your bag.",
    ar: "تصفحي مجموعتنا وأضيفي أروع قطع شي إن الأنيقة إلى حقيبتك.",
  },
  cart_subtotal: {
    en: "Subtotal",
    ar: "المجموع الفرعي",
  },
  cart_deposit_info: {
    en: "50% down-payment will be required at checkout to confirm your order.",
    ar: "سيتم طلب عربون 50% عند إتمام الطلب لتأكيده والبدء في تنفيذه.",
  },
  cart_checkout_btn: {
    en: "Proceed to Checkout",
    ar: "متابعة لإتمام الطلب",
  },
  cart_continue_shopping: {
    en: "Continue Shopping",
    ar: "متابعة التسوق",
  },
  cart_remove: {
    en: "Remove",
    ar: "حذف",
  },

  // ── Checkout Page ──────────────────────────────────────────────────────────
  checkout_title: {
    en: "Complete Your Order",
    ar: "إتمام وتأكيد الطلب",
  },
  checkout_subtitle: {
    en: "Enter your delivery details and choose your 50% deposit payment method.",
    ar: "أدخلي بيانات التوصيل واختاري طريقة دفع العربون (50%).",
  },
  customer_info_title: {
    en: "1. Customer & Delivery Information",
    ar: "1. بيانات المستلم وعنوان التوصيل",
  },
  full_name: {
    en: "Full Name",
    ar: "الاسم بالكامل",
  },
  full_name_placeholder: {
    en: "e.g. Sarah Ahmed",
    ar: "مثال: سارة أحمد",
  },
  phone_number: {
    en: "Phone Number",
    ar: "رقم الموبايل",
  },
  phone_placeholder: {
    en: "e.g. 01012345678",
    ar: "مثال: 01012345678",
  },
  whatsapp_number: {
    en: "WhatsApp Number",
    ar: "رقم الواتساب (للتأكيد)",
  },
  same_as_phone: {
    en: "WhatsApp number is the same as phone number",
    ar: "رقم الواتساب هو نفسه رقم الموبايل",
  },
  governorate: {
    en: "Governorate",
    ar: "المحافظة",
  },
  city_district: {
    en: "City / Area / District",
    ar: "المدينة / الحي / المنطقة",
  },
  city_placeholder: {
    en: "e.g. Nasr City, New Cairo, Maadi...",
    ar: "مثال: مدينة نصر، التجمع الخامس، المعادي...",
  },
  street_name: {
    en: "Street Name",
    ar: "اسم الشارع",
  },
  street_placeholder: {
    en: "e.g. 90th Street, Abbas El Akkad...",
    ar: "مثال: شارع التسعين، شارع عباس العقاد...",
  },
  building_no: {
    en: "Building Number / Name",
    ar: "رقم أو اسم العمارة / الفيلا",
  },
  building_placeholder: {
    en: "e.g. Building 15 or Villa 4",
    ar: "مثال: عمارة 15 أو فيلا 4",
  },
  apartment_floor: {
    en: "Floor & Apartment",
    ar: "الدور ورقم الشقة",
  },
  apartment_placeholder: {
    en: "e.g. Floor 3, Apt 12",
    ar: "مثال: الدور 3، شقة 12",
  },
  nearest_landmark: {
    en: "Nearest Landmark (Optional)",
    ar: "أقرب علامة مميزة (اختياري)",
  },
  landmark_placeholder: {
    en: "e.g. Near El Ezaby Pharmacy, opposite the club...",
    ar: "مثال: بجوار صيدلية العزبي، أمام النادي...",
  },
  shipping_address: {
    en: "Detailed Delivery Address",
    ar: "العنوان بالتفصيل (الشارع، العمارة، الشقة)",
  },
  address_placeholder: {
    en: "Building number, Street, Apartment, Landmark...",
    ar: "رقم العمارة، الشارع، الشقة، وأقرب علامة مميزة...",
  },
  order_notes: {
    en: "Special Delivery Notes (Optional)",
    ar: "ملاحظات إضافية للتوصيل (اختياري)",
  },
  notes_placeholder: {
    en: "Preferred delivery time or specific instructions...",
    ar: "وقت التوصيل المفضل أو أي تعليمات خاصة بالطلب...",
  },
  social_source_title: {
    en: "Where did you discover Dido Store?",
    ar: "من أين عرفتي ديدو ستور؟",
  },
  platform_username: {
    en: "Your Username / Account Name",
    ar: "اسم حسابك (للتواصل السريع)",
  },

  // Deposit selection
  deposit_step_title: {
    en: "2. 50% Deposit Payment Instructions",
    ar: "2. طريقة سداد العربون (50%)",
  },
  deposit_explanation: {
    en: "To secure your items and initiate importing from SHEIN, a 50% deposit is required. You can pay easily via InstaPay, Vodafone Cash, or Telda.",
    ar: "لتأكيد حجز القطع وبدء استيرادها من شي إن، يلزم دفع عربون 50%. يمكنك التحويل بكل سهولة عبر إنستاباي أو فودافون كاش أو تيلدا.",
  },
  instapay_tab: {
    en: "InstaPay",
    ar: "إنستاباي (InstaPay)",
  },
  vodafone_tab: {
    en: "Vodafone Cash",
    ar: "فودافون كاش",
  },
  telda_tab: {
    en: "Telda",
    ar: "تيلدا (Telda)",
  },
  send_transfer_to: {
    en: "Send your deposit to this address:",
    ar: "أرسلي العربون إلى هذا الحساب:",
  },
  copy_btn: {
    en: "Copy",
    ar: "نسخ",
  },
  copied_btn: {
    en: "Copied!",
    ar: "تم النسخ!",
  },
  order_summary_title: {
    en: "Order Summary",
    ar: "ملخص الطلب",
  },
  shipping_fee_label: {
    en: "Shipping Fee (All Egypt)",
    ar: "مصاريف الشحن (جميع المحافظات)",
  },
  total_order_value: {
    en: "Total Order Value",
    ar: "إجمالي قيمة الطلب",
  },
  deposit_required_now: {
    en: "50% Deposit Required Now",
    ar: "عربون 50% مطلوب للبدء",
  },
  balance_on_doorstep: {
    en: "Balance on Delivery Doorstep",
    ar: "المتبقي عند الاستلام عند بابك",
  },
  place_order_btn: {
    en: "Confirm Order & Proceed to Deposit",
    ar: "تأكيد الطلب ومتابعة دفع العربون",
  },
  order_submitting: {
    en: "Creating your order...",
    ar: "جاري تسجيل طلبك...",
  },

  // ── Order Tracking Page ────────────────────────────────────────────────────
  tracking_title: {
    en: "Track Your Order",
    ar: "تتبع حالة طلبك",
  },
  tracking_subtitle: {
    en: "Check your order progress from SHEIN overseas to your Egyptian doorstep.",
    ar: "تابعي مسار شحنتك خطوة بخطوة من مستودعات شي إن وحتى باب بيتك في مصر.",
  },
  order_number_label: {
    en: "Order Number",
    ar: "رقم الطلب",
  },
  order_number_placeholder: {
    en: "e.g. DIDO-2026-XXXX",
    ar: "مثال: DIDO-2026-XXXX",
  },
  track_btn: {
    en: "Track Status",
    ar: "استعلام عن الطلب",
  },
  tracking_loading: {
    en: "Retrieving order details...",
    ar: "جاري البحث عن بيانات الطلب...",
  },
  step_pending: {
    en: "Pending Deposit",
    ar: "في انتظار العربون",
  },
  step_pending_desc: {
    en: "Awaiting 50% deposit to lock items",
    ar: "بانتظار تحويل عربون 50% لتأكيد الحجز",
  },
  step_confirmed: {
    en: "Deposit Confirmed",
    ar: "تم تأكيد العربون",
  },
  step_confirmed_desc: {
    en: "Deposit verified & stock locked",
    ar: "تم التحقق من العربون وحجز القطع",
  },
  step_shein: {
    en: "Ordered from SHEIN",
    ar: "تم الطلب من شي إن",
  },
  step_shein_desc: {
    en: "Dispatched from international warehouse",
    ar: "خرجت من مستودع شي إن الدولي وفي طريقها لمصر",
  },
  step_shipped: {
    en: "Customs Cleared & Shipped",
    ar: "تم التخليص والشحن المحلي",
  },
  step_shipped_desc: {
    en: "Cleared Egyptian customs, with courier",
    ar: "انتهى التخليص الجمركي ومع مندوب الشحن",
  },
  step_delivered: {
    en: "Delivered",
    ar: "تم التوصيل بنجاح",
  },
  step_delivered_desc: {
    en: "Handed to customer & remaining paid",
    ar: "تم التسليم للعميل واستلام باقي المبلغ",
  },
  step_cancelled: {
    en: "Order Cancelled",
    ar: "تم إلغاء الطلب",
  },
  deposit_status_card_title: {
    en: "Deposit Status",
    ar: "حالة العربون",
  },
  upload_proof_title: {
    en: "Upload Deposit Proof / Receipt",
    ar: "إرفاق إيصال تحويل العربون",
  },
  upload_proof_desc: {
    en: "Send a screenshot of your InstaPay or Vodafone Cash transfer to speed up verification.",
    ar: "أرفقي لقطة شاشة لإيصال التحويل عبر إنستاباي أو فودافون كاش لسرعة التأكيد.",
  },
  select_method: {
    en: "Payment Method Used",
    ar: "طريقة التحويل المستخدمة",
  },
  transfer_amount: {
    en: "Transferred Amount (EGP)",
    ar: "المبلغ المحول (ج.م)",
  },
  screenshot_link: {
    en: "Receipt Image / Screenshot Link or Note",
    ar: "رابط الصورة أو رقم عملية التحويل",
  },
  screenshot_placeholder: {
    en: "Transaction reference or image link...",
    ar: "رقم الحوالة أو الرابط أو اسم الراسل...",
  },
  submit_deposit_btn: {
    en: "Submit Deposit Proof",
    ar: "إرسال إيصال الدفع",
  },
  deposit_received_msg: {
    en: "✓ Thank you! We received your deposit proof. Our team will verify it shortly.",
    ar: "✓ شكراً لك! تم استلام إيصال العربون وسيقوم فريقنا بمراجعته وتأكيده خلال دقائق.",
  },
  items_in_order: {
    en: "Items in this Order",
    ar: "القطع الموجودة بالطلب",
  },
  contact_agent_whatsapp: {
    en: "Chat with us about this order on WhatsApp",
    ar: "تحدثي مع خدمة العملاء بخصوص هذا الطلب عبر واتساب",
  },

  // ── Offers Page ────────────────────────────────────────────────────────────
  offers_badge: {
    en: "Limited Time Offers",
    ar: "عروض لفترة محدودة",
  },
  offers_title: {
    en: "Exclusive Discounts & Deals",
    ar: "خصومات وعروض مميزة",
  },
  offers_subtitle: {
    en: "Enjoy special promotional prices on hand-picked SHEIN favorites.",
    ar: "استمتعي بأسعار مخفضة وتوفير حقيقي على تشكيلات مختارة من شي إن.",
  },

  // ── Founder & Story ────────────────────────────────────────────────────────
  founder_section_badge: {
    en: "The Story Behind Dido",
    ar: "قصة ديدو ستور",
  },
  founder_title: {
    en: "Fashion Made Accessible, Transparent, & Effortless",
    ar: "الموضة العالمية صارت أسهل وأقرب إليكِ",
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer_about_title: {
    en: "About Dido Store",
    ar: "عن ديدو ستور",
  },
  footer_about_text: {
    en: "Dido Store is Egypt's curated fashion portal for genuine SHEIN pieces. We simplify international shopping, handle customs and tariffs, and deliver straight to your door with a simple 50% deposit.",
    ar: "ديدو ستور هو بوابتكِ الأولى في مصر لتسوق أرقى قطع شي إن الأصلية. نسهل عليكِ الشراء الدولي، ونتولى التخليص الجمركي والشحن لباب بيتكِ بكل أمان وسهولة مع عربون 50% فقط.",
  },
  footer_links_title: {
    en: "Quick Navigation",
    ar: "روابط سريعة",
  },
  footer_accepted_payment: {
    en: "Accepted Payment for Deposit",
    ar: "طرق دفع العربون المعتمدة",
  },
  footer_rights: {
    en: "© 2026 Dido Store Egypt. All rights reserved. Sourced from SHEIN.",
    ar: "© 2026 ديدو ستور مصر. جميع الحقوق محفوظة. مستورد من شي إن.",
  },
  footer_governorates: {
    en: "Cairo • Giza • Alexandria • All Egyptian Governorates",
    ar: "القاهرة • الجيزة • الإسكندرية • جميع محافظات مصر",
  },
};

// ── Egyptian Governorates Bilingually ────────────────────────────────────────
export const EGYPT_GOVERNORATES = [
  { value: "Cairo", label_en: "Cairo", label_ar: "القاهرة" },
  { value: "Giza", label_en: "Giza", label_ar: "الجيزة" },
  { value: "Alexandria", label_en: "Alexandria", label_ar: "الإسكندرية" },
  { value: "Qalyubia", label_en: "Qalyubia", label_ar: "القليوبية" },
  { value: "Sharqia", label_en: "Sharqia", label_ar: "الشرقية" },
  { value: "Dakahlia", label_en: "Dakahlia (Mansoura)", label_ar: "الدقهلية (المنصورة)" },
  { value: "Gharbia", label_en: "Gharbia (Tanta)", label_ar: "الغربية (طنطا)" },
  { value: "Monufia", label_en: "Monufia", label_ar: "المنوفية" },
  { value: "Beheira", label_en: "Beheira", label_ar: "البحيرة" },
  { value: "Kafr El Sheikh", label_en: "Kafr El Sheikh", label_ar: "كفر الشيخ" },
  { value: "Damietta", label_en: "Damietta", label_ar: "دمياط" },
  { value: "Port Said", label_en: "Port Said", label_ar: "بورسعيد" },
  { value: "Ismailia", label_en: "Ismailia", label_ar: "الإسماعيلية" },
  { value: "Suez", label_en: "Suez", label_ar: "السويس" },
  { value: "Fayoum", label_en: "Fayoum", label_ar: "الفيوم" },
  { value: "Beni Suef", label_en: "Beni Suef", label_ar: "بني سويف" },
  { value: "Minya", label_en: "Minya", label_ar: "المنيا" },
  { value: "Asyut", label_en: "Asyut", label_ar: "أسيوط" },
  { value: "Sohag", label_en: "Sohag", label_ar: "سوهاج" },
  { value: "Qena", label_en: "Qena", label_ar: "قنا" },
  { value: "Luxor", label_en: "Luxor", label_ar: "الأقصر" },
  { value: "Aswan", label_en: "Aswan", label_ar: "أسوان" },
  { value: "Red Sea", label_en: "Red Sea (Hurghada)", label_ar: "البحر الأحمر (الغردقة)" },
  { value: "South Sinai", label_en: "South Sinai (Sharm El Sheikh)", label_ar: "جنوب سيناء (شرم الشيخ)" },
  { value: "Matrouh", label_en: "Matrouh", label_ar: "مطروح والساحل الشمالي" },
];
