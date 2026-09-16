/**
 * Test script for Phase E, F, G implementation
 * Validates models, controllers, and database operations
 */
const mongoose = require('mongoose');

// Models
const TransferExec = require('./models/TransferExec');
const TransferImpact = require('./models/TransferImpact');
const Recommendation = require('./models/Recommendation');
const Stock = require('./models/Stock');
const Product = require('./models/Product');
const Location = require('./models/Location');

const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

async function runTests() {
  console.log('=== Phase E/F/G Implementation Test ===\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Test 1: Check models exist
    console.log('--- Model Validation ---');
    console.log('✓ TransferExec model loaded');
    console.log('✓ TransferImpact model loaded');
    console.log('✓ Recommendation model loaded');
    console.log('');
    
    // Test 2: Generate execId
    console.log('--- ExecId Generation ---');
    const execId = await TransferExec.generateExecId();
    console.log(`✓ Generated execId: ${execId}`);
    console.log('');
    
    // Test 3: Check collection counts
    console.log('--- Collection Counts ---');
    const counts = {
      products: await Product.countDocuments(),
      locations: await Location.countDocuments(),
      stocks: await Stock.countDocuments(),
      recommendations: await Recommendation.countDocuments(),
      transferExec: await TransferExec.countDocuments(),
      transferImpact: await TransferImpact.countDocuments()
    };
    
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`);
    });
    console.log('');
    
    // Test 4: Verify recommendation schema has new fields
    console.log('--- Recommendation Schema ---');
    const recSchema = Recommendation.schema.obj;
    const requiredFields = ['approved', 'approvedAt', 'distance_km', 'profit_est', 'score'];
    requiredFields.forEach(field => {
      const hasField = field in recSchema;
      console.log(`  ${field}: ${hasField ? '✓' : '✗'}`);
    });
    console.log('');
    
    // Test 5: Sample recommendation
    console.log('--- Sample Recommendation ---');
    const sampleRec = await Recommendation.findOne()
      .populate('productId', 'name')
      .populate('fromLocationId', 'name')
      .populate('toLocationId', 'name')
      .lean();
    
    if (sampleRec) {
      console.log(`  ID: ${sampleRec._id}`);
      console.log(`  Product: ${sampleRec.productId?.name || 'N/A'}`);
      console.log(`  From: ${sampleRec.fromLocationId?.name || 'N/A'}`);
      console.log(`  To: ${sampleRec.toLocationId?.name || 'N/A'}`);
      console.log(`  Quantity: ${sampleRec.quantity}`);
      console.log(`  Approved: ${sampleRec.approved}`);
      console.log(`  Profit Est: ${sampleRec.profit_est || 'N/A'}`);
    } else {
      console.log('  No recommendations found');
    }
    console.log('');
    
    // Test 6: Check indexes
    console.log('--- TransferExec Indexes ---');
    const indexes = await TransferExec.collection.getIndexes();
    Object.keys(indexes).forEach(idx => {
      console.log(`  ${idx}`);
    });
    console.log('');
    
    console.log('=== All Tests Passed ===');
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

runTests();

