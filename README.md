# Multi-Location Retail Inventory Management System

A full-stack application for managing retail inventory across multiple locations with AI-driven transfer recommendations. Built with Next.js frontend and Node.js/Express/MongoDB backend.

## 🚀 Features

### Backend Features
- **JWT Authentication** with role-based access control
- **API Key Security** for service-to-service communication
- **Multi-location Inventory** tracking across stores
- **Real-time Stock Management** with quantity updates
- **Order Processing** (reserve → purchase workflow)
- **AI Transfer Recommendations** between locations
- **RESTful APIs** with comprehensive error handling
- **MongoDB Integration** with Mongoose ODM

### Frontend Features
- **Role-based Dashboards** (Buyer vs Seller)
- **Product Catalog** with search and filtering
- **Location-based Stock Display** with real-time updates
- **Interactive Charts** for inventory analytics
- **Transfer Recommendations** with approval workflow
- **Responsive Design** with modern UI/UX
- **Real-time Data** synchronization with backend

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js    │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Node.js       │    │ • Collections   │
│ • Tailwind CSS  │    │ • JWT Auth      │    │ • Mongoose ODM  │
│ • TypeScript    │    │ • API Keys      │    │ • Indexes       │
│ • Axios         │    │ • CORS          │    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
supply-demand/
├── backend/                 # Node.js/Express backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Helper functions
│   ├── server.js           # Express app setup
│   ├── start.js            # Server startup with seeding
│   └── package.json        # Backend dependencies
├── src/                    # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── buyer/          # Buyer dashboard
│   │   ├── seller/         # Seller dashboard
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   ├── utils/              # API utilities
│   └── config/             # Configuration
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd supply-demand

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/config.js
```

### 3. Start Backend
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
# Database will be automatically seeded with sample data
```

### 4. Start Frontend
```bash
# In a new terminal
npm run dev
# Frontend will start on http://localhost:3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🔐 Authentication & API Keys

### User Roles
- **Buyer**: View products, reserve, purchase
- **Seller**: Manage products, stock, approve transfers
- **Manager**: Manage locations, create recommendations
- **Admin**: Full system access

### API Keys
The system uses API keys for service authentication:
- `admin_api_key_123` - Admin access
- `seller_api_key_456` - Seller access  
- `buyer_api_key_789` - Buyer access
- `sample_api_key_123` - Default key

### Sample Users
After seeding, you can register users with any role:
- Email: `admin@example.com` (Admin)
- Email: `seller@example.com` (Seller)
- Email: `buyer@example.com` (Buyer)

## 📊 Database Schema

### Collections
- **users** - User accounts with roles
- **products** - Product catalog
- **locations** - Store locations
- **stock** - Inventory quantities per location
- **orders** - Customer orders (reserve/purchase)
- **recommendations** - AI transfer suggestions

### Sample Data
The system automatically seeds:
- 3 locations (Chennai, Bangalore, Hyderabad)
- 5 sample products across categories
- Stock entries for all product-location combinations
- Sample transfer recommendations

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register    # Register user
POST /api/auth/login       # User login
```

### Products
```
GET    /api/products       # List products
GET    /api/products/:id   # Get product
POST   /api/products       # Create product (Seller+)
PUT    /api/products/:id   # Update product (Seller+)
DELETE /api/products/:id   # Delete product (Manager+)
```

### Stock & Orders
```
GET  /api/stock/location/:id  # Stock by location
GET  /api/stock/all           # All stock
PUT  /api/stock               # Update stock (Seller+)
POST /api/orders/reserve      # Reserve product
POST /api/orders/purchase/:id # Purchase product
```

### Recommendations
```
GET  /api/recommendations           # List recommendations
POST /api/recommendations/:id/approve # Approve transfer (Seller+)
```

## 🎯 Usage Examples

### Buyer Workflow
1. Login as buyer
2. Browse product catalog
3. Select location and quantity
4. Order products
5. Complete purchase

### Seller Workflow
1. Login as seller
2. View inventory dashboard
3. Manage products and stock
4. Review transfer recommendations
5. Approve/reject transfers

## 🔧 Configuration

### Backend Configuration
Edit `backend/config.js`:
```javascript
module.exports = {
  MONGO_URI: 'mongodb://localhost:27017/retail_db',
  JWT_SECRET: 'your_secret_key',
  ADMIN_API_KEY: 'admin_api_key_123',
  // ... other settings
};
```

### Frontend Configuration
Edit `src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  API_KEY: 'sample_api_key_123',
};
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

### Manual Testing
1. Start both servers
2. Register test users
3. Test product browsing (buyer)
4. Test inventory management (seller)
5. Test transfer recommendations

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to cloud platform (Heroku, AWS, etc.)
3. Configure MongoDB Atlas
4. Update CORS settings

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API endpoints for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- Mobile app integration
- Machine learning for demand forecasting
- Integration with external inventory systems
- Multi-tenant support
- Advanced reporting features