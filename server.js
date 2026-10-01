const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;

const travelers = [
  {
    id: 'T-1001',
    name: 'Aisha Rahman',
    memberNumber: 'FFP-1001',
    tier: 'Gold',
    status: 'Active',
    email: 'aisha.rahman@example.com',
    homeAirport: 'JFK',
    travelPreferences: ['Business', 'Long-haul'],
    totalPoints: 18750,
    lastCheckedIn: '2026-09-24T08:15:00Z'
  },
  {
    id: 'T-1002',
    name: 'Daniel Kim',
    memberNumber: 'FFP-1002',
    tier: 'Silver',
    status: 'Active',
    email: 'daniel.kim@example.com',
    homeAirport: 'LAX',
    travelPreferences: ['Leisure', 'Weekend trips'],
    totalPoints: 8420,
    lastCheckedIn: '2026-09-21T16:00:00Z'
  },
  {
    id: 'T-1003',
    name: 'Sofia Martinez',
    memberNumber: 'FFP-1003',
    tier: 'Platinum',
    status: 'Paused',
    email: 'sofia.martinez@example.com',
    homeAirport: 'MIA',
    travelPreferences: ['Premium cabins', 'International'],
    totalPoints: 32640,
    lastCheckedIn: '2026-09-18T12:20:00Z'
  }
];

const workflows = [
  {
    id: 'W-2001',
    title: 'Loyalty tier review',
    assignee: 'Nina Patel',
    priority: 'High',
    status: 'Open',
    travelerId: 'T-1001',
    updatedAt: '2026-09-28T10:30:00Z'
  },
  {
    id: 'W-2002',
    title: 'Baggage exception review',
    assignee: 'Adam Shaw',
    priority: 'Medium',
    status: 'In Progress',
    travelerId: 'T-1002',
    updatedAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 'W-2003',
    title: 'Partner award redemption',
    assignee: 'Chloe Ng',
    priority: 'Low',
    status: 'Resolved',
    travelerId: 'T-1003',
    updatedAt: '2026-09-27T15:45:00Z'
  }
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function getTravelerSummary() {
  return {
    totalTravelers: travelers.length,
    activeTravelers: travelers.filter((traveler) => traveler.status === 'Active').length,
    platinumMembers: travelers.filter((traveler) => traveler.tier === 'Platinum').length,
    totalPoints: travelers.reduce((sum, traveler) => sum + traveler.totalPoints, 0)
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function parseId(pathname) {
  const match = pathname.match(/\/api\/(?:travelers|workflows)\/(.+)$/);
  return match ? match[1] : null;
}

function serveStaticFile(res, requestedPath) {
  const safePath = path.normalize(requestedPath).replace(/^\/+/, '');
  const filePath = path.join(__dirname, 'public', safePath);

  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    sendJson(res, 403, { error: 'Access denied' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    res.end(content);
  });
}

function handleApi(req, res) {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok', service: 'frequent-flyer-portal', timestamp: new Date().toISOString() });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/summary') {
    sendJson(res, 200, { summary: getTravelerSummary(), workflows: workflows.length });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/travelers') {
    let result = [...travelers];
    const tier = searchParams.get('tier');
    if (tier) result = result.filter((traveler) => traveler.tier.toLowerCase() === tier.toLowerCase());

    const status = searchParams.get('status');
    if (status) result = result.filter((traveler) => traveler.status.toLowerCase() === status.toLowerCase());

    sendJson(res, 200, result);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/travelers') {
    readBody(req)
      .then((body) => {
        if (!body.name || !body.memberNumber) {
          sendJson(res, 400, { error: 'Traveler name and memberNumber are required.' });
          return;
        }

        const traveler = {
          id: `T-${String(travelers.length + 1001).padStart(4, '0')}`,
          name: body.name,
          memberNumber: body.memberNumber,
          tier: body.tier || 'Silver',
          status: body.status || 'Active',
          email: body.email || `${body.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          homeAirport: body.homeAirport || 'LAX',
          travelPreferences: Array.isArray(body.travelPreferences) ? body.travelPreferences : [],
          totalPoints: Number(body.totalPoints || 0),
          lastCheckedIn: new Date().toISOString()
        };

        travelers.push(traveler);
        sendJson(res, 201, traveler);
      })
      .catch((error) => {
        sendJson(res, 400, { error: error.message || 'Unable to create traveler.' });
      });
    return;
  }

  const travelerMatch = pathname.match(/^\/api\/travelers\/([^/]+)$/);
  if (travelerMatch) {
    const travelerId = travelerMatch[1];
    const traveler = travelers.find((entry) => entry.id === travelerId);

    if (req.method === 'GET') {
      if (!traveler) {
        sendJson(res, 404, { error: 'Traveler not found.' });
        return;
      }
      sendJson(res, 200, traveler);
      return;
    }

    if (req.method === 'PUT') {
      readBody(req)
        .then((body) => {
          if (!traveler) {
            sendJson(res, 404, { error: 'Traveler not found.' });
            return;
          }

          Object.assign(traveler, {
            name: body.name || traveler.name,
            memberNumber: body.memberNumber || traveler.memberNumber,
            tier: body.tier || traveler.tier,
            status: body.status || traveler.status,
            email: body.email || traveler.email,
            homeAirport: body.homeAirport || traveler.homeAirport,
            travelPreferences: Array.isArray(body.travelPreferences) ? body.travelPreferences : traveler.travelPreferences,
            totalPoints: Number(body.totalPoints ?? traveler.totalPoints),
            lastCheckedIn: new Date().toISOString()
          });

          sendJson(res, 200, traveler);
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message || 'Unable to update traveler.' });
        });
      return;
    }

    if (req.method === 'DELETE') {
      const index = travelers.findIndex((entry) => entry.id === travelerId);
      if (index === -1) {
        sendJson(res, 404, { error: 'Traveler not found.' });
        return;
      }
      const [removedTraveler] = travelers.splice(index, 1);
      sendJson(res, 200, { deleted: true, traveler: removedTraveler });
      return;
    }

    if (req.method === 'POST' && pathname.endsWith('/points')) {
      readBody(req)
        .then((body) => {
          if (!traveler) {
            sendJson(res, 404, { error: 'Traveler not found.' });
            return;
          }

          const delta = Number(body.points || 0);
          traveler.totalPoints = Math.max(0, traveler.totalPoints + delta);
          traveler.lastCheckedIn = new Date().toISOString();
          sendJson(res, 200, {
            traveler,
            delta,
            reason: body.reason || 'Manual adjustments'
          });
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message || 'Unable to update points.' });
        });
      return;
    }
  }

  if (req.method === 'GET' && pathname === '/api/workflows') {
    sendJson(res, 200, workflows);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/workflows') {
    readBody(req)
      .then((body) => {
        if (!body.title || !body.assignee) {
          sendJson(res, 400, { error: 'Workflow title and assignee are required.' });
          return;
        }

        const workflow = {
          id: `W-${String(workflows.length + 2001).padStart(4, '0')}`,
          title: body.title,
          assignee: body.assignee,
          priority: body.priority || 'Medium',
          status: body.status || 'Open',
          travelerId: body.travelerId || travelers[0]?.id || 'T-1001',
          updatedAt: new Date().toISOString()
        };
        workflows.push(workflow);
        sendJson(res, 201, workflow);
      })
      .catch((error) => {
        sendJson(res, 400, { error: error.message || 'Unable to create workflow.' });
      });
    return;
  }

  const workflowMatch = pathname.match(/^\/api\/workflows\/([^/]+)$/);
  if (workflowMatch) {
    const workflowId = workflowMatch[1];
    const workflow = workflows.find((entry) => entry.id === workflowId);

    if (req.method === 'GET') {
      if (!workflow) {
        sendJson(res, 404, { error: 'Workflow not found.' });
        return;
      }
      sendJson(res, 200, workflow);
      return;
    }

    if (req.method === 'PATCH') {
      readBody(req)
        .then((body) => {
          if (!workflow) {
            sendJson(res, 404, { error: 'Workflow not found.' });
            return;
          }

          workflow.status = body.status || workflow.status;
          workflow.priority = body.priority || workflow.priority;
          workflow.assignee = body.assignee || workflow.assignee;
          workflow.updatedAt = new Date().toISOString();
          sendJson(res, 200, workflow);
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message || 'Unable to update workflow.' });
        });
      return;
    }
  }

  sendJson(res, 404, { error: 'Route not found.' });
}

function createServer() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (pathname === '/' || pathname === '/index.html') {
      serveStaticFile(res, 'index.html');
      return;
    }

    if (pathname.startsWith('/api/')) {
      handleApi(req, res);
      return;
    }

    if (pathname.startsWith('/')) {
      serveStaticFile(res, pathname === '/' ? 'index.html' : pathname.slice(1));
    }
  });
}

function startServer(port = PORT) {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

if (require.main === module) {
  startServer(PORT).then((server) => {
    const address = server.address();
    console.log(`Frequent Flyer Portal running at http://localhost:${address.port}`);
  });
}

module.exports = {
  createServer,
  startServer,
  travelers,
  workflows,
  getTravelerSummary
};
