# 🛍️ MiniStore — Modern Full Stack MERN E-Commerce Application

A complete, production-ready full stack e-commerce web application built on the **MERN** stack (MongoDB, Express.js, React, Node.js) with **Tailwind CSS**, **Lucide Icons**, **Axios**, **JSONWebTokens (JWT)**, **Bcryptjs**, **Multer**, and **Nodemailer**.

---

## 🌟 Key Features

### 🚀 Backend Architecture (MVC)
- **Centralized Error Handling:** Consistent JSON responses format `{ success: false, message: "...", error: null }` handling CastError, Validation errors, duplicate key violations (11000), and JWT expiration.
- **Authentication & Security:** 
  - Password hashing with Bcrypt salt rounds.
  - JWT generation and verification with Bearer token authentication middleware.
  - Role-based authorization (`isAdmin`) protecting sensitive endpoints.
- **Email Verification Flow:**
  - Token-based email verification using crypto random tokens with 24-hour expiration.
  - Nodemailer transporter supporting both standard SMTP (Gmail/SendGrid/Mailgun) and automatic ephemeral **Ethereal Email** accounts in development with direct console preview URLs.
- **File Upload (Multer):**
  - Disk storage configured with timestamped unique filenames.
  - Strict image MIME & extension filtering (JPEG, JPG, PNG, WEBP, GIF).
  - Static file serving via `/uploads/` route with automated cleanup on updates or deletions.
- **RESTful Product API:**
  - Regex search across `title` and `description`.
  - Category filtering by MongoDB ObjectId.
  - Server-side dynamic pagination (`skip` & `limit`) returning `currentPage`, `totalPages`, `totalProducts`, `hasNextPage`, and `hasPrevPage`.
  - Multi-criteria sorting (`newest`, `price_asc`, `price_desc`).
  - Mongoose `.populate('category', 'name slug')` for category relationships.

### 🎨 Frontend UI / UX (React + Vite + Tailwind CSS)
- **Design System:** Ultra-modern dark slate theme with glassmorphism blur panels, glowing accents, and smooth transitions.
- **Interactive Modals:**
  - **Auth Modal:** Switch between Sign In and Registration with instant password reveal toggle and 1-click **Quick Demo Credentials** autofill.
  - **Product Details Modal:** Fullscreen product inspection with high-res imagery, stock badges, and cart triggers.
  - **Admin Product Modal:** Add/Edit products with instant image file preview, drag & drop, file size validation, and category dropdown.
- **Email Verification View:** Dedicated verification landing state (`/verify-email?token=...`) with automated verification, success celebration, error handling, and 1-click resend form.
- **Admin Dashboard:** Real-time metrics overview (Total Products, Categories, Low Stock Warnings), inline category management, and inventory management table.
- **Feedback & State:** Custom animated Toast notifications queue (Success, Error, Warning, Info) and shimmering Skeleton loaders.

---

## 📂 Project Directory Structure

```
full-stackk/
├── backend/
│   ├── config/
│   │   ├── db.js              # Mongoose DB connection & in-memory dev fallback
│   │   └── emailConfig.js     # Nodemailer transporter & Ethereal setup
│   ├── controllers/
│   │   ├── authController.js      # Register, Verify Email, Login, Resend, Me
│   │   ├── categoryController.js  # CRUD operations for categories
│   │   └── productController.js   # Search, Filter, Sort, Paginate, CRUD
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT Bearer token verification
│   │   ├── errorMiddleware.js     # Centralized 404 & error handlers
│   │   ├── roleMiddleware.js      # Admin authorization check
│   │   └── uploadMiddleware.js    # Multer image storage & type filter
│   ├── models/
│   │   ├── Category.js        # Category schema with slug pre-save hook
│   │   ├── Product.js         # Product schema referencing Category
│   │   └── User.js            # User schema with bcrypt comparison method
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── categoryRoutes.js  # /api/categories routes
│   │   └── productRoutes.js   # /api/products routes
│   ├── uploads/               # Static directory for user-uploaded product images
│   ├── utils/
│   │   ├── apiResponse.js     # Standardized JSON response formatting
│   │   └── sendEmail.js       # HTML verification email template & delivery
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json           # Backend dependencies & scripts
│   ├── seeder.js              # Database seeder with sample products & users
│   └── server.js              # Express app bootstrap & route registration
├── frontend/
│   ├── public/
│   │   └── favicon.svg        # MiniStore brand icon
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js   # Axios client with JWT request interceptor
│   │   ├── components/
│   │   │   ├── AddProductModal.jsx    # Add/Edit product modal with image preview
│   │   │   ├── AuthModal.jsx          # Login & registration modal with demo buttons
│   │   │   ├── CategoryPills.jsx      # Category filter chips
│   │   │   ├── Footer.jsx             # Footer with stack badges
│   │   │   ├── Navbar.jsx             # Navigation bar with user badge & quick actions
│   │   │   ├── ProductCard.jsx        # Product display card with stock indicators
│   │   │   ├── ProductDetailModal.jsx # Product detail modal
│   │   │   ├── SkeletonLoader.jsx     # Shimmer skeleton loader
│   │   │   └── Toast.jsx              # Toast notification system
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Authentication state & actions
│   │   │   └── ToastContext.jsx       # Global toast notification context
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Admin panel (Metrics, Inventory, Categories)
│   │   │   ├── Home.jsx               # Hero, search, filters, product grid, pagination
│   │   │   └── VerifyEmail.jsx        # Email verification landing page
│   │   ├── App.jsx            # Main application layout
│   │   ├── index.css          # Tailwind directives & glassmorphism utilities
│   │   └── main.jsx           # React DOM root entry
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js         # Vite configuration with API & Uploads proxy
├── package.json               # Root workspace scripts
└── README.md
```

---

## 🛠️ Step-by-Step Installation & Local Run

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

---

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ministore
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ministore?retryWrites=true&w=majority

JWT_SECRET=ministore_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Nodemailer SMTP Configuration
# (Leave empty to use automatic Ethereal test inbox in development)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_SECURE=false
EMAIL_FROM="MiniStore Team" <noreply@ministore.local>
```

---

### 3. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or navigate to `backend` and `frontend` individually and run `npm install`)*

---

### 4. Seed the Database (Admin & Sample Products)
Populate demo categories, sample products, and pre-verified test accounts:
```bash
npm run seed
```
> **Seeded Test Accounts:**
> - **Admin:** `admin@ministore.com` | Password: `admin123`
> - **Shopper:** `user@ministore.com` | Password: `user123`

---

### 5. Start the Application
You can run both backend and frontend concurrently from the root directory:
```bash
npm run dev
```

Or run them in separate terminals:
- **Backend API:**
  ```bash
  cd backend
  npm run dev
  ```
  *(Server runs on `http://localhost:5000`)*

- **Frontend Client:**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Client runs on `http://localhost:5173`)*

Open your browser at `http://localhost:5173`.

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user, generate verification token & send email |
| `GET` | `/api/auth/verify-email/:token` | Public | Verify token, activate user account & return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user, check verified status & return JWT |
| `POST` | `/api/auth/resend-verification` | Public | Resend verification email for unverified user |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile (`Bearer <token>`) |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Retrieve all categories sorted by name |
| `POST` | `/api/categories` | Admin Only | Create a new category |
| `DELETE` | `/api/categories/:id` | Admin Only | Delete a category by ID |

### 📦 Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search (`?search=`), Category (`?category=`), Sort (`?sort=`), Paginate (`?page=&limit=8`) |
| `GET` | `/api/products/:id` | Public | Fetch product details with category populated |
| `POST` | `/api/products` | Admin Only | Create product with Multer image upload (`multipart/form-data`) |
| `PUT` | `/api/products/:id` | Admin Only | Update product details and/or replacement image |
| `DELETE` | `/api/products/:id` | Admin Only | Delete product and remove uploaded image from disk |

---

## 🛡️ Production & Clean Coding Best Practices Included
- **Mongoose Data Validation:** Email regex validator, required field checks, default values, and relational references.
- **Security:** Passwords never returned in JWT or `/api/auth/me` responses; bcrypt salt rounds; role checking middleware.
- **Multer File Hygiene:** File type filtering (images only), size limits (5MB max), unique timestamped naming, and automatic disk unlinking on product deletion or image update.
- **Fail-Safe Email Verification:** If SMTP credentials are not supplied, Nodemailer automatically falls back to an Ethereal test inbox and outputs a clickable preview URL in the server console, as well as an instant test activation button in the frontend.

