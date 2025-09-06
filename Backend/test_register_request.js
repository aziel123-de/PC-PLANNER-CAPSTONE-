const http = require('http');

const payload = JSON.stringify({
  email: `test+${Date.now()}@example.com`,
  username: 'Tester',
  password: 'password123'
});

const opts = {
  hostname: '127.0.0.1',
  port: process.env.PORT || 5050,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(opts, (res) => {
  let raw = '';
  res.on('data', (c) => raw += c);
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('headers', res.headers);
    try {
      console.log('body', JSON.parse(raw));
    } catch (e) {
      console.log('body (raw)', raw);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('request error', err && err.message ? err.message : err);
  process.exit(2);
});

req.write(payload);
req.end();
