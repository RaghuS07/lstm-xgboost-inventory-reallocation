/**
 * Verifies DB state after approving a recommendation.
 * Usage:
 *   node backend/test_db_verify_approval.js <recommendationObjectId>
 */
const mongoose = require('mongoose');
const Recommendation = require('./models/Recommendation');
const TransferExec = require('./models/TransferExec');

const MONGO_URI = 'mongodb://localhost:27017/supply-demand';

async function main() {
  const recId = process.argv[2];
  if (!recId) {
    console.error('Usage: node backend/test_db_verify_approval.js <recommendationObjectId>');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const rec = await Recommendation.findById(recId).lean();
  const exec = await TransferExec.findOne({ recommendationId: recId }).lean();

  console.log('recommendation:', {
    _id: rec?._id?.toString?.(),
    approved: rec?.approved,
    approvedAt: rec?.approvedAt
  });

  console.log('transfer_exec:', exec
    ? { _id: exec._id?.toString?.(), execId: exec.execId, status: exec.status }
    : null
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Verify failed:', e);
  process.exit(1);
});


