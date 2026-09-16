// Quick test script to verify MongoDB connection
const mongoose = require('mongoose');
const config = require('./config');

async function testConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', config.MONGO_URI);
    
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected successfully!\n');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    
    console.log('📊 Available databases:');
    databases.forEach(db => {
      const marker = db.name === 'supply-demand' ? '👉' : '  ';
      console.log(`${marker} ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Test collections in supply-demand
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📁 Collections in supply-demand database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Quick count check
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');
    
    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();
    
    console.log('\n📈 Document counts:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Connection test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

