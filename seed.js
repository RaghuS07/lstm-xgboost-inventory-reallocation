// Manual seed script - run with: node seed.js
const mongoose = require('mongoose');
const seedData = require('./utils/seedData');
const config = require('./config');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Database:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding database...');
    await seedData();
    console.log('✅ Database seeded successfully!');

    // Verify data
    const Product = require('./models/Product');
    const Location = require('./models/Location');
    const Stock = require('./models/Stock');
    const Recommendation = require('./models/Recommendation');

    const productCount = await Product.countDocuments();
    const locationCount = await Location.countDocuments();
    const stockCount = await Stock.countDocuments();
    const recommendationCount = await Recommendation.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Locations: ${locationCount}`);
    console.log(`   Stock entries: ${stockCount}`);
    console.log(`   Recommendations: ${recommendationCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();

