/**
 * Phase I endpoint smoke test.
 *
 * Starts from an existing backend (default http://localhost:5010) and:
 * 1) Registers or logs in a seller
 * 2) Calls:
 *    - GET /api/transfers/summary
 *    - GET /api/transfers/top
 *    - GET /api/alerts/stock-health
 *    - GET /api/alerts/demand-surge
 *
 * Usage:
 *   node backend/test_phaseI_endpoints.js
 *
 * Env:
 *   BACKEND_URL (default http://localhost:5010)
 *   TEST_EMAIL / TEST_PASSWORD
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5010';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'seller_api_key_456';
const TEST_EMAIL = process.env.TEST_EMAIL || `seller_${Date.now()}@example.com`;
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
  const reg = await http('POST', '/api/auth/register', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD, role: 'seller' }
  });
  if (reg.status === 201 && reg.json?.success) return reg.json.data.token;

  const login = await http('POST', '/api/auth/login', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD }
  });
  if (login.status === 200 && login.json?.success) return login.json.data.token;

  throw new Error(`Failed to auth. register=${reg.status} login=${login.status}`);
}

async function main() {
  console.log('Backend:', BACKEND_URL);
  const token = await getToken();
  console.log('✓ Got token');

  const endpoints = [
    ['/api/transfers/summary', 'summary'],
    ['/api/transfers/top', 'top'],
    ['/api/alerts/stock-health', 'stock-health'],
    ['/api/alerts/demand-surge', 'demand-surge']
  ];

  for (const [path, label] of endpoints) {
    const res = await http('GET', path, { token });
    console.log(`\nGET ${path} -> ${res.status}`);
    console.log(label, JSON.stringify(res.json, null, 2));
  }
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});


