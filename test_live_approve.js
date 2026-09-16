/**
 * Live HTTP test for the recommendation approval endpoint.
 *
 * It will:
 * 1) Register a temporary seller user (or login if already exists)
 * 2) Fetch recommendations
 * 3) Approve the first unapproved recommendation (sending payload)
 *
 * Usage:
 *   node backend/test_live_approve.js
 *
 * Env overrides:
 *   BACKEND_URL (default http://localhost:5003)
 *   TEST_EMAIL / TEST_PASSWORD
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5003';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'seller_api_key_456';

const TEST_EMAIL =
  process.env.TEST_EMAIL || `seller_${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Passw0rd!123';

async function http(method, path, { token, body } = {}) {
  const headers = {
    'content-type': 'application/json',
    'x-api-key': API_KEY
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function getToken() {
  // Try register then fallback to login
  const reg = await http('POST', '/api/auth/register', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD, role: 'seller' }
  });
  if (reg.status === 201 && reg.json?.success) return reg.json.data.token;

  const login = await http('POST', '/api/auth/login', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD }
  });
  if (login.status === 200 && login.json?.success) return login.json.data.token;

  throw new Error(
    `Failed to get token. register=${reg.status} ${JSON.stringify(reg.json)} login=${login.status} ${JSON.stringify(login.json)}`
  );
}

async function main() {
  console.log('Backend:', BACKEND_URL);
  console.log('Using email:', TEST_EMAIL);

  const token = await getToken();
  console.log('✓ Got token');

  const recs = await http('GET', '/api/recommendations', { token });
  console.log('GET /api/recommendations ->', recs.status);
  if (!recs.json?.success) {
    console.log('Response:', recs.json);
    process.exit(1);
  }

  const list = recs.json.data || [];
  const rec = list.find((r) => !r.approved) || list[0];
  if (!rec) {
    console.log('No recommendations found to approve.');
    return;
  }

  // Normalize ids whether populated or not
  const payload = {
    productId: (rec.productId && (rec.productId._id || rec.productId))?.toString?.() || rec.productId,
    fromLocationId: (rec.fromLocationId && (rec.fromLocationId._id || rec.fromLocationId))?.toString?.() || rec.fromLocationId,
    toLocationId: (rec.toLocationId && (rec.toLocationId._id || rec.toLocationId))?.toString?.() || rec.toLocationId,
    quantity: rec.quantity
  };

  console.log('Approving recommendation:', rec._id);
  console.log('Payload:', payload);

  const approve = await http('POST', `/api/recommendations/${rec._id}/approve`, {
    token,
    body: payload
  });

  console.log('POST /api/recommendations/:id/approve ->', approve.status);
  console.log('Response:', approve.json);
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});


