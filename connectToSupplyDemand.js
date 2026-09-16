// Force connection to supply-demand database
const mongoose = require('mongoose');

// Clear any cached modules
delete require.cache[require.resolve('./config')];

const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

async function connect() {
  try {
    console.log('🔌 Connecting directly to supply-demand database...');
    console.log('📍 URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const dbName = mongoose.connection.db.databaseName;
    console.log('📊 Connected to database:', dbName);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Count documents in each collection
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');

    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();

    console.log('\n📈 Document Counts:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);

    // Show sample data
    if (locationCount > 0) {
      const locations = await Location.find().limit(5);
      console.log('\n📍 Sample Locations (first 5):');
      locations.forEach((loc, i) => {
        console.log(`   ${i + 1}. ${loc.name} (${loc.city}) - ID: ${loc.locationId || 'N/A'}`);
      });
    }

    if (productCount > 0) {
      const products = await Product.find().limit(5);
      console.log('\n📦 Sample Products (first 5):');
      products.forEach((prod, i) => {
        console.log(`   ${i + 1}. ${prod.name} - ${prod.category} - $${prod.price}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection test complete!');
    console.log('\n💡 To use this database, make sure your config.js has:');
    console.log('   MONGO_URI: "mongodb://localhost:27017/supply-demand"');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

connect();

