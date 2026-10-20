# Dido Store — SHEIN Fashion E-Commerce & Operations Management

A complete, production-ready, full-stack e-commerce platform and administrative operations suite tailored for the Egyptian fashion market. Dido Store curates and sources top-rated clothing and accessories directly from **SHEIN**, allowing Egyptian shoppers to buy in **Egyptian Pounds (EGP)** using local payment methods (**InstaPay**, **Vodafone Cash**, and **Telda**) with automated down-payment deposit verification and transparent customs handling.

---

## 🌟 Key Features

### 🛍️ Public Fashion Storefront
- **Modern Minimalist & Chic Aesthetic**: Editorial layout with warm neutral tones (`#FAFAF8`, `#C4907C`), Playfair Display typography, responsive mobile-first navigation, and glassmorphism headers.
- **Home Page**:
  - Hero banner with curated SHEIN highlights and 50% deposit benefits.
  - 3-step "How It Works" customer guide (Browse -> 50% Deposit -> Delivered to door).
  - Dynamic category cards with subtle hover zoom.
  - New arrivals grid and flash sale promotions.
  - Founder's Story & brand mission profile (English & Arabic).
- **Products Catalog (`/products`)**:
  - Live search across English and Arabic titles and descriptions.
  - Category pill filters & sort dropdown (price ascending/descending, newest arrivals).
  - "On Sale Only" toggle filter with savings percentage badges.
- **Product Detail Page (`/products/[slug]`)**:
  - Image gallery with thumbnail selection and zoom.
  - Interactive Size Selector (S, M, L, XL, etc.) and Color selector.
  - 50% down-payment calculation preview in EGP.
  - Direct "Add to Shopping Bag" and "Buy Now" flow.
- **Slide-Out Cart Drawer (`CartDrawer`)**:
  - Persistent shopping bag powered by React Context and `localStorage`.
  - Item quantity adjustment and instant subtotal recalculation in EGP.
- **Order Request & Checkout (`/checkout`)**:
  - Egypt-specific customer fields: Name, Phone (010/011/012/015), WhatsApp sync checkbox, Governorate selection, delivery address, and social discovery source (Instagram, TikTok, WhatsApp).
  - 50% deposit requirement display + remaining delivery balance.
  - InstaPay address and Vodafone Cash wallet instructions.
- **Order Tracking & Deposit Upload (`/order-tracking`)**:
  - Live 5-step shipment milestone progression: `Pending` ➔ `Confirmed` ➔ `Ordered from SHEIN` ➔ `Shipped` ➔ `Delivered`.
  - Financial breakdown: Total, Customs fees, Verified deposits paid, and Remaining balance.
  - Direct receipt upload form for InstaPay/Vodafone Cash transfer screenshots.
  - Milestone activity history log.
  - One-click WhatsApp support button.

---

### 🛡️ Admin Dashboard & Operations Suite (`/admin`)
- **Dashboard Overview (`/admin/dashboard`)**:
  - Real-time KPIs: Gross Revenue, Active Orders, Pending Deposit Verifications, Registered Clients.
  - Pipeline status pills counter.
  - Recent orders table with customer and remaining balance.
- **Orders Management (`/admin/orders`)**:
  - Filter orders by status: Pending, Confirmed, Ordered from SHEIN, Shipped, Delivered, Cancelled.
  - Search by Order #, customer name, or phone.
  - Direct WhatsApp customer messaging link.
- **Order Detail & Progression (`/admin/orders/[id]`)**:
  - Status Controller: advance order to next stage with admin timeline notes (e.g., SHEIN Reference #).
  - **Stock Automation**: automatically decrements inventory upon confirmation and restores it if cancelled.
  - **Customs Fee Adjustment**: add post-clearing customs surcharges with reason logs, automatically updating order total.
  - Linked deposit receipts approval/rejection.
- **Deposit Verification Queue (`/admin/deposits`)**:
  - Filter deposits by Pending, Verified, Rejected.
  - Screenshot modal lightbox for transfer receipts.
  - One-click "Verify & Lock Stock" or "Reject".
- **Product Catalog Management (`/admin/products`)**:
  - Add / Edit product modal with English & Arabic titles, SHEIN cost price, selling price, discount price, stock quantity, sizes, and colors.
- **Categories Manager (`/admin/categories`)**:
  - Organize collections with custom sort ordering, slug, and Arabic/English naming.
- **Customers CRM (`/admin/customers`)**:
  - Customer directory segmented by acquisition source (Instagram, TikTok, WhatsApp).
  - Order history counters and 1-click WhatsApp message triggers.
- **Financial Analytics (`/admin/analytics`)**:
  - Net profit estimates (~48% margins), SHEIN procurement costs, customs surcharges.
  - Top-selling SHEIN pieces rank.
  - Customer acquisition channel breakdown.
- **Store Configuration (`/admin/settings`)**:
  - Configure InstaPay address, Vodafone Cash wallet, Telda handle, support hotline, and Founder Bio.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Laravel 11 REST API, Laravel Sanctum authentication.
- **Database**: MySQL 8.0 with InnoDB foreign keys and UTF-8 collation.
- **Containerization**: Docker, Docker Compose, Nginx reverse proxy.

---

## 🛠️ Quickstart

### Option 1: Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/zeyad-elnady/dido-store.git
   cd dido-store
   ```

2. Copy environment files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Start all services using Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Run backend migrations and seed sample data:
   ```bash
   docker compose exec backend php artisan migrate --seed
   ```

5. Access the application:
   - **Public Storefront**: [http://localhost:3000](http://localhost:3000)
   - **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
   - **phpMyAdmin** (Optional dev tool): [http://localhost:8080](http://localhost:8080)

---

### Option 2: Local Development

#### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Admin Credentials

- **Email**: `admin@didostore.com`
- **Password**: `password123`
- *(Or click the instant 1-Click Demo Review button on the admin login screen)*

---

## 📂 Project Directory Structure

```
dido-store/
├── docker-compose.yml           # Multi-container orchestration (DB, API, Nginx, Next.js)
├── docker-compose.dev.yml       # Development overrides
├── Makefile                     # Make shortcuts (make up, make migrate, make seed)
├── docker/                      # Container Dockerfiles and Nginx configs
├── backend/                     # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api # API Controllers (Orders, Products, Deposits, Auth)
│   │   ├── Models/              # Eloquent Models with relationships & business rules
│   │   └── Services/            # OrderService (Stock lock, customs fee updates)
│   ├── database/
│   │   ├── migrations/          # 12 database migration tables
│   │   └── seeders/             # DatabaseSeeder with rich sample data
│   └── routes/api.php           # Public & Sanctum-protected REST endpoints
└── frontend/                    # Next.js 16 App Router application
    ├── src/
    │   ├── app/
    │   │   ├── (store)/         # Public store routes (Home, Products, Checkout, Tracking)
    │   │   └── admin/           # Admin dashboard routes (Orders, Deposits, Products, etc.)
    │   ├── components/store/    # Store UI components (CartDrawer, etc.)
    │   ├── context/             # CartContext (localStorage persistent bag)
    │   ├── lib/                 # API client & mockData fallbacks
    │   └── types/               # TypeScript interfaces
    └── Dockerfile               # Multi-stage production build container
```

---

## 📄 License
MIT License. Built for Dido Store Egypt. Sourced from SHEIN.
