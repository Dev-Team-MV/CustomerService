# Quick Start Guide - Lakewood Oaks Property Management

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using MongoDB locally
mongod

# Or update backend/.env with your MongoDB Atlas connection string
```

### 3. Start the Application
```bash
npm run dev
```

This starts both frontend (port 5173) and backend (port 5000) concurrently.

## 📋 First Steps

### Create Admin Account
1. Go to http://localhost:5173/register
2. Register with your details
3. Manually update your role in MongoDB to 'admin' or 'superadmin':
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Add Sample Data

#### 1. Create Lots
- Navigate to "Lot Inventory"
- Click "Add New Lot"
- Example: Lot 102, Section A, 0.5 Acres, $125,000

#### 2. Create Models
- Navigate to "Models"
- Click "Add New Model"
- Example: The Oakwood, 4 beds, 3 baths, 2800 sqft, $450,000

#### 3. Create Property (Sale)
- Navigate to "Properties"
- Click "Add Property"
- Select Lot, Model, and User
- Enter initial payment
- System calculates: Total Price = Lot Price + Model Price
- Pending = Total Price - Initial Payment

#### 4. Add Payments
- Navigate to "Payloads"
- Click "New Payload"
- Select property, enter amount and date
- Status: pending → cleared (reduces property pending balance)

## 🎯 Key Features

### For Admins
- **Dashboard**: Overview of sales, revenue, and activity
- **Properties**: Manage property sales and assignments
- **Lot Inventory**: Track available, pending, and sold lots
- **Models**: Manage property models/floorplans
- **Payloads**: Track and process payments
- **Residents**: Manage user accounts
- **Analytics**: View sales progress and statistics

### For Users (Residents)
- **Dashboard**: View their properties
- **Profile**: Manage personal information
- Access to their property details and payment history

## 🔐 User Roles

- **SuperAdmin**: Full system access, user management
- **Admin**: Property management, sales, payments
- **User**: View own properties, make service requests

## 💡 Workflow Example

### Complete Property Sale Process

1. **Admin creates/verifies lot is available**
   - Lot Inventory → Add/Edit Lot
   - Status: available

2. **Admin creates property sale**
   - Properties → Add Property
   - Select: Lot 102 + Model "The Oakwood" + User "John Doe"
   - Initial Payment: $50,000
   - System calculates:
     - Total: $575,000 (Lot $125k + Model $450k)
     - Pending: $525,000

3. **Lot automatically updates**
   - Status: available → pending
   - Assigned to user

4. **Admin records payments**
   - Payloads → New Payload
   - Property: Lot 102
   - Amount: $100,000
   - Status: cleared
   - Property pending updates: $525k → $425k

5. **When fully paid**
   - Property status: pending → sold
   - Lot status: pending → sold

## 🛠️ Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `backend/.env`
- Default: `mongodb://localhost:27017/customerservice`

### Port Already in Use
- Frontend (5173): Change in `frontend/vite.config.js`
- Backend (5000): Change PORT in `backend/.env`

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in `backend/.env`
- Verify token in browser DevTools → Application → Local Storage

## 📱 API Testing

Use tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get lots (with token)
curl http://localhost:5000/api/lots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎨 Customization

### Change Branding
- Update "Lakewood Oaks" in `frontend/src/components/Layout.jsx`
- Modify theme colors in `frontend/src/App.jsx`

### Add Email/SMS Notifications
- Install nodemailer: `cd backend && npm install nodemailer`
- Install twilio: `npm install twilio`
- Create notification service in `backend/services/`

## 📚 Next Steps

1. Set up email notifications for new sales
2. Add SMS alerts for payment confirmations
3. Implement document upload for payloads
4. Add reporting/export functionality
5. Create resident portal features (maintenance requests, etc.)

## 🐛 Known Issues

- TailwindCSS warnings in IDE are normal (directives work correctly)
- First MongoDB connection may take a few seconds
- Large file uploads not yet implemented

## 📞 Support

For issues or questions, check:
- MongoDB logs: Check terminal running mongod
- Backend logs: Check terminal running backend
- Frontend logs: Browser DevTools → Console
