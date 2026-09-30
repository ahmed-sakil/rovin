# ROVIN V2 Navigator & Codebase Index

> **Purpose:** Rapid-Lookup Map for Developers & AI Agents.  
> **Goal:** Eliminate multi-file search cycles. Locate the exact files, line ranges, models, controllers, and components for any task in seconds.

---

## 1. Quick Feature-to-File Matrix (Instant Lookup)

| Feature / Domain | Backend Controller & Route | Frontend View & Component | Prisma Model(s) |
| :--- | :--- | :--- | :--- |
| **Daily Report (Date Picker & Metrics)** | `backend/src/controllers/adminController.ts` (`getDailyReport`, `getDashboardStats`)<br>`backend/src/routes/adminRoutes.ts` | `frontend/src/pages/admin/AdminDashboard.tsx` | `User`, `Order`, `UserActivityLog` |
| **Catalog & Filter Hangar** | `backend/src/controllers/productController.ts` (`getProducts`)<br>`backend/src/routes/productRoutes.ts` | `frontend/src/pages/storefront/ProductsCatalog.tsx`<br>`frontend/src/components/catalog/FilterModal.tsx` | `Product`, `Category`, `Subcategory` |
| **Product Details & Color Sync** | `backend/src/controllers/productController.ts` (`getProductBySlug`)<br>`backend/src/routes/productRoutes.ts` | `frontend/src/pages/storefront/ProductDetail.tsx` | `Product`, `Review` |
| **Product Management (Admin)** | `backend/src/controllers/productController.ts` (`createProduct`, `updateProduct`, `deleteProduct`)<br>`backend/src/routes/productRoutes.ts` | `frontend/src/pages/admin/AdminProducts.tsx`<br>`frontend/src/components/admin/ColorImagePicker.tsx` | `Product`, `Category`, `Subcategory` |
| **Category Management** | `backend/src/controllers/categoryController.ts`<br>`backend/src/routes/categoryRoutes.ts` | `frontend/src/pages/admin/AdminCategories.tsx` | `Category`, `Subcategory` |
| **Shopping Cart Engine** | Client-side Context with local storage | `frontend/src/context/CartContext.tsx`<br>`frontend/src/components/layout/StorefrontNavbar.tsx` | N/A (Client State) |
| **1-Page Express Checkout** | `backend/src/controllers/orderController.ts` (`createOrder`)<br>`backend/src/routes/orderRoutes.ts` | `frontend/src/pages/storefront/CheckoutPage.tsx` | `Order`, `OrderItem`, `Address`, `Coupon`, `SystemSettings` |
| **Orders Hub (Customer)** | `backend/src/controllers/orderController.ts` (`getMyOrders`, `cancelMyOrder`)<br>`backend/src/routes/orderRoutes.ts` | `frontend/src/pages/storefront/CustomerOrders.tsx` | `Order`, `OrderItem`, `CourierConsignment` |
| **Orders Hub (Admin)** | `backend/src/controllers/adminController.ts` (`getOrders`, `updateOrderStatus`, `deleteOrder`)<br>`backend/src/routes/adminRoutes.ts` | `frontend/src/pages/admin/AdminOrders.tsx` | `Order`, `OrderItem`, `CourierConsignment` |
| **Courier Dispatch (Steadfast & Pathao)** | `backend/src/controllers/courierController.ts` (`createConsignment`)<br>`backend/src/routes/courierRoutes.ts` | `frontend/src/pages/admin/AdminOrders.tsx` (Courier modal) | `CourierConsignment`, `Order` |
| **Thermal 4"x6" Label Generator** | `backend/src/services/couriers/thermalLabel.ts`<br>`backend/src/controllers/courierController.ts` | `frontend/src/pages/admin/AdminOrders.tsx` (Print action) | `Order`, `CourierConsignment` |
| **User Profile & Tactical Avatars** | `backend/src/controllers/authController.ts` (`updateProfile`, `changePassword`)<br>`backend/src/routes/authRoutes.ts` | `frontend/src/pages/storefront/CustomerAccount.tsx` | `User`, `Address` |
| **Saved Addresses Book** | `backend/src/controllers/authController.ts` (`addAddress`, `deleteAddress`)<br>`backend/src/routes/authRoutes.ts` | `frontend/src/pages/storefront/CustomerAccount.tsx` | `Address`, `User` |
| **Review & Ratings Engine** | `backend/src/controllers/reviewController.ts`<br>`backend/src/routes/reviewRoutes.ts` | `frontend/src/pages/storefront/ProductDetail.tsx` (Reviews tab)<br>`frontend/src/components/storefront/ReviewFormModal.tsx` | `Review`, `Product`, `Order` |
| **User Management & Bans (Admin)** | `backend/src/controllers/adminController.ts` (`getUsers`, `banUser`)<br>`backend/src/routes/adminRoutes.ts` | `frontend/src/pages/admin/AdminUsers.tsx` | `User`, `UserActivityLog` |
| **Security Audit Logs** | `backend/src/controllers/adminController.ts` (`getAuditLogs`)<br>`backend/src/routes/adminRoutes.ts` | `frontend/src/pages/admin/AdminAuditLogs.tsx` | `UserActivityLog`, `User` |
| **System Settings (Fees & MFS)** | `backend/src/controllers/adminController.ts` (`getSettings`, `updateSettings`)<br>`backend/src/routes/adminRoutes.ts` | `frontend/src/pages/admin/AdminSettings.tsx` | `SystemSettings` |
| **Media & Photo Uploads** | `backend/src/controllers/uploadController.ts`<br>`backend/src/routes/uploadRoutes.ts` | `frontend/src/components/admin/FileUploadZone.tsx` | Cloudinary CDN / Disk |

---

## 2. Directory Tree & Responsibilities

```
ROVIN/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma               # SINGLE SOURCE OF TRUTH for database models
│   ├── src/
│   │   ├── config/                     # Environment, Cloudinary, and mailer setups
│   │   ├── controllers/                # Core business logic:
│   │   │   ├── adminController.ts      # Dashboard stats, daily report, audit logs, ban, settings
│   │   │   ├── authController.ts       # Register, login, OTP, profile, addresses, password
│   │   │   ├── categoryController.ts   # Category and subcategory CRUD
│   │   │   ├── courierController.ts    # Steadfast, Pathao API dispatch, label rendering
│   │   │   ├── orderController.ts      # Checkout, customer orders, cancellation
│   │   │   ├── productController.ts    # Product queries, variant handling, stock updates
│   │   │   ├── reviewController.ts     # Reviews, ratings, verified purchase attribution
│   │   │   └── uploadController.ts     # Cloudinary / local multipart image upload
│   │   ├── middlewares/                # auth.ts, roleCheck.ts, rateLimiters.ts, sanitize.ts
│   │   ├── routes/                     # Mounts all express routes to /api/*
│   │   ├── services/                   # External adapters:
│   │   │   ├── couriers/               # Steadfast & Pathao APIs, thermal label generator
│   │   │   ├── otp/                    # Email / SMTP OTP transport with console fallback
│   │   │   ├── cloudinary.ts           # Cloudinary image pipeline
│   │   │   └── moderation.ts           # User activity logger & strike tracking
│   │   └── server.ts                   # Express server entry point, CORS, trust proxy, rate limit
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                  # Admin-specific widgets (ColorImagePicker, FileUpload)
│   │   │   ├── brand/                  # BrandLogo.tsx (official vector SVG marks)
│   │   │   ├── catalog/                # FilterModal.tsx, CategoryGrid.tsx
│   │   │   ├── layout/                 # StorefrontNavbar, StorefrontFooter, AdminLayout, AdminSidebar
│   │   │   ├── product/                # ProductCard.tsx, ColorSwatch.tsx
│   │   │   └── ui/                     # Reusable inputs, modal wrappers, Sonner toast
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # User token, role, login/logout, profile refresh
│   │   │   ├── CartContext.tsx         # Cart items, quantities, colors, scales, storage sync
│   │   │   └── ThemeContext.tsx        # 'dark' / 'light' theme state
│   │   ├── pages/
│   │   │   ├── admin/                  # AdminDashboard, AdminProducts, AdminOrders, AdminSettings...
│   │   │   └── storefront/             # ProductsCatalog, ProductDetail, CheckoutPage, CustomerAccount, CustomerOrders
│   │   ├── App.tsx                     # React Router routes definition
│   │   ├── index.css                   # Tailwind base, CSS variables, zero-shift scrollbars
│   │   └── main.tsx                    # React DOM root entry
│   └── package.json
```

---

## 3. Playbooks for Common V2 Tasks

### Playbook A: Adding a New Field to Products
1. **Database:** Edit `backend/prisma/schema.prisma` inside `model Product`. Run `npx prisma db push` or `prisma migrate`.
2. **Backend API:**
   - In `backend/src/controllers/productController.ts`: Add field to `createProduct` and `updateProduct` destructured inputs.
3. **Admin UI:**
   - In `frontend/src/pages/admin/AdminProducts.tsx`: Add input field in the product modal state (`formData`) and form JSX.
4. **Storefront UI:**
   - In `frontend/src/pages/storefront/ProductDetail.tsx` or `ProductCard.tsx`: Display the new attribute.

### Playbook B: Adding a New Dashboard Metric to Daily Report
1. **Backend Query:**
   - In `backend/src/controllers/adminController.ts`: Inside `getDailyReport` (and `getDashboardStats`), add the Prisma query within `Promise.all` using `{ createdAt: { gte: dayStart, lte: dayEnd } }`.
   - Add the metric to the returned `report` JSON object.
2. **Frontend View:**
   - In `frontend/src/pages/admin/AdminDashboard.tsx`: Add the field to `interface DailyReport`.
   - Render the new card in the `Daily Performance Telemetry` grid.

### Playbook C: Adding a New Courier Partner
1. **Courier Service:**
   - In `backend/src/services/couriers/`: Create `newCourierAdapter.ts` adhering to consignment payload requirements (Customer, Address, Phone, COD Amount).
2. **Backend Dispatch Route:**
   - In `backend/src/controllers/courierController.ts`: Add `createNewCourierConsignment(req, res)`.
   - In `backend/src/routes/courierRoutes.ts`: Mount `POST /api/courier/new-courier/create`.
3. **Admin Trigger:**
   - In `frontend/src/pages/admin/AdminOrders.tsx`: Add the courier option in the consignment modal dropdown.

### Playbook D: Adding a New System Setting
1. **Database:** Edit `model SystemSettings` in `backend/prisma/schema.prisma`.
2. **Backend API:**
   - In `backend/src/controllers/adminController.ts`: Include the new field in `getSettings` and `updateSettings`.
3. **Admin UI:**
   - In `frontend/src/pages/admin/AdminSettings.tsx`: Add form state and UI control.

---

## 4. Key Conventions to Remember
- **Brand Palette:** Always use Tailwind classes `nitro-amber`, `carbon-slate`, `pitch-obsidian`, `machined-titanium`, `fastener-border`. Never use random bright or pastel colors.
- **Buttons:** Use utility classes `.nitro-btn` (primary amber gold) or `.outline-btn` (machined titanium border).
- **Fonts:** `font-orbitron` for headers and telemetry tags; `font-mono` / `font-sans` for numbers, prices, and technical specs.
- **Feedback:** Always notify user via `toast.success()`, `toast.error()`, or `toast.info()` from `sonner`.
- **Auth Tokens:** Auth tokens are stored in `localStorage.getItem('rovin_token')` and sent in headers as `Authorization: Bearer <token>`.
- **Currency:** Bangladesh Taka `৳` formatted with `.toLocaleString()` (e.g., `৳{(price).toLocaleString()}`).
