// Script to check database contents and structure
const mongoose = require('mongoose');
const config = require('./config');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Database URI:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');
    const Recommendation = require('./models/Recommendation');

    // Check counts
    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();
    const recommendationCount = await Recommendation.countDocuments();

    console.log('📊 Database Counts:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);
    console.log(`   Recommendations: ${recommendationCount}\n`);

    // Sample a few products to check structure
    if (productCount > 0) {
      const sampleProducts = await Product.find().limit(3);
      console.log('📦 Sample Products (first 3):');
      sampleProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name || 'N/A'}`);
        console.log(`      _id: ${p._id}`);
        console.log(`      productId: ${p.productId || 'NOT SET'}`);
        console.log(`      category: ${p.category || 'N/A'}`);
        console.log(`      price: ${p.price || 'N/A'}`);
        console.log('');
      });
    }

    // Sample stock entries
    if (stockCount > 0) {
      const sampleStock = await Stock.find().limit(3).populate('productId', 'name').populate('locationId', 'name');
      console.log('📦 Sample Stock Entries (first 3):');
      sampleStock.forEach((s, i) => {
        console.log(`   ${i + 1}. Product: ${s.productId?.name || s.productId || 'NOT POPULATED'}`);
        console.log(`      Location: ${s.locationId?.name || s.locationId || 'NOT POPULATED'}`);
        console.log(`      Quantity: ${s.quantity}`);
        console.log('');
      });
    }

    // Check for products without productId
    if (productCount > 0) {
      const productsWithoutId = await Product.countDocuments({ productId: { $exists: false } });
      const productsWithId = await Product.countDocuments({ productId: { $exists: true } });
      console.log('🔍 Product ID Status:');
      console.log(`   Products with productId: ${productsWithId}`);
      console.log(`   Products without productId: ${productsWithoutId}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkDatabase();

