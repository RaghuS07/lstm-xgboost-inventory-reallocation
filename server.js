const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const locationRoutes = require('./routes/locations');
const stockRoutes = require('./routes/stock');
const orderRoutes = require('./routes/orders');
const recommendationRoutes = require('./routes/recommendations');
const transferExecRoutes = require('./routes/transferExec');
const transferImpactRoutes = require('./routes/transferImpact');
const transfersRoutes = require('./routes/transfers');
const alertsRoutes = require('./routes/alerts');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Supply-Demand API Server is running',
    database: config.MONGO_URI.split('/').pop(),
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      locations: '/api/locations',
      stock: '/api/stock',
      orders: '/api/orders',
      recommendations: '/api/recommendations',
      transferExec: '/api/transfer-exec',
      transferImpact: '/api/transfer-impact'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    database: config.MONGO_URI.split('/').pop(),
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/transfer-exec', transferExecRoutes);
app.use('/api/transfer-impact', transferImpactRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/alerts', alertsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Only auto-start if this file is run directly (not required by another file)
if (require.main === module) {
  // Force supply-demand database
  const MONGO_URI = 'mongodb://localhost:27017/supply-demand';
  
  // Connect to MongoDB
  mongoose.connect(MONGO_URI)
    .then(() => {
      const dbName = mongoose.connection.db.databaseName;
      console.log('Connected to MongoDB');
      console.log(`Database: ${dbName}`);
      
      // Start server
      app.listen(config.PORT, () => {
        console.log(`Server running on port ${config.PORT}`);
        console.log(`Environment: ${config.NODE_ENV}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = app;
