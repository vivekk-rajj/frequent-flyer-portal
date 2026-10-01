const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../server.js');

let server;
let baseUrl;

test.before(async () => {
  server = await startServer(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET /api/health returns service metadata', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.service, 'frequent-flyer-portal');
  assert.equal(payload.status, 'ok');
});

test('GET /api/travelers returns seeded traveler data', async () => {
  const response = await fetch(`${baseUrl}/api/travelers`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(Array.isArray(payload));
  assert.ok(payload.length >= 3);
  assert.equal(payload[0].memberNumber, 'FFP-1001');
});

test('POST /api/travelers creates a traveler and returns 201', async () => {
  const response = await fetch(`${baseUrl}/api/travelers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Shah',
      memberNumber: 'FFP-1010',
      tier: 'Gold',
      status: 'Active',
      email: 'priya.shah@example.com',
      homeAirport: 'SFO',
      travelPreferences: ['Long-haul', 'Family travel'],
      totalPoints: 12000
    })
  });

  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.equal(payload.name, 'Priya Shah');
  assert.equal(payload.memberNumber, 'FFP-1010');
});

test('POST /api/workflows creates a staff workflow', async () => {
  const response = await fetch(`${baseUrl}/api/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Seat upgrade approval',
      assignee: 'Sara Liu',
      priority: 'High',
      travelerId: 'T-1002'
    })
  });

  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.equal(payload.assignee, 'Sara Liu');
  assert.equal(payload.status, 'Open');
});

