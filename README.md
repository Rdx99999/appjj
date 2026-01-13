# E-Commerce Platform with Admin Panel and Mobile App

A comprehensive e-commerce platform built with:
- **Backend**: Cloudflare Workers, D1 Database, R2 Storage
- **Admin Panel**: React with TypeScript
- **Mobile App**: Expo (React Native) with TypeScript

## Features

### For Sellers (Mobile App)
- User registration with GST number (optional)
- Shop document upload for KYC verification
- Browse and search products by category
- Add products to cart and place orders
- Track order status
- Profile management

### For Admin (Web Panel)
- Dashboard with statistics
- Seller management and KYC verification
- Product management (CRUD operations)
- Order management and status updates
- Category management

## Project Structure

```
.
├── backend/              # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts     # Main API endpoints
│   │   └── types.ts     # TypeScript types
│   ├── schema.sql       # Database schema
│   └── wrangler.jsonc   # Cloudflare configuration
├── admin-panel/         # React admin panel
│   └── src/
│       ├── api/         # API client and services
│       ├── components/  # Reusable components
│       └── pages/       # Page components
├── app/                 # Expo mobile app
│   ├── (tabs)/         # Tab navigation screens
│   ├── lib/            # API client and services
│   └── store/          # State management (Zustand)
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account (for Workers, D1, R2)
- Expo CLI (for mobile development)
- Git

## Setup Instructions

### 1. Backend Setup (Cloudflare Workers)

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Wrangler
```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create ecommerce-db

# Create R2 bucket
npx wrangler r2 bucket create ecommerce-storage
```

Update [`backend/wrangler.jsonc`](backend/wrangler.jsonc) with your database and bucket IDs:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ecommerce-db",
      "database_id": "YOUR_DATABASE_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "ecommerce-storage"
    }
  ]
}
```

#### Initialize Database
```bash
# Apply schema to D1 database
npx wrangler d1 execute ecommerce-db --local --file=./schema.sql
```

#### Run Locally
```bash
npm run dev
```

The API will be available at `http://localhost:8787`

#### Deploy to Cloudflare
```bash
npm run deploy
```

### 2. Admin Panel Setup

#### Install Dependencies
```bash
cd admin-panel
npm install
```

#### Configure API URL
Create a `.env` file in the `admin-panel` directory:
```env
REACT_APP_API_URL=http://localhost:8787
```

For production, use your deployed Cloudflare Workers URL.

#### Run Development Server
```bash
npm start
```

The admin panel will be available at `http://localhost:3000`

#### Build for Production
```bash
npm run build
```

### 3. Mobile App Setup (Expo)

#### Install Dependencies
```bash
npm install
```

#### Configure API URL
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=http://localhost:8787
```

For production, use your deployed Cloudflare Workers URL.

#### Run Development Server
```bash
npm start
```

Press `i` to run on iOS simulator or `a` to run on Android emulator.

#### Build for Production
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new seller
- `POST /auth/login` - Login user
- `GET /auth/user/:id` - Get user by ID

### KYC Documents
- `POST /kyc/upload` - Upload KYC document
- `GET /kyc/user/:userId` - Get user's KYC documents
- `GET /kyc/pending` - Get pending KYC documents (admin)
- `POST /kyc/verify` - Approve/reject KYC document (admin)

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

### Products
- `GET /products` - Get all products (with optional filters)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `POST /products/upload-image` - Upload product image

### Orders
- `GET /orders` - Get all orders (with optional filters)
- `GET /orders/:id` - Get order by ID with items
- `POST /orders` - Create order
- `PUT /orders/:id/status` - Update order status (admin)

### Admin
- `GET /admin/sellers` - Get all sellers
- `GET /admin/pending-sellers` - Get pending sellers
- `POST /admin/verify-seller` - Verify/reject seller (admin)
- `GET /admin/dashboard` - Get dashboard statistics

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT, UNIQUE)
- `role` (TEXT: 'admin', 'seller')
- `gst_no` (TEXT, optional)
- `shop_name` (TEXT)
- `address` (TEXT)
- `status` (TEXT: 'pending', 'verified', 'rejected')
- `created_at` (DATETIME)

### Categories Table
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT)
- `image_url` (TEXT)
- `created_at` (DATETIME)

### Products Table
- `id` (TEXT, PRIMARY KEY)
- `category_id` (TEXT, FOREIGN KEY)
- `name` (TEXT)
- `description` (TEXT)
- `price` (REAL)
- `unit` (TEXT)
- `image_url` (TEXT)
- `stock` (INTEGER)
- `discount` (REAL)
- `seller_id` (TEXT, FOREIGN KEY)
- `created_at` (DATETIME)

### KYC Documents Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `document_type` (TEXT)
- `document_url` (TEXT)
- `status` (TEXT: 'pending', 'approved', 'rejected')

### Orders Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `total_amount` (REAL)
- `status` (TEXT: 'pending', 'shipped', 'delivered', 'cancelled')
- `created_at` (DATETIME)

### Order Items Table
- `id` (TEXT, PRIMARY KEY)
- `order_id` (TEXT, FOREIGN KEY)
- `product_id` (TEXT, FOREIGN KEY)
- `quantity` (INTEGER)
- `price` (REAL)

## Default Admin Credentials

For the admin panel, you can create an admin user by inserting directly into the database:

```sql
INSERT INTO users (id, name, email, role, status) 
VALUES ('admin-001', 'Admin User', 'admin@example.com', 'admin', 'verified');
```

## Development Workflow

1. Start the backend: `cd backend && npm run dev`
2. Start the admin panel: `cd admin-panel && npm start`
3. Start the mobile app: `npm start`

## Troubleshooting

### Backend Issues
- Ensure Cloudflare Workers is running: `http://localhost:8787`
- Check D1 database is properly configured in `wrangler.jsonc`
- Verify R2 bucket is created and accessible

### Admin Panel Issues
- Clear browser cache if API calls fail
- Check `REACT_APP_API_URL` in `.env` file
- Ensure CORS is enabled in backend

### Mobile App Issues
- Ensure Expo development server is running
- Check `EXPO_PUBLIC_API_URL` in `.env` file
- Clear app cache if needed: `expo start -c`

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository.
# appjj
