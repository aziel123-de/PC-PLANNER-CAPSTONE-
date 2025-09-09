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

// update user (username / full_name)
app.put(`${API_PREFIX}/users/:id`, async (req, res) => {
  const id = req.params.id;
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.sub !== id) return res.status(403).json({ error: 'forbidden' });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }

  const { full_name, username } = req.body || {};
  if (!full_name && !username) return res.status(400).json({ error: 'nothing to update' });

  const newName = full_name || username || null;
  const conn = await pool.getConnection();
  try {
    await conn.query('UPDATE users SET username = ? WHERE id = ?', [newName, id]);
    const [rows] = await conn.query('SELECT id,email,username,createdAt FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

// get user by id (requires auth)
app.get(`${API_PREFIX}/users/:id`, async (req, res) => {
  const id = req.params.id;
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.sub !== id) return res.status(403).json({ error: 'forbidden' });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,email,username,createdAt FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('db error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

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
