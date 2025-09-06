(async ()=>{
  try {
    const payload = { email: `test+${Date.now()}@example.com`, username: 'Tester', password: 'password123' };
    const res = await fetch('http://127.0.0.1:5050/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('status', res.status);
    try { console.log('body', JSON.parse(text)); } catch (e) { console.log('body (raw)', text); }
  } catch (err) {
    console.error('request error', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
