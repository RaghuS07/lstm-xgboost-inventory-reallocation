// Script to verify and sync with supply-demand database
const mongoose = require('mongoose');

// Force connection to supply-demand database
const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

async function syncDatabase() {
  try {
    console.log('🔌 Connecting to supply-demand database...');
    console.log('📍 URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const dbName = mongoose.connection.db.databaseName;
    console.log('📊 Connected to database:', dbName);

    if (dbName !== 'supply-demand') {
      console.error('❌ ERROR: Not connected to supply-demand database!');
      process.exit(1);
    }

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Check raw document counts (direct from MongoDB, not using models)
    const db = mongoose.connection.db;
    
    const locationsCount = await db.collection('locations').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    const stocksCount = await db.collection('stocks').countDocuments();
    const recommendationsCount = await db.collection('recommendations').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    const ordersCount = await db.collection('orders').countDocuments();

    console.log('\n📈 Raw Document Counts (from MongoDB):');
    console.log(`   locations: ${locationsCount}`);
    console.log(`   products: ${productsCount}`);
    console.log(`   stocks: ${stocksCount}`);
    console.log(`   recommendations: ${recommendationsCount}`);
    console.log(`   users: ${usersCount}`);
    console.log(`   orders: ${ordersCount}`);

    // Check using models
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');

    const modelProductCount = await Product.countDocuments();
    const modelLocationCount = await Location.countDocuments();
    const modelStockCount = await Stock.countDocuments();

    console.log('\n📦 Model-based Counts:');
    console.log(`   Products: ${modelProductCount}`);
    console.log(`   Locations: ${modelLocationCount}`);
    console.log(`   Stock entries: ${modelStockCount}`);

    // Show sample data structure
    if (locationsCount > 0) {
      const sampleLocation = await db.collection('locations').findOne();
      console.log('\n📍 Sample Location Structure:');
      console.log(JSON.stringify(sampleLocation, null, 2));
    }

    if (productsCount > 0) {
      const sampleProduct = await db.collection('products').findOne();
      console.log('\n📦 Sample Product Structure:');
      console.log(JSON.stringify(sampleProduct, null, 2));
    }

    if (stocksCount > 0) {
      const sampleStock = await db.collection('stocks').findOne();
      console.log('\n📦 Sample Stock Structure:');
      console.log(JSON.stringify(sampleStock, null, 2));
    }

    // Check for field mismatches
    console.log('\n🔍 Checking for potential issues:');
    
    if (locationsCount > 0 && modelLocationCount === 0) {
      console.log('⚠️  WARNING: Locations exist in DB but models return 0');
      console.log('   This might indicate a schema mismatch');
    }
    
    if (productsCount > 0 && modelProductCount === 0) {
      console.log('⚠️  WARNING: Products exist in DB but models return 0');
      console.log('   This might indicate a schema mismatch');
    }

    if (stocksCount > 0 && modelStockCount === 0) {
      console.log('⚠️  WARNING: Stock entries exist in DB but models return 0');
      console.log('   This might indicate a schema mismatch');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database sync check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

syncDatabase();

