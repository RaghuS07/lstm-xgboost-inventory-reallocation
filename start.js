
const mongoose = require('mongoose');
const seedData = require('./utils/seedData');

// Clear config cache to ensure fresh read
delete require.cache[require.resolve('./config')];
const config = require('./config');

// Force supply-demand database (override any environment variable)
const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

// Connect to MongoDB and seed data
async function startServer() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Database URI:', MONGO_URI);
    console.log('📍 Config MONGO_URI:', config.MONGO_URI);
    await mongoose.connect(MONGO_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to MongoDB`);
    console.log(`📊 Database: ${dbName}`);
    
    if (dbName !== 'supply-demand') {
      console.warn(`⚠️  WARNING: Expected 'supply-demand' but connected to '${dbName}'`);
    }

    // Check database contents (no auto-seeding)
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');
    
    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();
    
    console.log('\n📊 Database Status:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);
    
    if (productCount > 0 && locationCount > 0 && stockCount > 0) {
      console.log('✅ Database is populated with real data');
    } else {
      if (productCount === 0) {
        console.log('⚠️  Warning: No products found in database');
      }
      if (locationCount === 0) {
        console.log('⚠️  Warning: No locations found in database');
      }
      if (stockCount === 0) {
        console.log('⚠️  Warning: No stock entries found in database');
      }
    }

    // Start the server
    const app = require('./server');
    const PORT = config.PORT;
    
    // Start server on the specified port
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log(`🔑 API Keys configured for all roles`);
      console.log('\n📋 Available API Keys:');
      console.log(`   Admin: ${config.ADMIN_API_KEY}`);
      console.log(`   Seller: ${config.SELLER_API_KEY}`);
      console.log(`   Buyer: ${config.BUYER_API_KEY}`);
      console.log('\n🎯 Ready to accept requests!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
