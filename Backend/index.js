// Minimal clean Express backend (register/login)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const pool = require('./mysql');

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const API_PREFIX = '/api';

// helper to extract user ID from JWT bearer token
function getUserIdFromRequest(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub || payload.id || null;
  } catch (e) {
    return null;
  }
}

async function ensureSchema() {
  const conn = await pool.getConnection();
  try {
    const sql = `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255),
      salt VARCHAR(100) NOT NULL,
      hash VARCHAR(255) NOT NULL,
      createdAt DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    await conn.query(sql);
  } finally {
    conn.release();
  }
}

const handleRegister = async (req, res) => {
  const { email, username, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'password too short' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length) return res.status(409).json({ error: 'email already registered' });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const id = uuidv4();
    const createdAt = new Date();
    await conn.query('INSERT INTO users (id,email,username,salt,hash,createdAt) VALUES (?,?,?,?,?,?)', [id, email.toLowerCase(), username || null, salt, hash, createdAt]);
    return res.status(201).json({ user: { id, email: email.toLowerCase(), username: username || null, createdAt } });
  } catch (err) {
    console.error('db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,email,username,hash FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
    const row = rows[0];
    const match = bcrypt.compareSync(password, row.hash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: row.id, email: row.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: row.id, email: row.email, username: row.username, createdAt: row.createdAt }, token });
  } catch (err) {
    console.error('db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
};

// routes
app.post('/register', handleRegister);
app.post(`${API_PREFIX}/register`, handleRegister);
app.post('/login', handleLogin);
app.post(`${API_PREFIX}/login`, handleLogin);

const port = process.env.PORT || 5050;
ensureSchema().then(() => {
  app.listen(port, '127.0.0.1', () => console.log('Backend listening on 127.0.0.1:' + port));
}).catch(err => {
  console.error('Schema setup failed', err);
  process.exit(1);
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const message = (err && (err.message || err.toString())) || 'Internal server error';
  res.status(500).json({ error: message });
});

// Components listing endpoint
app.get(`${API_PREFIX}/components/:type`, async (req, res) => {
  const { type } = req.params || {};
  const map = {
    cpu: 'cpu',
    gpu: 'gpu',
    psu: 'psu',
    mobo: 'mobo',
    ram: 'ram',
    storage: 'storage',
    m2: 'm2',
    case: 'pc_case'
  };
  const table = map[type];
  if (!table) return res.status(400).json({ error: 'unknown component type' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`SELECT * FROM \`${table}\` ORDER BY id ASC LIMIT 1000`);
    return res.json(rows.map(r => ({ ...r })));
  } catch (err) {
    console.error('components fetch error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

// Saved builds endpoints

app.post(`${API_PREFIX}/builds`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { name, description, parts, total_price, warnings, has_issues } = req.body || {};
  if (!name || !parts) return res.status(400).json({ error: 'name and parts required' });
  const now = new Date();
  const id = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO saved_builds (id,user_id,name,description,total_price,parts_json,warnings_json,has_issues,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, userId, name, description || '', total_price || 0, JSON.stringify(parts), JSON.stringify(warnings || []), has_issues ? 1 : 0, now, now]
    );
    return res.status(201).json({ id, name });
  } catch (err) {
    console.error('save build db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

app.get(`${API_PREFIX}/builds`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,name,description,total_price,warnings_json,has_issues,createdAt,updatedAt,parts_json FROM saved_builds WHERE user_id=? ORDER BY createdAt DESC LIMIT 200', [userId]);
    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      total_price: r.total_price,
      warnings: safeParse(r.warnings_json, []),
      has_issues: !!r.has_issues,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      parts: safeParse(r.parts_json, {})
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('list builds db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

app.get(`${API_PREFIX}/builds/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM saved_builds WHERE id=? AND user_id=? LIMIT 1', [id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    const r = rows[0];
    return res.json({
      id: r.id,
      name: r.name,
      description: r.description,
      total_price: r.total_price,
      warnings: safeParse(r.warnings_json, []),
      has_issues: !!r.has_issues,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      parts: safeParse(r.parts_json, {})
    });
  } catch (err) {
    console.error('get build db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

app.delete(`${API_PREFIX}/builds/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query('DELETE FROM saved_builds WHERE id=? AND user_id=?', [id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('delete build db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Update existing build
app.put(`${API_PREFIX}/builds/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const { name, description, parts, total_price, warnings, has_issues } = req.body || {};
  if (!parts) return res.status(400).json({ error: 'parts required' });
  const now = new Date();
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT id FROM saved_builds WHERE id=? AND user_id=? LIMIT 1', [id, userId]);
    if (!existing.length) return res.status(404).json({ error: 'not found' });
    await conn.query(
      'UPDATE saved_builds SET name=COALESCE(?,name), description=COALESCE(?,description), total_price=?, parts_json=?, warnings_json=?, has_issues=?, updatedAt=? WHERE id=? AND user_id=?',
      [name || null, description || null, total_price || 0, JSON.stringify(parts), JSON.stringify(warnings || []), has_issues ? 1 : 0, now, id, userId]
    );
    return res.json({ id, name: name || undefined, updated: true });
  } catch (err) {
    console.error('update build db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

function safeParse(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}
