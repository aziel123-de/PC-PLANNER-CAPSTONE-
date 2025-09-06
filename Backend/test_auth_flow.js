(async ()=>{
  try {
    const email = `auto+${Date.now()}@example.com`;
    const password = 'password123';
    const username = 'AutoTester';
    console.log('registering', email);
    let r = await fetch('http://127.0.0.1:5050/api/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, username, password})
    });
    console.log('register status', r.status);
    const regText = await r.text();
    try { console.log('register body', JSON.parse(regText)); } catch(e){ console.log('register body raw', regText); }

    console.log('logging in');
    r = await fetch('http://127.0.0.1:5050/api/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password})
    });
    console.log('login status', r.status);
    const loginText = await r.text();
    try { console.log('login body', JSON.parse(loginText)); } catch(e){ console.log('login body raw', loginText); }

  } catch (err) {
    console.error('test error', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
