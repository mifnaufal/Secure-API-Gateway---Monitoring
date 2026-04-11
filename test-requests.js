#!/usr/bin/env node

/**
 * Test Script: Generate 40 requests (Normal + Suspicious + Dangerous)
 * 
 * Usage:
 *   node test-requests.js
 * 
 * Prerequisites:
 *   - Backend services running (Gateway, Auth, Data, Monitoring)
 *   - Default admin credentials unchanged
 */

const http = require('http');

const GATEWAY = 'http://localhost:3000';
const MONITORING = 'http://localhost:3003';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const typeColors = {
    NORMAL: colors.green,
    SUSPICIOUS: colors.yellow,
    DANGEROUS: colors.red,
    INFO: colors.blue,
    SUCCESS: colors.cyan,
    ERROR: colors.bgRed + colors.bright,
  };

  const color = typeColors[type] || colors.reset;
  console.log(`${colors.bright}[${timestamp}]${colors.reset} ${color}[${type}]${colors.reset} ${message}`);
}

// Helper: Make HTTP request
async function makeRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTest() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.cyan}🧪 REQUEST TEST: 40 Requests (Normal + Suspicious + Dangerous)${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  let accessToken = null;
  let requestCount = 0;

  // Helper to track requests
  function track(type, desc, promise) {
    requestCount++;
    return promise
      .then(res => {
        log(type, `#${requestCount} ${desc} → ${res.status} ${res.body?.error?.code || res.body?.message || 'OK'}`);
        return res;
      })
      .catch(err => {
        log('ERROR', `#${requestCount} ${desc} → ${err.message}`);
        return null;
      });
  }

  // ========================================
  // PHASE 1: Normal Requests (15 requests)
  // ========================================
  console.log(`\n${colors.bgGreen}${colors.bright} PHASE 1: NORMAL REQUESTS (15 requests) ${colors.reset}\n`);
  await sleep(500);

  // 1. Health check - Gateway
  await track('NORMAL', 'GET /health (Gateway)',
    makeRequest('GET', `${GATEWAY}/health`));
  await sleep(200);

  // 2. Health check - Auth
  await track('NORMAL', 'GET /auth/health',
    makeRequest('GET', 'http://localhost:3001/health'));
  await sleep(200);

  // 3. Health check - Data
  await track('NORMAL', 'GET /data/health',
    makeRequest('GET', 'http://localhost:3002/health'));
  await sleep(200);

  // 4. Health check - Monitoring
  await track('NORMAL', 'GET /monitoring/health',
    makeRequest('GET', 'http://localhost:3003/health'));
  await sleep(200);

  // 5. Login as admin (valid credentials)
  const loginRes = await track('NORMAL', 'POST /api/auth/login (Admin)',
    makeRequest('POST', `${GATEWAY}/api/auth/login`, {
      username: 'admin',
      password: 'Admin123!',
    }));

  if (loginRes && loginRes.body && loginRes.body.accessToken) {
    accessToken = loginRes.body.accessToken;
    log('SUCCESS', '✓ Access token obtained');
  } else {
    log('ERROR', '✗ Failed to get access token - skipping authenticated requests');
  }

  await sleep(300);

  // 6. Get user profile
  if (accessToken) {
    await track('NORMAL', 'GET /api/auth/me (Profile)',
      makeRequest('GET', `${GATEWAY}/api/auth/me`, null, {
        'Authorization': `Bearer ${accessToken}`,
      }));
    await sleep(200);
  }

  // 7. Get items list (unauthorized - should fail)
  await track('NORMAL', 'GET /api/data (No Auth - Expected 401)',
    makeRequest('GET', `${GATEWAY}/api/data`));
  await sleep(200);

  // 8. Refresh token
  if (loginRes && loginRes.body && loginRes.body.refreshToken) {
    await track('NORMAL', 'POST /api/auth/refresh (Token Refresh)',
      makeRequest('POST', `${GATEWAY}/api/auth/refresh`, {
        token: loginRes.body.refreshToken,
      }));
    await sleep(300);
  }

  // 9-11. Try accessing protected routes without auth
  await track('NORMAL', 'GET /api/data/items (No Auth)',
    makeRequest('GET', `${GATEWAY}/api/data`));
  await sleep(200);

  await track('NORMAL', 'POST /api/data/create (No Auth)',
    makeRequest('POST', `${GATEWAY}/api/data`, { name: 'test' }));
  await sleep(200);

  // 12. Dashboard stats
  await track('NORMAL', 'GET /monitoring/dashboard (Stats)',
    makeRequest('GET', `${MONITORING}/monitoring/dashboard`));
  await sleep(200);

  // 13. Get alerts
  await track('NORMAL', 'GET /monitoring/alerts',
    makeRequest('GET', `${MONITORING}/monitoring/alerts`));
  await sleep(200);

  // 14. Get request logs
  await track('NORMAL', 'GET /monitoring/requests',
    makeRequest('GET', `${MONITORING}/monitoring/requests?limit=10`));
  await sleep(200);

  // 15. Anomaly stats
  await track('NORMAL', 'GET /monitoring/anomaly/stats',
    makeRequest('GET', `${MONITORING}/monitoring/anomaly/stats`));
  await sleep(500);

  // ==============================================
  // PHASE 2: Suspicious Requests (15 requests)
  // ==============================================
  console.log(`\n${colors.bgYellow}${colors.bright} PHASE 2: SUSPICIOUS REQUESTS (15 requests) ${colors.reset}\n`);
  await sleep(500);

  // 16-20. Multiple failed login attempts (brute force simulation)
  log('SUSPICIOUS', '⚠ Simulating brute force attack (5 failed logins)...');
  const failedUsernames = ['admin', 'root', 'administrator', 'test', 'user'];

  for (let i = 0; i < 5; i++) {
    await track('SUSPICIOUS', `Failed login #${i+1} (${failedUsernames[i]})`,
      makeRequest('POST', `${GATEWAY}/api/auth/login`, {
        username: failedUsernames[i],
        password: 'WrongPassword1!',
      }));
    await sleep(300);
  }

  // 21-23. Requests with invalid tokens
  log('SUSPICIOUS', '⚠ Requests with invalid tokens...');
  await track('SUSPICIOUS', 'GET /api/data with fake token',
    makeRequest('GET', `${GATEWAY}/api/data`, null, {
      'Authorization': 'Bearer invalid-token-12345',
    }));
  await sleep(200);

  await track('SUSPICIOUS', 'GET /api/auth/me with expired token format',
    makeRequest('GET', `${GATEWAY}/api/auth/me`, null, {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.token',
    }));
  await sleep(200);

  await track('SUSPICIOUS', 'POST /api/data with malformed token',
    makeRequest('POST', `${GATEWAY}/api/data`, { name: 'test' }, {
      'Authorization': 'Bearer not-a-valid-jwt-token',
    }));
  await sleep(200);

  // 24-26. Registration with suspicious data
  log('SUSPICIOUS', '⚠ Suspicious registration attempts...');
  await track('SUSPICIOUS', 'Register with admin-like username',
    makeRequest('POST', `${GATEWAY}/api/auth/register`, {
      username: 'admin_support',
      email: 'fake-admin@example.com',
      password: 'Test1234!',
    }));
  await sleep(300);

  await track('SUSPICIOUS', 'Register with disposable email pattern',
    makeRequest('POST', `${GATEWAY}/api/auth/register`, {
      username: 'tempuser99',
      email: 'temp@tempmail.com',
      password: 'Temp1234!',
    }));
  await sleep(300);

  // 27-28. Accessing non-existent endpoints
  log('SUSPICIOUS', '⚠ Probing for non-existent endpoints...');
  await track('SUSPICIOUS', 'GET /api/.env (Path traversal attempt)',
    makeRequest('GET', `${GATEWAY}/api/.env`));
  await sleep(200);

  await track('SUSPICIOUS', 'GET /api/admin/users (Unauthorized admin access)',
    makeRequest('GET', `${GATEWAY}/api/admin/users`));
  await sleep(200);

  // 29-30. Requests with suspicious headers
  log('SUSPICIOUS', '⚠ Requests with modified headers...');
  await track('SUSPICIOUS', 'GET with SQL injection attempt in header',
    makeRequest('GET', `${GATEWAY}/health`, null, {
      'X-Forwarded-For': "1' OR '1'='1",
    }));
  await sleep(200);

  await track('SUSPICIOUS', 'GET with script tag in user-agent',
    makeRequest('GET', `${GATEWAY}/health`, null, {
      'User-Agent': '<script>alert("XSS")</script>',
    }));
  await sleep(500);

  // =============================================
  // PHASE 3: Dangerous Requests (10 requests)
  // =============================================
  console.log(`\n${colors.bgRed}${colors.bright} PHASE 3: DANGEROUS REQUESTS (10 requests) ${colors.reset}\n`);
  await sleep(500);

  // 31-35. Rapid-fire failed logins (will trigger rate limiting)
  log('DANGEROUS', '🚨 Rapid brute force attack (5 rapid requests)...');
  const rapidAttempts = [
    { username: 'admin', password: 'admin123' },
    { username: 'admin', password: 'password' },
    { username: 'admin', password: '123456' },
    { username: 'admin', password: 'qwerty' },
    { username: 'admin', password: 'letmein' },
  ];

  for (let i = 0; i < rapidAttempts.length; i++) {
    await track('DANGEROUS', `🚨 Rapid brute #${i+1}`,
      makeRequest('POST', `${GATEWAY}/api/auth/login`, rapidAttempts[i]));
    await sleep(100); // Very fast - suspicious
  }

  // 36-37. Token abuse attempts
  log('DANGEROUS', '🚨 Token abuse attempts...');
  await track('DANGEROUS', '🚨 POST /api/auth/refresh with stolen token format',
    makeRequest('POST', `${GATEWAY}/api/auth/refresh`, {
      token: 'stolen-refresh-token-attempt',
    }));
  await sleep(100);

  await track('DANGEROUS', '🚨 Multiple rapid refresh attempts',
    makeRequest('POST', `${GATEWAY}/api/auth/refresh`, {
      token: 'another-fake-token',
    }));
  await sleep(100);

  // 38-39. Admin endpoint probing
  log('DANGEROUS', '🚨 Admin endpoint exploitation attempts...');
  await track('DANGEROUS', '🚨 POST /api/admin/* without auth',
    makeRequest('POST', `${GATEWAY}/api/admin/settings`, {
      config: 'malicious-payload',
    }));
  await sleep(100);

  await track('DANGEROUS', '🚨 DELETE attempt on critical endpoint',
    makeRequest('DELETE', `${GATEWAY}/api/data/1`, null, {
      'Authorization': 'Bearer fake-admin-token',
    }));
  await sleep(100);

  // 40. Anomaly analysis (to detect all the bad stuff we just did)
  log('DANGEROUS', '🚨 Final: Triggering anomaly detection...');
  await track('DANGEROUS', '🚨 GET /monitoring/anomaly/analyze',
    makeRequest('GET', `${MONITORING}/monitoring/anomaly/analyze`));
  await sleep(500);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`\n${colors.bright}Total Requests Sent: ${requestCount}${colors.reset}`);
  console.log(`\n  ${colors.green}✓ Normal:      15 requests${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Suspicious:   15 requests${colors.reset}`);
  console.log(`  ${colors.red}🚨 Dangerous:    10 requests${colors.reset}`);
  console.log(`\n${colors.cyan}Expected Results:${colors.reset}`);
  console.log(`  • Rate limiting triggered on auth endpoints`);
  console.log(`  • Multiple failed login attempts logged`);
  console.log(`  • IP tracking updated with failed login counts`);
  console.log(`  • Anomaly detection should flag suspicious patterns`);
  console.log(`  • Alerts generated for brute force attempts`);
  console.log(`\n${colors.cyan}Check Dashboard:${colors.reset}`);
  console.log(`  • http://localhost:3004 - View all activity`);
  console.log(`  • Dashboard page - See stats and charts`);
  console.log(`  • Anomaly Analysis - Run detection`);
  console.log(`  • Alerts - Check for generated alerts`);
  console.log(`  • IP Tracking - View blocked/suspicious IPs`);
  console.log(`\n${'='.repeat(80)}\n`);
}

// Run the test
async function main() {
  try {
    // Check if services are running first
    log('INFO', 'Checking if services are running...');
    try {
      const healthCheck = await makeRequest('GET', `${GATEWAY}/health`);
      if (healthCheck.status === 200) {
        log('SUCCESS', '✓ Gateway is running');
      } else {
        throw new Error('Gateway not healthy');
      }
    } catch (error) {
      console.log(`\n${colors.bgRed}${colors.bright} ERROR: Services not running! ${colors.reset}\n`);
      console.log(`${colors.yellow}Please start the backend first:${colors.reset}\n`);
      console.log(`  Option 1 (Docker):`);
      console.log(`    ${colors.cyan}docker-compose up -d${colors.reset}\n`);
      console.log(`  Option 2 (Manual - 4 terminals):`);
      console.log(`    Terminal 1: ${colors.cyan}npm run gateway${colors.reset}`);
      console.log(`    Terminal 2: ${colors.cyan}npm run auth${colors.reset}`);
      console.log(`    Terminal 3: ${colors.cyan}npm run data${colors.reset}`);
      console.log(`    Terminal 4: ${colors.cyan}npm run monitoring${colors.reset}\n`);
      console.log(`  Option 3 (All at once):`);
      console.log(`    ${colors.cyan}npm run dev:all${colors.reset}\n`);
      console.log(`${colors.yellow}Wait for all services to be ready before running this test.${colors.reset}\n`);
      process.exit(1);
    }

    await runTest();
  } catch (err) {
    console.error(`${colors.bgRed}${colors.bright}FATAL ERROR:${colors.reset}`, err.message);
    process.exit(1);
  }
}

main();
