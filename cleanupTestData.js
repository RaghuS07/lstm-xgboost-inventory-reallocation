// Script to remove test/seed data from the database
const mongoose = require('mongoose');
const config = require('./config');

async function cleanupTestData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Database:', config.MONGO_URI);
    
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');
    const Recommendation = require('./models/Recommendation');

    // Find test products (those with productId like P0001, P0002, etc.)
    const testProducts = await Product.find({ 
      productId: { $regex: /^P\d{4}$/ } 
    });
    
    console.log(`📦 Found ${testProducts.length} test products to delete:`);
    testProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.productId})`);
    });

    // Find test locations (Chennai, Bangalore, Hyderabad)
    const testLocationNames = ['Chennai Central', 'Bangalore Tech Park', 'Hyderabad IT Hub'];
    const testLocations = await Location.find({
      name: { $in: testLocationNames }
    });
    
    console.log(`\n📍 Found ${testLocations.length} test locations to delete:`);
    testLocations.forEach(l => {
      console.log(`   - ${l.name} (${l.city})`);
    });

    // Get IDs for deletion
    const testProductIds = testProducts.map(p => p._id);
    const testLocationIds = testLocations.map(l => l._id);

    // Find stock entries referencing test products or locations
    const testStock = await Stock.find({
      $or: [
        { productId: { $in: testProductIds } },
        { locationId: { $in: testLocationIds } }
      ]
    });
    
    console.log(`\n📦 Found ${testStock.length} test stock entries to delete`);

    // Find recommendations referencing test products or locations
    const testRecommendations = await Recommendation.find({
      $or: [
        { productId: { $in: testProductIds } },
        { fromLocationId: { $in: testLocationIds } },
        { toLocationId: { $in: testLocationIds } }
      ]
    });
    
    console.log(`\n💡 Found ${testRecommendations.length} test recommendations to delete`);

    // Summary
    console.log('\n📊 Summary of items to delete:');
    console.log(`   Products: ${testProducts.length}`);
    console.log(`   Locations: ${testLocations.length}`);
    console.log(`   Stock entries: ${testStock.length}`);
    console.log(`   Recommendations: ${testRecommendations.length}`);

    if (testProducts.length === 0 && testLocations.length === 0) {
      console.log('\n✅ No test data found. Database is clean!');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Delete in order (dependencies first)
    console.log('\n🗑️  Deleting test data...');
    
    if (testRecommendations.length > 0) {
      const recResult = await Recommendation.deleteMany({
        _id: { $in: testRecommendations.map(r => r._id) }
      });
      console.log(`   ✅ Deleted ${recResult.deletedCount} recommendations`);
    }

    if (testStock.length > 0) {
      const stockResult = await Stock.deleteMany({
        _id: { $in: testStock.map(s => s._id) }
      });
      console.log(`   ✅ Deleted ${stockResult.deletedCount} stock entries`);
    }

    if (testProducts.length > 0) {
      const productResult = await Product.deleteMany({
        _id: { $in: testProductIds }
      });
      console.log(`   ✅ Deleted ${productResult.deletedCount} products`);
    }

    if (testLocations.length > 0) {
      const locationResult = await Location.deleteMany({
        _id: { $in: testLocationIds }
      });
      console.log(`   ✅ Deleted ${locationResult.deletedCount} locations`);
    }

    // Verify deletion
    const remainingProducts = await Product.countDocuments({ 
      productId: { $regex: /^P\d{4}$/ } 
    });
    const remainingLocations = await Location.countDocuments({
      name: { $in: testLocationNames }
    });

    console.log('\n✅ Cleanup complete!');
    console.log(`   Remaining test products: ${remainingProducts}`);
    console.log(`   Remaining test locations: ${remainingLocations}`);

    // Show current database counts
    const totalProducts = await Product.countDocuments();
    const totalLocations = await Location.countDocuments();
    const totalStock = await Stock.countDocuments();
    const totalRecommendations = await Recommendation.countDocuments();

    console.log('\n📊 Current database counts:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Locations: ${totalLocations}`);
    console.log(`   Stock entries: ${totalStock}`);
    console.log(`   Recommendations: ${totalRecommendations}`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupTestData();

