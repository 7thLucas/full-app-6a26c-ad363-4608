# HospitalityHub ERP — Product Overview

## What It Is

HospitalityHub ERP is a production-ready, multi-tenant SaaS platform for the hospitality industry. It provides end-to-end business management for restaurants, cafés, hotels, bakeries, bars, fast food outlets, food courts, and lounges — all from a single unified platform. Each business operates in fully isolated data environments while sharing the underlying infrastructure.

---

## Target Users

| Persona | Description |
|---|---|
| **Super Admin** | Platform operator; manages all tenants and subscriptions |
| **Business Owner** | Controls one or more businesses; views cross-branch P&L |
| **Manager** | Oversees a single branch; monitors staff, inventory, and performance |
| **Cashier** | Runs the POS terminal; handles payments and shift summaries |
| **Waiter / Server** | Takes orders tableside; views order status |
| **Kitchen Staff** | Monitors the Kitchen Display System (KDS) in real time |
| **Accountant** | Accesses financial reports, journal entries, and cash flow |
| **Receptionist** | Manages hotel check-ins, check-outs, and room bookings |
| **Housekeeping** | Tracks room cleaning and maintenance status |

---

## Business Types Supported

- Restaurants
- Cafés
- Hotels
- Bakeries
- Bars
- Fast Food Businesses
- Food Courts
- Lounges

---

## Brand & Tone

- **Name:** HospitalityHub ERP
- **Positioning:** Enterprise-grade hospitality management — powerful enough for hotel chains, simple enough for a single café
- **Tone:** Professional, reliable, modern; clean operational UI with dark/light mode
- **Primary Colors:** Deep blue (`#1E3A5F`) and amber (`#F59E0B`) — trust and energy

---

## Core Modules

### 1. Multi-Tenant Architecture
- Tenants → Businesses → Branches hierarchy
- Every record carries `tenant_id` + `branch_id`
- Complete data isolation between tenants

### 2. Authentication
- Touchscreen PIN keypad (4-digit) for staff login
- JWT tokens with session timeout and activity tracking
- Role-Based Access Control (RBAC)
- Secure PIN hashing

### 3. Role-Specific Dashboards
- **Owner:** Revenue, profit, expenses, top products, top branches
- **Manager:** Branch performance, inventory alerts, employee performance
- **Cashier:** Shift summary, open orders
- **Kitchen:** Live incoming / preparing / ready orders
- **Reception:** Room bookings, check-ins, check-outs

### 4. Point of Sale (POS)
- Product grid with category filtering and search
- Cart, split/merge bills, discounts, refunds, returns, notes
- Payment: Cash, Card, Mobile Money, Bank Transfer, Mixed
- Order states: Pending → Preparing → Ready → Served → Completed / Cancelled
- Receipt printing
- **Offline support** — local storage, queued sync when reconnected

### 5. Menu Management
- Categories → Subcategories → Products → Variants → Modifiers → Combo Meals
- Per-product: Name, description, price, cost price, tax, SKU, barcode, image, status

### 6. Table Management
- Visual floor plan editor; drag-and-drop table placement
- Table actions: create, move, merge, split, reserve
- Table status: Available, Occupied, Reserved, Cleaning

### 7. Kitchen Display System (KDS)
- Real-time Socket.IO updates
- Order lifecycle: Created → Preparing → Ready → Served
- Audio alerts, preparation timers, order priority

### 8. Inventory Management
- Stock management, purchase orders, stock transfers, adjustments, wastage
- Automatic ingredient deduction on each sale
- Low-stock alerts

### 9. Supplier Management
- Supplier profiles, purchase orders, goods received notes, supplier payments

### 10. Customer Relationship Management (CRM)
- Customer profiles, loyalty points, rewards, purchase history
- Birthday reminders, promotional campaigns

### 11. Reservation Management
- **Restaurant:** Date, time, guest count, table assignment
- **Hotel:** Room, check-in/check-out dates, guest details

### 12. Hotel Module
- Room types: Single, Double, Deluxe, Suite, VIP
- Booking calendar, room allocation, check-in/check-out
- Room service, housekeeping, maintenance scheduling
- Room status: Available, Occupied, Reserved, Cleaning, Maintenance

### 13. Accounting
- Income & expense tracking, journal entries, cash flow
- P&L statement, balance sheet
- Expense categories: Salaries, Utilities, Purchases, Rent, Maintenance

### 14. Reporting
- Sales (daily/weekly/monthly/yearly), inventory, customer, staff, financial
- Export: PDF, Excel, CSV

### 15. Notifications
- Channels: SMS, Email, WhatsApp, Push
- Events: New reservation, low stock, payment received, new order

### 16. Security
- JWT + RBAC, audit logs, HTTPS-ready, rate limiting, backup strategy

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite 5, TailwindCSS 3, React Router, Axios, React Query, Zustand, Socket.IO Client |
| **Backend** | Python Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Migrate, Flask-SocketIO, Celery |
| **Database** | PostgreSQL |
| **Deployment** | Docker, Nginx, Gunicorn |

---

## Database Schema (Core Tables)

`tenants`, `subscriptions`, `branches`, `users`, `roles`, `permissions`, `categories`, `products`, `modifiers`, `customers`, `loyalty_points`, `tables`, `reservations`, `orders`, `order_items`, `payments`, `inventory_items`, `stock_movements`, `suppliers`, `purchases`, `rooms`, `bookings`, `expenses`, `notifications`, `audit_logs`

All tables include foreign keys, indexes, and constraints.

---

## API Surface

RESTful APIs with validation, pagination, filtering, search, and sorting:

`/api/auth`, `/api/users`, `/api/branches`, `/api/products`, `/api/orders`, `/api/customers`, `/api/inventory`, `/api/reports`, `/api/hotel`

---

## Strategic Principles

1. **Isolation first** — tenant data never bleeds across boundaries
2. **Offline resilience** — POS works without internet; syncs automatically
3. **Role clarity** — every user sees only what their role requires
4. **Real-time operations** — KDS and live dashboards via WebSocket
5. **Export everything** — all reports exportable to PDF, Excel, CSV
6. **Enterprise security** — audit logs, rate limiting, hashed credentials
