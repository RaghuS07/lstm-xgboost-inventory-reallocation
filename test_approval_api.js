/**
 * Test script to verify the approval API works correctly
 */
const mongoose = require('mongoose');
// Load all models
require('./models/Product');
require('./models/Location');
require('./models/Stock');
require('./models/Recommendation');
require('./models/TransferExec');

const Recommendation = require('./models/Recommendation');
const TransferExec = require('./models/TransferExec');
const Stock = require('./models/Stock');
const Product = require('./models/Product');
const Location = require('./models/Location');

const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

async function testApproval() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Find an unapproved recommendation
    console.log('--- Finding unapproved recommendation ---');
    const recommendation = await Recommendation.findOne({ approved: false })
      .populate('productId', 'name')
      .populate('fromLocationId', 'name')
      .populate('toLocationId', 'name')
      .lean();
    
    if (!recommendation) {
      console.log('  No unapproved recommendations found.');
      console.log('  Creating a test recommendation...');
      
      // Find any product and locations
      const product = await Product.findOne().lean();
      const fromLoc = await Location.findOne().lean();
      const toLoc = await Location.find({ _id: { $ne: fromLoc._id } }).limit(1).lean();
      
      if (!product || !fromLoc || toLoc.length === 0) {
        console.log('  ✗ Need at least 1 product and 2 locations to create test recommendation');
        return;
      }
      
      const testRec = new Recommendation({
        productId: product._id,
        fromLocationId: fromLoc._id,
        toLocationId: toLoc[0]._id,
        quantity: 5,
        priority: 'high'
      });
      await testRec.save();
      console.log('  ✓ Created test recommendation');
      
      // Ensure stock exists
      let stock = await Stock.findOne({
        productId: product._id,
        locationId: fromLoc._id
      });
      if (!stock) {
        stock = new Stock({
          productId: product._id,
          locationId: fromLoc._id,
          quantity: 100
        });
        await stock.save();
        console.log('  ✓ Created test stock (100 units)');
      } else {
        stock.quantity = 100;
        await stock.save();
        console.log('  ✓ Updated stock to 100 units');
      }
      
      console.log('\n  Please run the approval API test again.');
      return;
    }
    
    console.log(`  Found: ${recommendation.productId?.name || 'Unknown'}`);
    console.log(`  From: ${recommendation.fromLocationId?.name || 'Unknown'}`);
    console.log(`  To: ${recommendation.toLocationId?.name || 'Unknown'}`);
    console.log(`  Quantity: ${recommendation.quantity}`);
    console.log(`  ID: ${recommendation._id}`);
    console.log('');
    
    // Check stock
    console.log('--- Checking stock ---');
    const stock = await Stock.findOne({
      productId: recommendation.productId,
      locationId: recommendation.fromLocationId
    }).lean();
    
    if (!stock) {
      console.log('  ✗ No stock found at source location');
      console.log('  Creating stock...');
      const newStock = new Stock({
        productId: recommendation.productId,
        locationId: recommendation.fromLocationId,
        quantity: 100
      });
      await newStock.save();
      console.log('  ✓ Created stock (100 units)');
    } else {
      console.log(`  ✓ Stock available: ${stock.quantity} units`);
      if (stock.quantity < recommendation.quantity) {
        console.log(`  ⚠ Insufficient stock! Updating to 100...`);
        await Stock.updateOne(
          { _id: stock._id },
          { $set: { quantity: 100 } }
        );
        console.log('  ✓ Updated stock to 100 units');
      }
    }
    console.log('');
    
    // Check existing transfer execs
    console.log('--- Transfer Executions ---');
    const execCount = await TransferExec.countDocuments();
    console.log(`  Current count: ${execCount}`);
    console.log('');
    
    // Verify recommendation structure
    console.log('--- Recommendation Structure ---');
    console.log(`  productId: ${recommendation.productId} (${typeof recommendation.productId})`);
    console.log(`  fromLocationId: ${recommendation.fromLocationId} (${typeof recommendation.fromLocationId})`);
    console.log(`  toLocationId: ${recommendation.toLocationId} (${typeof recommendation.toLocationId})`);
    console.log(`  quantity: ${recommendation.quantity}`);
    console.log(`  approved: ${recommendation.approved}`);
    console.log('');
    
    console.log('=== Test Setup Complete ===');
    console.log('');
    console.log('To test the API, make a POST request to:');
    console.log(`  POST /api/recommendations/${recommendation._id}/approve`);
    console.log('');
    console.log('With payload:');
    console.log(JSON.stringify({
      productId: recommendation.productId.toString(),
      fromLocationId: recommendation.fromLocationId.toString(),
      toLocationId: recommendation.toLocationId.toString(),
      quantity: recommendation.quantity
    }, null, 2));
    
  } catch (error) {
    console.error('Test Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testApproval();

