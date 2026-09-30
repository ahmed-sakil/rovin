# ROVIN — High-Precision RC Drift & Performance Hardware

<div align="center">

![ROVIN Banner](frontend/public/brand/rovin-logo-dark.svg)

**Engineered Direct-to-Consumer (D2C) E-Commerce Platform & Industrial Administrative OS**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js_22_LTS-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[**V1 Platform Documentation**](V1_DOCUMENTATION.md) • [**V2 Developer & AI Codebase Map**](CODEBASE_MAP.md)

</div>

---

## ⚡ Overview

**ROVIN** is a direct-to-consumer e-commerce ecosystem built from the ground up for radio-controlled drift cars, specialized hobby components, and tactical desktop hardware in Bangladesh. 

Embodying a **"Dark Industrial Mechanical"** aesthetic, ROVIN balances raw performance aesthetics with consumer-first checkout ergonomics:
- **Instant 1-Page Express Checkout** with guest authentication gating and saved address selection.
- **Color-Synced Variant Image Gallery** linking specific vehicle colors to their respective hardware photos.
- **Date-Selectable Daily Performance Report** in the Admin telemetry deck.
- **Steadfast & Pathao Courier Integrations** with automated 4"×6" thermal label generation.
- **Free 6-Digit Email OTP Authentication** with automated console fallback.
- **Community Review & Rating Engine** with verified purchaser attribution.

---

## 🏎️ Core Feature Highlights

### Storefront Experience
- **Equipment Catalog Hangar (`/` & `/products`):** Instant search, multi-category chips, scale filtering (1:10, 1:16, 1:24), price sliders, and real-time stock indicators.
- **Interactive Product Studio (`/product/:slug`):** Color variant selection that instantly shifts gallery photos to the chosen colorway, package breakdown ("What's in the Box"), and technical telemetry specs.
- **Customer Reviews & Ratings:** 1–5 star reviews with verified purchaser badges, average rating indicators, and anti-spam submission rules.
- **1-Page Pilot Checkout (`/checkout`):**
  - Integrated Login/Register OTP gate for guest pilots (cart state is preserved).
  - 1-click address autofill from saved addresses book.
  - Full Bangladesh coverage: Division, district, and thana selector.
  - Automated shipping fee calculation: Inside Dhaka (৳70), Outside Dhaka (৳130), Free delivery over ৳5,000 threshold.
  - Payment via Cash on Delivery (COD) or bKash / Nagad Mobile Financial Services.
- **Standalone Customer Hub:**
  - Dedicated **Mission Orders (`/orders`)**: Real-time status tracker, courier tracking links, and customer self-service cancellation for unconfirmed orders.
  - Centered **Pilot Account (`/account`)**: Tactical avatar selector, 2MB max custom photo upload, saved delivery address matrix, and password security management.

### Admin Command Deck (`/admin`)
- **Fixed Left Navigation Bar:** Persistent industrial navigation sidebar that stays anchored on long ledger pages.
- **Date-Selectable Daily Performance Report:** Choose any historical date or today to inspect:
  1. *New Accounts* (User signups)
  2. *Unique Visitors* (Distinct client IPs recorded in activity logs)
  3. *Orders Placed* (Orders created that day)
  4. *Completed Orders* (Delivered orders)
  5. *Day Revenue* (Gross sales from active orders)
- **Product & Inventory Ledger:** Add/edit products, manage colors and variant photos, assign subcategories, track stock levels, and mark low-stock items.
- **Order Pipeline & Courier Dispatch:** Advance orders through `CONFIRMED` &rarr; `PACKED` &rarr; `SHIPPED` &rarr; `DELIVERED`, delete orders with admin authorization, and dispatch shipments to Steadfast or Pathao APIs.
- **4"×6" Thermal Consignment Labels:** Automatically generates 100×150mm printable thermal labels with Code128 barcodes, shipping details, and COD amounts.
- **Security Audit & Moderation:** Inspect IP activity logs, issue strikes, and suspend abusive accounts with reason and expiration timers.
- **System Settings:** Directly configure delivery charges, free shipping thresholds, and bKash/Nagad merchant numbers.

---

## 🛠️ Tech Stack & Architecture

```
ROVIN PLATFORM
│
├── frontend/                     # React 19 + Vite 6 + Tailwind CSS (SPA)
│   ├── public/brand/             # Official vector emblems, icons, guidelines
│   ├── src/components/storefront # Product Cards, Filter Modals, Reviews, Checkout
│   ├── src/components/admin      # Fixed Sidebar, Telemetry Cards, Image Uploaders
│   ├── src/context/              # AuthContext, CartContext, ThemeContext
│   └── src/pages/                # Route Views (Storefront & Admin)
│
└── backend/                      # Node.js 22 LTS + Express 4.x (TypeScript)
    ├── src/controllers/          # Auth, Products, Orders, Admin, Courier, Reviews
    ├── src/middlewares/          # JWT Auth, RBAC, Rate Limiters, XSS Sanitizer
    ├── src/services/             # Courier Adapters, OTP Engine, Cloudinary Upload
    └── prisma/schema.prisma      # 14 Relational Models (PostgreSQL 16)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v20.x or v22.x LTS
- **PostgreSQL:** v15 or v16
- **npm:** v10.x or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ahmed-sakil/rovin.git
cd rovin

# Install monorepo, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Environment Variables Configuration

Create `backend/.env`:
```env
PORT=5050
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/rovin_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"

# Image Storage (Optional: Cloudinary or Local Disk)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Free SMTP / Email OTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="ROVIN Command <no-reply@rovin.com>"

# Courier Credentials (Optional for live dispatch)
STEADFAST_API_KEY="your_steadfast_key"
STEADFAST_SECRET_KEY="your_steadfast_secret"
PATHAO_CLIENT_ID="your_pathao_client_id"
PATHAO_CLIENT_SECRET="your_pathao_secret"
```

Create `frontend/.env`:
```env
VITE_API_URL="/api"
```

### 3. Database Initialization & Seeding
```bash
# Push schema to database
npm run prisma:generate
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed demo categories, admin credentials, and initial fleet items
npm run seed --prefix backend
```

### 4. Run Development Servers
```bash
# Concurrently launch backend (port 5050) & frontend (port 5173)
npm run dev
```

Visit `http://localhost:5173` to explore the Storefront Hangar or `http://localhost:5173/admin` to access the Command Deck.

---

## 📦 Production Build & Verification

```bash
# Full monorepo production build
npm run build

# Or individual builds
npm run build:backend   # prisma generate && tsc
npm run build:frontend  # tsc -b && vite build
```

---

## 📚 Documentation Index

- [**V1 Technical Documentation (`V1_DOCUMENTATION.md`)**](V1_DOCUMENTATION.md): Complete specifications of all models, functional modules, and API route tables.
- [**Developer & AI Codebase Map (`CODEBASE_MAP.md`)**](CODEBASE_MAP.md): Rapid file-to-feature lookup index and step-by-step playbooks for V2 modifications.
- [**Brand Assets & Guidelines (`frontend/public/brand/BRAND_GUIDELINES.md`)**](frontend/public/brand/BRAND_GUIDELINES.md): Industrial design rules, color tokens, and typography.

---

## 🔒 Security & Data Integrity

- **Rate Limiting:** Protects authentication, review submissions, and media uploads against brute-force attacks.
- **Strict Input Sanitization:** Integrated XSS filters, Zod schemas, and parameterized Prisma queries prevent SQL injection and script execution.
- **Trust Proxy Configuration:** Ready for production reverse-proxies (Render, Cloudflare, NGINX).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Engineered with precision for the RC Community.
