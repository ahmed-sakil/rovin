# ROVIN Platform — Version 1.0 Technical & Operational Documentation

> **Release Version:** 1.0.0 (Production Ready)  
> **Architecture Pattern:** Modular PERN (PostgreSQL 16 + Prisma 6, Express + Node.js 22 LTS in TypeScript, React 19 + Vite + Tailwind CSS)  
> **Design Theme:** Dark Industrial Mechanical • Nitro Amber Gold (`#FFC837` / `#ED6A00`) • Deep Carbon Slate (`#0E0F14`) • Pitch Obsidian (`#07070A`)  
> **Target Market:** Bangladesh E-Commerce (1-Page Express Checkout, COD, bKash/Nagad MFS, Steadfast & Pathao Courier Integrations)

---

## 1. Executive Summary

ROVIN V1.0 is a specialized, high-performance direct-to-consumer (D2C) e-commerce platform and administrative operating system engineered specifically for high-torque radio-controlled (RC) drift machines, enthusiast hardware, and tactical lifestyle electronics in Bangladesh. 

V1.0 establishes an end-to-end e-commerce pipeline featuring:
- High-conversion Equipment Catalog Hangar with real-time multi-attribute filtering (categories, scales, price ranges, stock status).
- Color and scale variant management with color-specific product gallery synchronization.
- 1-Page Express Checkout with integrated Guest-to-Pilot Authentication Gate, auto-selected delivery charges, and local MFS support.
- Standalone Customer Station (`/orders` & `/account`) with order tracking, status history, customer order cancellation, custom avatar upload with 2MB validation, and saved delivery addresses.
- Community Review & Rating engine with verified purchaser attribution and anti-spam limits.
- Admin Command Telemetry Deck featuring a date-selectable Daily Performance Report, inventory health ledger, order pipeline management, Courier API booking (Steadfast & Pathao), 4"×6" thermal consignment label generation, security audit trail, and user moderation.

---

## 2. Technology Stack & Architectural Overview

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATIONS                                |
+---------------------------------------------------------------------------------------+
|  Storefront Experience (React + Vite + TS)     |  Admin Control Deck (React + Vite)   |
|  - Modern Catalog & Search Grid               |  - Fixed Left Navigation Bar         |
|  - Color-Synced Variant Photo Viewer           |  - Date-Selectable Daily Telemetry   |
|  - 1-Page Pilot Checkout                       |  - Order Dispatch & 4x6 Label Gen    |
|  - Standalone Mission Orders & Cancellation   |  - Category & Variant Inventory Hub  |
|  - Centralized Account & Address Matrix        |  - Security Audit & User Moderation  |
+---------------------------------------------------------------------------------------+
                                           |
                                   REST JSON (HTTPS)
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           EXPRESS 4.x + TYPESCRIPT API GATEWAY                         |
|  - Security: Helmet, CORS, Trust Proxy, XSS Sanitization, Zod Schema Validation       |
|  - Rate Limiters: General, Auth (5/min), Reviews (3/hr), Uploads (10/min)            |
|  - Auth Middleware: JWT Bearer Tokens, Role-Based Access Control (ADMIN, STAFF, USER) |
+---------------------------------------------------------------------------------------+
        |                               |                              |
        v                               v                              v
+---------------+             +--------------------+            +---------------+
| Core Services |             | Courier Adapters   |            | Third-Party   |
| - Auth & OTP  |             | - Steadfast API    |            | - Cloudinary  |
| - Orders Hub  |             | - Pathao API       |            |   CDN / Local |
| - Products    |             | - 4x6 Thermal SVG  |            | - Nodemailer  |
| - Reviews     |             |   Code128 Barcodes |            |   SMTP / OTP  |
| - Audit Logs  |             +--------------------+            +---------------+
+---------------+                               
        |
        v
+---------------------------------------------------------------------------------------+
|                             PRISMA 6.x ORM DATA ACCESS LAYER                          |
+---------------------------------------------------------------------------------------+
|                                  PostgreSQL 16 DATABASE                               |
|  - 14 Normalized Relational Models + JSONB Attributes + Atomic Transactions           |
+---------------------------------------------------------------------------------------+
```

### Backend Components
- **Runtime:** Node.js 22 LTS (ES Modules with TypeScript `tsx` and compiled `dist/`)
- **Web Framework:** Express 4.21 with strict typed middleware pipelines
- **Database & ORM:** PostgreSQL 16 managed via Prisma ORM 6.19+
- **Security & Integrity:** `helmet`, `cors`, `express-rate-limit`, `validator`, `sanitize-html`, `bcrypt`
- **File Management:** Multer with memory/disk buffers + Cloudinary SDK v2
- **Email & Alerts:** Nodemailer SMTP transport with console fallback logger

### Frontend Components
- **Framework:** React 19 with Vite 6 build engine
- **Styling:** Tailwind CSS with centralized brand palette tokens (`nitro-amber`, `carbon-slate`, `pitch-obsidian`, `machined-titanium`, `fastener-border`)
- **Icons:** Lucide React
- **Notifications:** Sonner Toast notification stack
- **Routing:** React Router DOM v7 (Data Router pattern with lazy components)
- **State Architecture:** Context API (`AuthContext`, `CartContext`, `ThemeContext`) with `localStorage` persistence

---

## 3. Functional Modules Breakdown

### 3.1 Authentication & Security Engine
- **Role-Based Access Control (RBAC):** Three role tiers: `CUSTOMER`, `STAFF`, and `ADMIN`. Protected routes check role hierarchies.
- **6-Digit OTP Flow:**
  - Secure verification codes generated via `crypto.randomInt(100000, 999999)`.
  - Stored with bcrypt hashing in `OtpVerification` model with a 5-minute time-to-live (TTL).
  - Sent via SMTP (Google Workspace / Resend / Brevo) with a zero-crash fallback to secure server logs for development and deployment resilience.
- **Rate Limiting:**
  - General API: 300 requests per 15-minute window.
  - Auth Endpoints (`/login`, `/register`, `/otp`): Strict 5 requests per minute per IP.
  - Reviews: 5 submissions per hour per user.
- **Audit Trails (`UserActivityLog`):** Every significant security or commerce action is captured with `userId`, `action` (`LOGIN`, `ORDER_CREATE`, `ORDER_STATUS_UPDATE`, `REVIEW_POST`, `BAN_USER`), `ipAddress`, `userAgent`, and `details` payload.
- **Account Moderation:** Admins can issue strikes, suspend accounts (`isBanned: true`), record ban reasons, and enforce ban expirations.

### 3.2 Product Catalog & Variant Matrix
- **Category & Subcategory Hierarchy:** Dynamic tree with database slugs, active status flags, descriptions, and product counters.
- **Color Matrix with Photo Linking:**
  - Products store available colors with Name and Hex value (e.g., `Gunmetal #2B2D42`, `Nitro Amber #FFC837`).
  - Supports color-specific image mappings: selecting a color swatch dynamically switches the primary gallery image to that color's specific photograph.
- **Technical Specifications:** JSONB field storing motor torque, chassis material, scale, battery capacity, runtime, and package contents breakdown ("What's in the Box").
- **Stock Telemetry:** Real-time stock counts with automated categorization into *Optimal Stock*, *Low Stock (<= 5)*, and *Out of Stock*.

### 3.3 Shopping Cart & 1-Page Express Checkout
- **Cart Context:** Supports quantity manipulation, color selection, scale selection, stock bounding, and persistent local storage caching.
- **Pilot Checkout Gate:** Unauthenticated users can log in or register with instant 6-digit OTP verification directly inside the checkout view without losing cart state.
- **Bangladesh Logistics Engine:**
  - Dynamic division & district selector covering all 64 districts and major thanas of Bangladesh.
  - Delivery charge rules configured in `SystemSettings`: Inside Dhaka (৳70 default), Outside Dhaka (৳130 default), and Free Shipping Threshold (৳5,000 default).
- **Payment Options:**
  - Cash on Delivery (COD) with verification prompt.
  - Manual Mobile Financial Services (bKash & Nagad) with merchant number display, customer sender number input, and TrxID logging.
- **Coupons:** Fixed amount or percentage discounts with minimum order value and active date range constraints.

### 3.4 Standalone Customer Portal & Orders Hub
- **Dedicated Orders Page (`/orders`):**
  - Displays all orders for the authenticated customer.
  - Highlights order status (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`).
  - Courier Consignment live tracking code display.
  - Customer Self-Service Cancellation: Customers can cancel and delete an order directly if it has not yet been confirmed by the administration team.
- **Centralized Profile (`/account`):**
  - Centralized banner, avatar, contact information, and membership badges.
  - 3-option centered tab ribbon: `Profile`, `Addresses`, `Security`.
  - Avatar Selector: 6 tactical avatars or custom photo upload with client and server 2MB size enforcement.
  - Saved Address Matrix: Multiple shipping addresses (Home, Office) with default address toggling.
  - Security Key Management: Password update with current password verification and confirmation checks.

### 3.5 Customer Review & Rating Engine
- **Review Architecture:**
  - 1-to-5 star rating system with detailed technical review comments.
  - Verified Purchaser Badge: System automatically queries past delivered orders to mark authentic reviews.
  - Duplicate Prevention: Customers can only review each product once per account.
  - Storefront Display: Average star calculation, rating distribution breakdown, and latest customer testimonials displayed directly on product pages.
  - Admin Moderation: Ability to flag or remove inappropriate reviews from the admin console.

### 3.6 Admin Command Telemetry Deck
- **Fixed Left Navigation Bar:** Persistent, non-scrolling industrial sidebar with access to Telemetry, Products, Categories, Orders, Customers, and System Settings.
- **Date-Selectable Daily Performance Report:**
  - Interactive date picker allowing admins to choose today or any historical date.
  - 5 Operational KPIs:
    1. *New Accounts*: User registrations on that date.
    2. *Unique Visitors*: Distinct client IP addresses recorded in activity logs.
    3. *Orders Placed*: Total orders received.
    4. *Completed Orders*: Orders delivered on that date.
    5. *Day Revenue*: Gross revenue generated by confirmed/delivered orders.
  - Reset Today button for quick real-time operational monitoring.
- **Order Pipeline & Dispatch:**
  - Step-by-step status transitions (`PENDING` -> `CONFIRMED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).
  - Admin order deletion capability with confirmation protection.
  - Bulk actions, customer contact display, and payment status verification.
- **Courier API Integrations (Steadfast & Pathao):**
  - 1-click consignment creation sending customer name, phone, address, and COD collectable amount to Steadfast or Pathao APIs.
  - Automatic receipt of `consignment_id` and tracking codes stored in `CourierConsignment`.
  - Standard 4"×6" (100×150mm) Thermal Shipping Label generator with Code128 barcodes ready for thermal label printers.
- **System Settings Deck:**
  - Independent system configuration: update Inside Dhaka / Outside Dhaka delivery fees, free shipping threshold, and bKash/Nagad merchant numbers without touching code or profile data.

---

## 4. Database Schema (Prisma 6.x)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  STAFF
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PACKED
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

enum PaymentMethod {
  COD
  BKASH
  NAGAD
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

model User {
  id              String            @id @default(uuid())
  email           String            @unique
  phone           String            @unique
  passwordHash    String
  name            String
  gender          Gender            @default(MALE)
  dateOfBirth     DateTime?
  profileImageUrl String?
  role            Role              @default(CUSTOMER)
  isVerified      Boolean           @default(false)
  isBanned        Boolean           @default(false)
  banReason       String?
  banExpiresAt    DateTime?
  strikeCount     Int               @default(0)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  addresses       Address[]
  orders          Order[]
  reviews         Review[]
  activityLogs    UserActivityLog[]
}

model Address {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title         String   @default("Home")
  recipientName String
  phoneNumber   String
  district      String
  thana         String
  addressLine   String
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OtpVerification {
  id        String   @id @default(uuid())
  target    String   // Email or phone number
  otpHash   String
  attempts  Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Category {
  id            String        @id @default(uuid())
  name          String        @unique
  slug          String        @unique
  description   String?
  imageUrl      String?
  isActive      Boolean       @default(true)
  subcategories Subcategory[]
  products      Product[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Subcategory {
  id          String    @id @default(uuid())
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        String
  slug        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id             String       @id @default(uuid())
  title          String
  slug           String       @unique
  sku            String       @unique
  description    String
  shortDesc      String?
  price          Float
  compareAtPrice Float?
  stockQuantity  Int          @default(0)
  images         String[]     @default([])
  colorImages    Json?        // Map of color name to image URL
  colors         Json?        // Array of { name, hex }
  scales         String[]     @default([])
  specs          Json?        // Dynamic technical specs
  boxContents    String[]     @default([])
  weightGrams    Int?
  isFeatured     Boolean      @default(false)
  isActive       Boolean      @default(true)
  categoryId     String
  category       Category     @relation(fields: [categoryId], references: [id])
  subcategoryId  String?
  subcategory    Subcategory? @relation(fields: [subcategoryId], references: [id])
  orderItems     OrderItem[]
  reviews        Review[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Review {
  id                 String   @id @default(uuid())
  productId          String
  product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating             Int      @default(5)
  comment            String
  isVerifiedPurchase Boolean  @default(false)
  isApproved         Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Order {
  id              String               @id @default(uuid())
  orderNumber     String               @unique
  userId          String?
  user            User?                @relation(fields: [userId], references: [id])
  customerName    String
  customerPhone   String
  deliveryAddress String
  district        String
  thana           String
  subtotal        Float
  deliveryCharge  Float
  discountAmount  Float                @default(0)
  totalAmount     Float
  paymentMethod   PaymentMethod        @default(COD)
  paymentStatus   PaymentStatus        @default(UNPAID)
  orderStatus     OrderStatus          @default(PENDING)
  trxId           String?
  senderPhone     String?
  notes           String?
  orderItems      OrderItem[]
  consignments    CourierConsignment[]
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  quantity    Int
  unitPrice   Float
  totalPrice  Float
  chosenColor String?
  chosenSize  String?
  createdAt   DateTime @default(now())
}

model CourierConsignment {
  id            String   @id @default(uuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  courier       String   // "STEADFAST" or "PATHAO"
  consignmentId String
  trackingCode  String?
  status        String   @default("IN_REVIEW")
  rawResponse   Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Coupon {
  id            String   @id @default(uuid())
  code          String   @unique
  discountType  String   // "PERCENTAGE" or "FIXED"
  discountValue Float
  minOrderValue Float    @default(0)
  expiresAt     DateTime
  isActive      Boolean  @default(true)
  usageCount    Int      @default(0)
  createdAt     DateTime @default(now())
}

model SystemSettings {
  id                         String   @id @default("default")
  deliveryChargeInsideDhaka  Float    @default(70)
  deliveryChargeOutsideDhaka Float    @default(130)
  freeShippingThreshold      Float?   @default(5000)
  bkashMerchantNumber        String?
  nagadMerchantNumber        String?
  maintenanceMode            Boolean  @default(false)
  updatedAt                  DateTime @updatedAt
}

model UserActivityLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    String
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

---

## 5. API Endpoints Directory (V1.0)

### 5.1 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/send-otp` | Public (Rate Limited) | Issues 6-digit OTP code to email |
| `POST` | `/verify-otp` | Public | Validates OTP hash and marks target verified |
| `POST` | `/register` | Public | Creates new customer account with verified OTP |
| `POST` | `/login` | Public | Authenticates credentials and returns JWT Bearer token |
| `GET` | `/me` | Authenticated | Returns currently authenticated user profile |
| `PUT` | `/profile` | Authenticated | Updates name, phone, gender, DOB, and avatar |
| `POST` | `/change-password` | Authenticated | Validates old password and sets new password |
| `POST` | `/addresses` | Authenticated | Stores new delivery address in address book |
| `DELETE` | `/addresses/:id` | Authenticated | Deletes specific saved address |

### 5.2 Products & Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Paginated product list with search, category, scale, and stock filter |
| `GET` | `/:slug` | Public | Single product details, variant images, and technical specs |
| `POST` | `/` | Admin/Staff | Creates new product with colors, scales, and inventory |
| `PUT` | `/:id` | Admin/Staff | Updates product data, price, stock, or active state |
| `DELETE` | `/:id` | Admin | Deletes product from catalog |

### 5.3 Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/product/:productId` | Public | Retrieves approved reviews and aggregate star rating |
| `POST` | `/` | Authenticated | Submits 1-5 star review; checks verified purchase status |
| `DELETE` | `/:id` | Admin | Moderates and deletes review |

### 5.4 Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/checkout` | Authenticated | Validates stock, calculates delivery, creates order atomically |
| `GET` | `/my-orders` | Authenticated | Retrieves personal order history for authenticated customer |
| `GET` | `/:orderNumber` | Authenticated/Admin | Order details view |
| `DELETE` | `/:id` | Authenticated (Unconfirmed) / Admin | Cancels and deletes order |

### 5.5 Admin Control Deck (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin/Staff | Telemetry KPIs, distribution charts, and daily stats |
| `GET` | `/daily-report?date=YYYY-MM-DD` | Admin/Staff | Retrieves 5 operational KPIs for a selected date |
| `GET` | `/orders` | Admin/Staff | Full order ledger with search and status filters |
| `PUT` | `/orders/:id/status` | Admin/Staff | Updates order pipeline status (`CONFIRMED`, `SHIPPED`, etc.) |
| `DELETE` | `/orders/:id` | Admin | Permanently deletes an order and items |
| `GET` | `/users` | Admin | User list with strike counts, roles, and ban statuses |
| `POST` | `/users/:id/ban` | Admin | Bans or unbans user with reason and expiry |
| `GET` | `/audit-logs` | Admin | System audit trail records |
| `GET` | `/settings` | Public/Admin | Retrieves system delivery charges and MFS numbers |
| `PUT` | `/settings` | Admin | Updates delivery charges, free threshold, and MFS numbers |

### 5.6 Courier Hub (`/api/courier`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/steadfast/create` | Admin/Staff | Dispatches consignment payload to Steadfast API |
| `POST` | `/pathao/create` | Admin/Staff | Dispatches consignment payload to Pathao API |
| `GET` | `/label/:orderId` | Admin/Staff | Renders 4"x6" Thermal Consignment Shipping Label (SVG/HTML) |

### 5.7 Uploads (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/single` | Authenticated | Uploads single image (Max 2MB) to Cloudinary or disk |
| `POST` | `/multiple` | Admin/Staff | Uploads up to 10 product gallery photos |

---

## 6. Verification and Deployment Status

- **Monorepo Build:** Verified via `npm run build` with zero TypeScript compilation errors.
- **Backend Build:** Passes `prisma generate && tsc` with strict typing.
- **Frontend Build:** Passes `tsc -b && vite build` (Vite v6 production bundle generated).
- **Environment Parity:** Configured for both local development and production container deployment (Render / Railway / Supabase / Vercel).
