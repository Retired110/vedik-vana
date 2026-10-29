# Vedik Vana (वेदिक वन)
### Sacred Botanical Living — Luxury E-Commerce & Powerful No-Code Merchant Platform

> **A production-grade, full-stack D2C e-commerce platform built for premium Indian agricultural, herbal, and Ayurvedic brands. Combines the refined botanical storytelling of Banyan Botanicals and Krishna Ayurved with the shopping convenience of Amazon and the store management simplicity of Shopify.**

---

## 🌿 Key Features & Architectural Capabilities

### 1. Zero-Code Product & Catalog Management
* **Instant Publishing Without Touching Code:** Add, edit, duplicate, archive, or delete products through a polished admin interface. Changes instantly reflect across the homepage, shop catalog, search, recommendations, and checkout.
* **Multi-Image Uploader:** Drag-and-drop or file upload to `/public/uploads/` with primary image selection and gallery reordering.
* **Dynamic Variant Builder:** Support multi-size/weight packaging (e.g. *250g Jar*, *500g Eco Refill*, *1kg Value Pack*) with individual SKUs, prices in ₹/paise, and independent stock levels.
* **Agricultural & Regulated Provenance:** Support for Farm Origin, Harvest Technique, Standardized Grade, Net Weight, Batch Tracking Number, Central FSSAI Licence Number, Expiry Date, Storage advice, and Botanical Ingredients.
* **Bulk Catalog Operations:** 1-click bulk publish/unpublish, bulk price adjustments (+/- %), bulk stock updates, and bulk CSV export/import.

### 2. Live Inventory & Availability Engine
* **Safe Atomic Stock Operations:** Server-side transactional inventory verification preventing overselling.
* **Automatic Status Transitions:** Dynamic transition between `In Stock`, `Low Stock` (with live pulse count), and disabled `Out of Stock`.
* **Automatic Restock upon Cancellation:** Cancelling or refunding an order in the admin dashboard automatically restores stock and creates an audit movement log.

### 3. Pricing, Offers & Server-Side Discounts
* **Safe Monetary Architecture:** All monetary amounts are computed and stored in integer **paise** (`₹1 = 100 paise`), preventing floating-point calculation errors.
* **Genuine Strikethrough Discounts:** Crossed-out compare-at prices only show when genuine savings exist.
* **Promotional Coupon Engine:** Percentage and fixed amount coupons with minimum cart value restrictions, expiration dates, and maximum discount caps.

### 4. Search, Discovery & Product Detail Experience
* **Debounced Live Mega Search:** Instant search by product title, category, tags, or SKU with suggested matches.
* **Multi-Faceted Sidebar Filters:** Filter by category, price ranges (Under ₹500, ₹500–₹1,000, etc.), in-stock availability, and sorting (Featured, Bestsellers, Price Low-High, Price High-Low, Newest Harvest).
* **Interactive Product Page:** Multi-image zoom gallery, live variant switcher updating prices and inventory, Indian 6-digit PIN code delivery estimator, botanical provenance tabs, and verified customer reviews.

### 5. Shopping Cart, Indian Checkout & Gateways
* **Slide-over Cart Drawer & Dedicated Cart Page:** Interactive free shipping progress meter (*"Add ₹250 more for FREE Express Delivery"*), quantity steppers, applied coupon tag, and cost breakdown.
* **Indian State & PIN Code Checkout:** Form validated for Indian addresses across 30+ states and union territories.
* **Payment Integration:**
  - **Cash on Delivery (COD)** with admin toggle.
  - **Razorpay Payment Gateway:** Integrated test sandbox modal with server-side signature verification.

### 6. Full Merchant Admin Dashboard (`/admin`)
* **Real Business KPIs:** Total Realized Revenue, Paid Orders Count, Total Orders, Average Order Value (AOV), and Low-Stock Warnings.
* **Order Management & Fulfillment:** Track customer orders, update stages (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` → `Cancelled` → `Refunded`), assign courier partners (Delhivery, Blue Dart), and input tracking numbers.
* **No-Code Homepage Customizer:** Edit announcement bar, hero headline, story text, and FAQs directly from the dashboard.
* **Store Settings:** Configure Brand Name, FSSAI licence number, Free shipping threshold, Shipping fee, GST rate %, COD toggle, and Razorpay API credentials.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + React 18 + TypeScript |
| **Styling** | Tailwind CSS with customized luxury botanical palette (Deep Forest Green, Warm Ivory, Sacred Herbal Gold) |
| **Database & ORM** | Prisma ORM with SQLite (`prisma/dev.db`) for zero-friction standalone local execution; 100% ready to point to PostgreSQL / Supabase |
| **Icons & Micro-Interactions** | Lucide React, CSS keyframe micro-animations |
| **Authentication** | Secure HMAC-SHA256 session tokens with HttpOnly cookies & bcrypt password hashing |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js v18 or v20+ installed on your system.

### 2. Installation
```bash
# Clone the repository and navigate into folder
cd BUSINESS

# Install dependencies
npm install

# Push database schema and generate Prisma client
npx prisma db push

# Seed rich botanical catalog, default admin, coupons, and settings
node prisma/seed.js

# Launch development server
npm run dev
```

The application will be live at **`http://localhost:3000`**.

---

## 🔐 Pre-configured Admin Credentials

To access the merchant dashboard:
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Admin Email:** `admin@vedikvana.com`
- **Password:** `AdminPassword123!`
- **Role:** `OWNER` (Full administrative privileges)

---

## 🧪 Verification & Automated Test Suite

A complete automated end-to-end test suite is included in `scripts/test-e2e.js`. To run all 18 automated tests:

```bash
node scripts/test-e2e.js
```

### Verified Test Cases:
1. `GET /` — Homepage renders brand identity and categories (HTTP 200).
2. `GET /api/search?q=Shilajit` — Live search returns matching products.
3. `GET /product/[slug]` — Product detail page renders dynamic title and variants.
4. `GET /api/pincode/check?pincode=110001` — PIN code validated for express delivery.
5. `POST /api/coupon/validate` — Server-side coupon verification and discount calculation.
6. `POST /api/checkout` — Safe order creation with atomic inventory deduction.
7. `GET /order-success/[orderNumber]` — Order receipt with fulfillment timeline.
8. `POST /api/admin/login` — Admin authentication with bcrypt.
9. `GET /api/admin/products` — Admin catalog retrieval.
10. `POST /api/admin/products` — No-code product creation.
11. Verification that newly created product appears immediately on live storefront.
12. `PUT /api/admin/orders` — Status update to SHIPPED and courier tracking assignment.

---

## 📦 Deployment Instructions (Vercel / Node.js)

1. **Vercel / Cloud Deployment:**
   - Connect the repository to Vercel or your hosting provider.
   - For a hosted PostgreSQL database (e.g. Supabase, Neon, AWS RDS), update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - In environment variables, provide `DATABASE_URL`, `ADMIN_SECRET`, and `NEXT_PUBLIC_APP_URL`.
   - Run `npx prisma db push && node prisma/seed.js`.

---

## 📜 License & Compliance
* Built in accordance with Indian Food Safety and Standards Authority of India (FSSAI) regulatory standards.
* © Vedik Vana Botanicals Private Limited.
