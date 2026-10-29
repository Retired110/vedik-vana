# Vedik Vana — Codebase Architecture & Hardening Audit

**Repository:** `vedik-vana` | **Stack:** Next.js 14.2 (App Router), React 18, Prisma ORM (SQLite / PostgreSQL ready), Tailwind CSS

---

## 1. What Exists

### Storefront Routes & Capabilities
- **Homepage (`/`):** Dynamic Hero banner, botanical category grid, Revered Bestsellers, brand provenance story, interactive accordion FAQ, and customer reviews.
- **Catalog & Product Pages (`/shop`, `/category/[slug]`, `/product/[slug]`):** Category filtering, multi-variant selection (20g/50g, 500ml/1L), quantity selector, reviews list, and drawer cart addition.
- **Cart & Slideover Drawer (`/cart`, `<CartDrawer />`):** Quantity management, dynamic free-delivery progress bar, coupon validation, local storage synchronization.
- **Checkout (`/checkout`):** 3-step checkout with address collection (Indian states dropdown, PIN code verification), COD and Razorpay payment flow.
- **Order Confirmation & Tracking (`/order-success/[orderNumber]`, `/account`):** Order summary, delivery tracking status, customer profile with address book.
- **Customer Account (`/account`):** Orders history, saved addresses, profile management.
- **Brand Pages:** `/about` (farm story), `/faq`, `/terms-privacy`, `/shipping-returns`.
- **Bot Assistant (`<VedaMitraChat />`):** Conversational AI chatbot for customer assistance.

### Admin Management Panel (`/admin`)
- **Dashboard Overview:** KPI stats (Revenue, Orders, Low Stock Alerts), monthly sales chart, quick inventory status.
- **Catalog & Inventory (`/admin/products`, `/admin/inventory`):** Full CRUD for products and variants, batch tracking, stock movement audit trail, CSV import/export, bulk price updater.
- **Orders Pipeline (`/admin/orders`):** Order status management (Pending, Confirmed, Shipped, Delivered, Cancelled), cancellation restock automation, tracking number updates, delivery OTP verification.
- **Marketing & Store Control (`/admin/categories`, `/admin/coupons`, `/admin/homepage`, `/admin/settings`, `/admin/reviews`, `/admin/ai-learning`):**
  - Category manager
  - Discount coupons with expiry and minimum order rules
  - Homepage customizer for hero banner, brand story, and FAQs
  - Review moderation
  - Veda Mitra AI custom QA pairs training
  - Store identity, contact details, FSSAI licence number, shipping thresholds, tax rates, and Razorpay API credentials.

---

## 2. What Was Broken

| Issue | Severity | Location | Root Cause |
|---|---|---|---|
| **`/admin/login` Crash** | Critical | `src/app/admin/login/page.tsx` | Missing `import Link from 'next/link'` causing `ReferenceError: Link is not defined`. |
| **TypeScript Build Failure** | High | `src/app/api/admin/orders/route.ts` | Nullable `item.productId` passed to non-nullable Prisma schema field in inventory movement. |
| **Missing ESLint Setup** | Medium | Root directory | No `.eslintrc.json` present; `next lint` prompted interactively and failed. |
| **Unrelated/Broken Images** | High | `seed.js`, `ProductCard.tsx`, `/` | Broccoli Unsplash photo for Shilajit, loose curry spices for Saffron, medical pills for Coconut Oil, salad bowl for Chyawanprash. Fallback was hardcoded to the broccoli image. |
| **Tagline Truncation** | Medium | `src/components/layout/Navbar.tsx` | Hardcoded `substring(0, 32) + '...'` sliced off mid-word at `"100% P…"`. |
| **Navigation Wrapping** | Medium | `src/components/layout/Navbar.tsx` | Lack of `whitespace-nowrap` and rigid breakpoint `lg:flex` caused nav items to wrap at 1024–1200px. |
| **Merchant Button Exposed** | Medium | `src/components/layout/Navbar.tsx` | "Merchant" admin button sat side-by-side with "Sign In" in the public header for every visitor. |
| **Silent Fake Account Creation** | Critical | `src/app/api/auth/verify-otp/route.ts` | Mobile OTP login silently registered arbitrary phone numbers as `"Seeker 9422"` with fake email `user_...` without user consent or registration. |
| **Exposed OTP in API response** | Critical | `src/app/api/auth/send-otp/route.ts` | Response returned `demoOtp: otpCode`, displaying "Sandbox Auto-code" and "Auto-Fill" directly on screen. |
| **Hardcoded Public Credentials** | High | `src/app/login/page.tsx` | "View Preloaded Testing Accounts" panel publicly exposed admin staff ID `VV-ADMIN-01` and password `AdminPassword123!`. |
| **No Route Guard Middleware** | Critical | Workspace Root | Missing `middleware.ts`. Admin route protection was only a client-side `useEffect` redirect that can be bypassed or cause layout flashes. |
| **Hardcoded Business Data** | High | `Footer.tsx`, `AnnouncementBar.tsx`, `CartDrawer.tsx` | Hardcoded `VEDIK15`, `₹999`, `CIN: U01111UR2024PTC014299`, and FSSAI number bypassed settings table. |
| **Missing Image Validation** | Medium | `src/app/admin/products/page.tsx` | Allowed saving products without any images. |
| **Leaking Root Layout** | Medium | `src/app/layout.tsx` | Customer `Navbar`, `Footer`, `AnnouncementBar`, and Chatbot rendered around `/admin` routes. |

---

## 3. What Was Duplicated

1. **Two Separate Login Surfaces:**
   - `/admin/login/page.tsx`
   - `/login/page.tsx` (Merchant Portal tab)
   - "Smart Auto-Detection" permitted merchants to enter admin credentials on the customer form.
2. **Session Generation & Verification:**
   - Ad-hoc HMAC cookie signing in `src/lib/auth.ts` without unified role checks or Next.js edge-compatible middleware enforcement.
3. **Price & Free Shipping Calculations:**
   - Calculation logic duplicated across `cart-context.tsx`, `CartDrawer.tsx`, and `checkout/page.tsx` rather than reading from a single settings store.
