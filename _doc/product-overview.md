# Build HospitalityHub ERP - Complete Multi-Business Restaurant, Café & Hotel Management System

You are a senior software architect and full-stack engineer. Build a production-ready enterprise hospitality management platform called HospitalityHub ERP.

## Technology Stack

Frontend:

* React.js
* Vite 5
* TailwindCSS 3
* React Router
* Axios
* React Query
* Zustand
* Socket.IO Client

Backend:

* Python Flask
* SQLAlchemy
* Flask JWT Extended
* Flask Migrate
* Flask SocketIO
* Celery

Database:

* PostgreSQL

Authentication:

* PIN Keypad Authentication
* JWT Tokens
* Role-Based Access Control (RBAC)

Deployment:

* Docker
* Nginx
* Gunicorn

## Project Goal

Create a complete multi-tenant SaaS platform for:

* Restaurants
* Cafés
* Hotels
* Bakeries
* Bars
* Fast Food Businesses
* Food Courts
* Lounges

Each business must have isolated data while operating on a shared platform.

---

# Core Requirements

## Multi-Tenant Architecture

Create:

* Super Admin
* Business Owners
* Multiple Businesses
* Multiple Branches

Every record must contain:

* tenant_id
* branch_id

Data from one business must never be visible to another business.

---

# Authentication Module

Build a touchscreen PIN keypad login.

Requirements:

* 4-digit PIN
* Employee selection screen
* JWT authentication
* Secure PIN hashing
* Session timeout
* Activity tracking

User Roles:

* Super Admin
* Owner
* Manager
* Cashier
* Waiter
* Kitchen Staff
* Accountant
* Receptionist
* Housekeeping

---

# Dashboard

Create dashboards for:

Owner Dashboard:

* Revenue
* Profit
* Expenses
* Orders
* Top Products
* Top Branches

Manager Dashboard:

* Branch Performance
* Inventory Alerts
* Employee Performance

Cashier Dashboard:

* Current Shift
* Sales Summary
* Open Orders

Kitchen Dashboard:

* Incoming Orders
* Preparing Orders
* Ready Orders

Reception Dashboard:

* Room Bookings
* Check-ins
* Check-outs

---

# POS Module

Build a modern POS system.

Features:

* Product grid
* Category filtering
* Search products
* Cart system
* Split bills
* Merge bills
* Discounts
* Refunds
* Returns
* Notes
* Receipt printing

Payment Methods:

* Cash
* Card
* Mobile Money
* Bank Transfer
* Mixed Payment

Order States:

* Pending
* Preparing
* Ready
* Served
* Completed
* Cancelled

---

# Menu Management

Build:

Categories
Subcategories
Products
Variants
Modifiers
Combo Meals

Each product includes:

* Name
* Description
* Price
* Cost Price
* Tax
* SKU
* Barcode
* Image
* Status

---

# Table Management

Create restaurant floor plans.

Features:

* Create tables
* Move tables
* Merge tables
* Split tables
* Reservations

Table Status:

* Available
* Occupied
* Reserved
* Cleaning

---

# Kitchen Display System (KDS)

Use Socket.IO.

Real-Time Workflow:

Order Created
→ Kitchen
→ Preparing
→ Ready
→ Served

Features:

* Live updates
* Audio alerts
* Preparation timers
* Order priority

---

# Inventory Management

Create complete inventory tracking.

Features:

* Stock management
* Purchase orders
* Stock transfers
* Adjustments
* Wastage tracking
* Low stock alerts

Automatic deduction of ingredients after every sale.

---

# Supplier Management

Create:

* Suppliers
* Purchase Orders
* Goods Received Notes
* Supplier Payments

Supplier Fields:

* Name
* Phone
* Email
* Address
* Balance

---

# Customer Management

Create CRM system.

Features:

* Customer profiles
* Loyalty points
* Rewards
* Purchase history
* Birthday reminders
* Promotions

---

# Reservation Management

Restaurant Reservations:

* Date
* Time
* Guests
* Table

Hotel Reservations:

* Room
* Check-in
* Check-out
* Guest details

---

# Hotel Module

Build full hotel management.

Room Types:

* Single
* Double
* Deluxe
* Suite
* VIP

Features:

* Booking calendar
* Room allocation
* Check-in
* Check-out
* Room service
* Housekeeping
* Maintenance

Room Status:

* Available
* Occupied
* Reserved
* Cleaning
* Maintenance

---

# Accounting Module

Create:

* Income tracking
* Expense tracking
* Journal entries
* Cash flow
* Profit and loss
* Balance sheet

Expense Categories:

* Salaries
* Utilities
* Purchases
* Rent
* Maintenance

---

# Reporting Module

Generate reports:

Sales Reports:

* Daily
* Weekly
* Monthly
* Yearly

Inventory Reports:

* Stock Levels
* Wastage
* Purchases

Customer Reports:

* Loyalty
* Spending

Staff Reports:

* Attendance
* Productivity

Financial Reports:

* Revenue
* Expenses
* Profit

Export:

* PDF
* Excel
* CSV

---

# Notification Module

Channels:

* SMS
* Email
* WhatsApp
* Push Notifications

Events:

* New Reservation
* Low Stock
* Payment Received
* New Order

---

# Offline Support

POS must continue working without internet.

Requirements:

* Local storage
* Offline transactions
* Automatic synchronization when online

---

# Security

Implement:

* JWT Authentication
* RBAC Permissions
* Audit Logs
* HTTPS Ready
* Password/PIN Hashing
* Rate Limiting
* Backup Strategy

---

# Database Design

Create complete PostgreSQL schema with:

tenants
subscriptions
branches
users
roles
permissions

categories
products
modifiers

customers
loyalty_points

tables
reservations

orders
order_items
payments

inventory_items
stock_movements

suppliers
purchases

rooms
bookings

expenses

notifications

audit_logs

Create all foreign keys, indexes, constraints, and relationships.

---

# API Development

Build REST APIs for all modules.

Examples:

/api/auth
/api/users
/api/branches
/api/products
/api/orders
/api/customers
/api/inventory
/api/reports
/api/hotel

Provide:

* Validation
* Pagination
* Filtering
* Search
* Sorting

---

# Frontend Requirements

Create:

* Responsive layouts
* Mobile support
* Tablet POS mode
* Dark mode
* Light mode
* Reusable components

Use:

* Zustand for state management
* React Query for API calls
* TailwindCSS for styling

---

# Deliverables

Generate:

1. Complete project structure.
2. Database schema.
3. SQLAlchemy models.
4. Flask backend APIs.
5. Authentication system.
6. React frontend.
7. Dashboard pages.
8. POS module.
9. Inventory module.
10. Hotel module.
11. Reporting module.
12. Docker configuration.
13. Deployment guide.
14. API documentation.
15. Seed/demo data.

Build the system module by module, following enterprise-grade architecture, clean code principles, scalability, security, maintainability, and production-ready standards.