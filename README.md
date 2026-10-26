# Dokan Sathi 🏪

[![Laravel Version](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2.0-9553E9?style=for-the-badge&logo=inertia)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Dokan Sathi** is a comprehensive, modern shop management and Point of Sale (POS) web application tailored for retail and wholesale businesses. It empowers shop owners to handle billing, inventory procurement, customer balances, supplier accounts, and profit & loss analytics—all with lightning speed and a responsive, mobile-first design.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture & Screenshots](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Database & Seeders](#-database--seeders)
- [Running the Application](#-running-the-application)
- [Invoice Formats](#-invoice-formats)
- [Project Directory Structure](#-project-directory-structure)
- [Testing](#-testing)
- [License](#-license)

---

## ✨ Key Features

### 🛒 High-Speed Point of Sale (POS)
- **Fast Billing**: Instant product search with keyboard shortcuts and quantity adjustment tickers.
- **Customer Association**: Link sales to registered customers or proceed with walk-in open sales.
- **Payment & Due Tracking**: Real-time tracking of paid amount, partial payments, and customer due balances.
- **Period & Week Filtering**: Filter sales records by predefined date periods, calendar weeks, or custom date ranges.

### 📄 Professional Invoicing & PDF Generation
- **Standard A4 Invoice**: Full-page breakdown with Dokan branding, customer details, and itemized calculations.
- **Half-Page A5 Invoice**: Compact, paper-saving single-order invoice.
- **2-in-1 Dual A4 Invoice**: Prints both the **Customer Copy** and **Store Copy** side-by-side on a single A4 page with an aesthetic scissor-cut divider.
- Direct PDF downloads powered by `barryvdh/laravel-dompdf`.

### 📦 Product & Inventory Management
- **Packet & Unit Tracking**: Supports packaging dimensions (packet size in pieces, purchased packets, and unit breakdown).
- **Dual Valuation**: Tracks Cost Price (CP) and Selling Price (SP) for accurate inventory valuation.
- **Low Stock Alerts**: Configurable reorder levels with visual badges and responsive mobile cards.
- **Public & Internal Price Lists**: Exportable price list with shareable public URLs (`/{dokan:slug}/price-list`) and downloadable PDF catalogs.

### 📋 Orders & Restocking (Suppliers & Customers)
- **Dual-Party Orders**: Create orders for vendor procurement (suppliers) or bookings/pre-orders for customers.
- **Auto-Catalog Synchronization**: Adding new items to an order automatically creates or updates the product catalog.
- **Inventory Auto-Credit**: Marking an order as **Received** instantly updates inventory stock levels.

### 👥 Customer & Supplier Management
- **Customer Ledger**: Track purchase history, total sales, and pending due amounts in one unified view.
- **Supplier Directory**: Keep company details, phone numbers, and procurement histories organized.
- **Activity Auditing**: Single-column `Added / Edited By` tracking for accountability.

### 📊 Financial Insights & P&L Reports
- **Sales Analytics**: Interactive charts displaying revenue, cost of goods sold (COGS), and gross margins.
- **Overhead Costs Tracker**: Record operational expenses (rent, electricity, salaries, transport, tea/snacks).
- **Net Profit & Loss Statement**: Comprehensive P&L calculation incorporating sales profit minus overhead costs.
- **Investment Tracking**: Log capital investments and partner contributions.

### 🏬 Multi-Dokan (Multi-Shop) Support
- Switch between multiple shops/branches from a single user account.
- Individual shop profiles with custom branding, logo, contact information, and public slugs.
- Role-based permissions (Store Owner vs. Staff).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | [Laravel 11](https://laravel.com) (PHP 8.2+) |
| **Frontend Architecture** | [Inertia.js v2](https://inertiajs.com) (SPA without client-side API routing) |
| **UI Library** | [React 18](https://react.dev) |
| **Styling & Components** | [Tailwind CSS 3](https://tailwindcss.com), [Headless UI](https://headlessui.com) |
| **Icons & Notifications** | [React Icons](https://react-icons.github.io/react-icons/), [React Hot Toast](https://react-hot-toast.com) |
| **Bundler & Tooling** | [Vite 6](https://vitejs.dev) |
| **PDF Engine** | [laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) |
| **Database** | MySQL / SQLite |

---

## 🚀 Installation & Setup

### Prerequisites
- **PHP** >= 8.2 (with `pdo`, `mbstring`, `gd`, `xml`, `bcmath` extensions)
- **Composer** >= 2.x
- **Node.js** >= 18.x & **NPM**
- **MySQL** 8.0+ or **SQLite**

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Subhadip023/dokan-sathi.git
   cd dokan-sathi
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Set up database configuration in `.env`**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dokan_sathi
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *(Or set `DB_CONNECTION=sqlite` for zero-configuration local development)*

6. **Run database migrations & seeders**:
   ```bash
   php artisan migrate --seed
   ```

7. **Create storage symbolic link**:
   ```bash
   php artisan storage:link
   ```

---

## 💻 Running the Application

### Development Mode (Concurrent)
You can run the PHP server and Vite bundler together:
```bash
composer run dev
```
Or run each process in separate terminals:
```bash
# Terminal 1: Laravel Backend
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev
```

Visit the app at: `http://localhost:8000`

### Production Build
To create an optimized production build for deployment:
```bash
npm run build
```

---

## 🖨️ Invoice Formats

Dokan Sathi supports multiple printing formats to minimize paper waste:

| Format | Endpoint / Query Parameter | Description |
|---|---|---|
| **A4 Full Invoice** | `/sales/invoice/pdf?sale_id={id}&format=a4` | Full-page comprehensive invoice |
| **A5 Half-Page** | `/sales/invoice/pdf?sale_id={id}&format=a5` | Landscape half-page format |
| **2-in-1 Dual A4** | `/sales/invoice/pdf?sale_id={id}&format=2in1` | Customer Copy + Store Copy on 1 page with cut line |

---

## 📂 Project Directory Structure

```plaintext
dokan-sathi/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # POS, Sales, Orders, Customers, Dokan controllers
│   │   ├── Requests/          # Form request validations (StoreOrderRequest, etc.)
│   │   └── Middleware/        # HandleInertiaRequests, Multi-dokan resolver
│   └── Models/                # Eloquent models (Dokan, Product, Sale, Order, Coustomer, etc.)
├── database/
│   ├── migrations/            # Schema definitions
│   └── seeders/               # Demo data seeders (DemoDokanSeeder, ProductSeeder, etc.)
├── resources/
│   ├── js/
│   │   ├── Components/        # Reusable UI (Modal, SearchableSelect, Buttons, Tickers)
│   │   ├── Layouts/           # AuthenticatedLayout, GuestLayout
│   │   └── Pages/             # Inertia pages (Dashboard, sale, order, product, coustomer, reports)
│   └── views/                 # Blade templates for DomPDF invoices (pdf/invoice-*.blade.php)
├── routes/
│   ├── web.php                # Web routes & public catalog routes
│   └── auth.php               # Authentication routes
└── tests/                     # Unit and feature tests
```

---

## 🧪 Testing

Run the automated PHPUnit test suite:
```bash
php artisan test
```

---

## 📄 License

This project is open-source software licensed under the [MIT license](LICENSE).
