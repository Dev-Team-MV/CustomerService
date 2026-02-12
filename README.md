# Lakewood Oaks - Property Management System
Full-stack property management application built with:
- **Frontend**: Vite + React + TailwindCSS + Material-UI
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Features
- ✅ Authentication (Login/Register) with JWT
- ✅ Role-based access control (SuperAdmin, Admin, User)
- ✅ Protected Routes
- ✅ Property Management (CRUD)
- ✅ Lot Inventory Management
- ✅ Property Models Catalog
- ✅ Payment Tracking (Payloads)
- ✅ Resident Management
- ✅ Analytics Dashboard
- ✅ Sales Progress Tracking
- ✅ Context API for state management
- ✅ Modern UI with TailwindCSS + Material-UI
- ✅ RESTful API

## Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update MongoDB connection string and JWT secret

3. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
CustomerService/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Layout, ProtectedRoute
│   │   ├── pages/      # Dashboard, Properties, Lots, Models, Payloads, etc.
│   │   ├── context/    # AuthContext
│   │   ├── services/   # API services (axios)
│   │   └── utils/      # Utility functions
├── backend/            # Node.js + Express API
│   ├── models/         # User, Property, Lot, Model, Payload
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware (JWT)
│   ├── controllers/    # Business logic
│   └── config/         # Database configuration
```

## Data Models

### User
- firstName, lastName, email, phoneNumber, birthday
- Role: superadmin | admin | user
- Lots: Array of assigned lot IDs

### Lot
- number, section, size, price
- Status: available | pending | sold
- assignedUser: Reference to User

### Model
- model, modelNumber, price
- bedrooms, bathrooms, sqft
- images, description, status

### Property
- lot, model, user (references)
- price (calculated: lot price + model price)
- pending (remaining balance)
- initialPayment, status, saleDate

### Payload
- property (reference)
- date, amount, support, status
- notes, processedBy

## User Roles

- **SuperAdmin**: Full system access
- **Admin**: Property management, sales, payments
- **User**: View own properties and make service requests

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile

### Properties
- GET `/api/properties` - List all properties
- POST `/api/properties` - Create property (Admin)
- GET `/api/properties/:id` - Get property details
- PUT `/api/properties/:id` - Update property (Admin)
- DELETE `/api/properties/:id` - Delete property (Admin)
- GET `/api/properties/stats` - Get statistics

### Lots
- GET `/api/lots` - List all lots
- POST `/api/lots` - Create lot (Admin)
- GET `/api/lots/stats` - Get lot statistics

### Models
- GET `/api/models` - List all models
- POST `/api/models` - Create model (Admin)

### Payloads
- GET `/api/payloads` - List all payments
- POST `/api/payloads` - Record payment (Admin)
- GET `/api/payloads/stats` - Get payment statistics

### Users
- GET `/api/users` - List all users (Admin)
- GET `/api/users/:id` - Get user details
