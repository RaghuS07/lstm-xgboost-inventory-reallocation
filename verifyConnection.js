// Verify MongoDB connection with actual database operations
const mongoose = require('mongoose');
const config = require('./config');

async function verifyConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Database URI:', config.MONGO_URI);
    console.log('📍 Database Name:', config.MONGO_URI.split('/').pop());
    
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Verify we're connected to the right database
    const dbName = mongoose.connection.db.databaseName;
    console.log('📊 Connected to database:', dbName);
    
    if (dbName !== 'supply-demand') {
      console.warn(`⚠️  WARNING: Expected 'supply-demand' but connected to '${dbName}'`);
    }

    // Test models
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');

    // Count documents
    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();

    console.log('\n📈 Document Counts:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);

    // Try to fetch a few documents
    if (productCount > 0) {
      const sampleProduct = await Product.findOne();
      console.log('\n📦 Sample Product:');
      console.log(`   _id: ${sampleProduct._id}`);
      console.log(`   name: ${sampleProduct.name}`);
      console.log(`   productId: ${sampleProduct.productId || 'NOT SET'}`);
    }

    if (locationCount > 0) {
      const sampleLocation = await Location.findOne();
      console.log('\n📍 Sample Location:');
      console.log(`   _id: ${sampleLocation._id}`);
      console.log(`   name: ${sampleLocation.name}`);
      console.log(`   city: ${sampleLocation.city}`);
      console.log(`   locationId: ${sampleLocation.locationId || 'NOT SET'}`);
    }

    if (stockCount > 0) {
      const sampleStock = await Stock.findOne().populate('productId', 'name').populate('locationId', 'name');
      console.log('\n📦 Sample Stock Entry:');
      console.log(`   Product: ${sampleStock.productId?.name || 'NOT POPULATED'}`);
      console.log(`   Location: ${sampleStock.locationId?.name || 'NOT POPULATED'}`);
      console.log(`   Quantity: ${sampleStock.quantity}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
    console.log('\n💡 If counts are 0, your database might be empty or models don\'t match the data structure.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

verifyConnection();

