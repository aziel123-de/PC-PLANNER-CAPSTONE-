// Minimal clean Express backend (register/login)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('./mysql');

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

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
      firebase_uid VARCHAR(255),
      salt VARCHAR(100),
      hash VARCHAR(255),
      profile_picture TEXT,
      createdAt DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    
    // Add firebase_uid column if it doesn't exist
    try {
      await conn.query('ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255)');
    } catch (e) {
      // Column already exists
    }
    
    // Make salt and hash nullable for Firebase users
    try {
      await conn.query('ALTER TABLE users MODIFY salt VARCHAR(100)');
      await conn.query('ALTER TABLE users MODIFY hash VARCHAR(255)');
    } catch (e) {
      // Already nullable
    }
    await conn.query(sql);
    // Community builds main table
    await conn.query(`CREATE TABLE IF NOT EXISTS community_builds (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      parts_json JSON NOT NULL,
      total_price INT DEFAULT 0,
      up_votes INT DEFAULT 0,
      down_votes INT DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      INDEX(user_id),
      CONSTRAINT fk_community_builds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    // Comments table
    await conn.query(`CREATE TABLE IF NOT EXISTS community_build_comments (
      id VARCHAR(36) PRIMARY KEY,
      build_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      comment_text VARCHAR(600) NOT NULL,
      createdAt DATETIME NOT NULL,
      INDEX(build_id),
      INDEX(user_id),
      CONSTRAINT fk_cbc_build FOREIGN KEY (build_id) REFERENCES community_builds(id) ON DELETE CASCADE,
      CONSTRAINT fk_cbc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    // Votes table (one row per user per build)
    await conn.query(`CREATE TABLE IF NOT EXISTS community_build_votes (
      build_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      direction ENUM('up','down') NOT NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      PRIMARY KEY (build_id, user_id),
      INDEX(user_id),
      CONSTRAINT fk_cbv_build FOREIGN KEY (build_id) REFERENCES community_builds(id) ON DELETE CASCADE,
      CONSTRAINT fk_cbv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    // Password reset tokens
    await conn.query(`CREATE TABLE IF NOT EXISTS password_resets (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token_hash VARCHAR(128) NOT NULL,
      expiresAt DATETIME NOT NULL,
      used TINYINT DEFAULT 0,
      createdAt DATETIME NOT NULL,
      INDEX(token_hash),
      INDEX(user_id),
      CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
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
    const [rows] = await conn.query('SELECT id,email,username,hash,profile_picture,createdAt FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
    const row = rows[0];
    const match = bcrypt.compareSync(password, row.hash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: row.id, email: row.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ 
      user: { 
        id: row.id, 
        email: row.email, 
        username: row.username, 
        profile_picture: row.profile_picture,
        createdAt: row.createdAt 
      }, 
      token 
    });
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

// Password reset: request reset link
app.post(`${API_PREFIX}/forgot-password`, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,email FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    if (!rows.length) {
      // don't reveal whether email exists
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }
    const user = rows[0];
    // create a one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    const id = uuidv4();
    const now = new Date();
    await conn.query('INSERT INTO password_resets (id,user_id,token_hash,expiresAt,used,createdAt) VALUES (?,?,?,?,?,?)', [id, user.id, tokenHash, expiresAt, 0, now]);
    const resetUrl = `${process.env.FRONTEND_URL || ''}/newpassword?token=${rawToken}`;

    // If SMTP settings are provided, attempt to send email. Otherwise fall back to dev behavior.
    const smtpHost = process.env.SMTP_HOST || '';
    const smtpPort = parseInt(process.env.SMTP_PORT || '0', 10) || 0;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const fromEmail = process.env.FROM_EMAIL || `no-reply@${req.hostname || 'localhost'}`;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false }
        });
        const mail = {
          from: fromEmail,
          to: user.email,
          subject: 'Password reset for PC Planner',
          text: `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
          html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`
        };
        await transporter.sendMail(mail);
        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      } catch (mailErr) {
        console.error('failed to send reset email', mailErr && mailErr.message ? mailErr.message : mailErr);
        // Fall through to dev behavior below if in development, otherwise still return generic message
      }
    }

    // In development return the reset link for testing
    if ((process.env.NODE_ENV || 'development') === 'development') {
      return res.json({ message: 'reset link created (dev)', resetUrl });
    }
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('forgot-password error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'server error' });
  } finally { conn.release(); }
});

// Password reset: accept token and set new password
app.post(`${API_PREFIX}/auth/reset`, async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'token and password required' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'password too short' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,user_id,expiresAt,used FROM password_resets WHERE token_hash = ? LIMIT 1', [tokenHash]);
    if (!rows.length) return res.status(400).json({ error: 'invalid or expired token' });
    const row = rows[0];
    if (row.used) return res.status(400).json({ error: 'token already used' });
    const expiresAt = new Date(row.expiresAt);
    if (expiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'token expired' });

    // Update user password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    await conn.query('UPDATE users SET salt=?, hash=? WHERE id=?', [salt, hash, row.user_id]);
    // mark token used
    await conn.query('UPDATE password_resets SET used=1 WHERE id=?', [row.id]);
    return res.json({ message: 'password updated' });
  } catch (err) {
    console.error('reset password error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'server error' });
  } finally { conn.release(); }
});

// Firebase authentication sync endpoint
app.post(`${API_PREFIX}/auth/firebase`, async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body || {};
  if (!uid || !email) return res.status(400).json({ error: 'uid and email required' });
  
  const conn = await pool.getConnection();
  try {
    // Check if user exists by email
    const [rows] = await conn.query('SELECT id,email,username,profile_picture FROM users WHERE email = ?', [email.toLowerCase()]);
    
    let user;
    if (rows.length) {
      // User exists, update Firebase UID if needed
      user = rows[0];
      await conn.query('UPDATE users SET firebase_uid = ? WHERE id = ?', [uid, user.id]);
    } else {
      // Create new user
      const id = uuidv4();
      const createdAt = new Date();
      await conn.query(
        'INSERT INTO users (id,email,username,firebase_uid,profile_picture,salt,hash,createdAt) VALUES (?,?,?,?,?,?,?,?)',
        [id, email.toLowerCase(), displayName || null, uid, photoURL || null, '', '', createdAt]
      );
      user = { id, email: email.toLowerCase(), username: displayName, profile_picture: photoURL, createdAt };
    }
    
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (err) {
    console.error('firebase auth sync error', err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

// User profile endpoints
app.get(`${API_PREFIX}/users/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  if (userId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
  
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id,email,username,profile_picture FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user not found' });
    const user = rows[0];
    return res.json({ 
      id: user.id, 
      email: user.email, 
      full_name: user.username, 
      username: user.username,
      profile_picture: user.profile_picture 
    });
  } catch (err) {
    console.error('get user error', err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

app.put(`${API_PREFIX}/users/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  if (userId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
  
  const { full_name } = req.body || {};
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  
  const conn = await pool.getConnection();
  try {
    await conn.query('UPDATE users SET username = ? WHERE id = ?', [full_name, userId]);
    const [rows] = await conn.query('SELECT profile_picture FROM users WHERE id = ?', [userId]);
    const profile_picture = rows.length ? rows[0].profile_picture : null;
    return res.json({ id: userId, full_name, username: full_name, profile_picture });
  } catch (err) {
    console.error('update user error', err);
    return res.status(500).json({ error: 'db error' });
  } finally {
    conn.release();
  }
});

// Test endpoint for file upload
app.post(`${API_PREFIX}/test-upload`, upload.single('profilePicture'), (req, res) => {
  console.log('Test upload received:', req.file);
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }
  res.json({ message: 'Test upload successful', file: req.file });
});

// Profile picture upload endpoint
app.post(`${API_PREFIX}/users/:id/profile-picture`, (req, res) => {
  console.log('Profile picture upload attempt for user:', req.params.id);
  
  // Handle multer upload
  upload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    
    console.log('File received:', req.file);
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    if (userId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'no file uploaded' });
    }
  
    const conn = await pool.getConnection();
    try {
      // Get old profile picture to delete it
      const [oldRows] = await conn.query('SELECT profile_picture FROM users WHERE id = ?', [userId]);
      const oldPicture = oldRows.length ? oldRows[0].profile_picture : null;
      
      // Update database with new profile picture path
      const profilePicturePath = `/uploads/${req.file.filename}`;
      await conn.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, userId]);
      
      // Delete old profile picture file if it exists
      if (oldPicture && oldPicture.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, oldPicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      console.log('Profile picture saved successfully:', profilePicturePath);
      return res.json({ 
        message: 'Profile picture updated successfully',
        profile_picture: profilePicturePath
      });
    } catch (err) {
      console.error('profile picture upload error', err);
      // Delete uploaded file if database update failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: 'database error: ' + err.message });
    } finally {
      conn.release();
    }
  });
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
    case: 'pc_case',
    keyboard: 'keyboard',
    mouse: 'mouse',
    headset: 'headset',
    monitor: 'monitor'
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

// ================= Community Builds Endpoints =================

// List community builds (simple pagination)
app.get(`${API_PREFIX}/community/builds`, async (req, res) => {
  const { offset = 0, limit = 50 } = req.query;
  const off = Math.max(0, parseInt(offset, 10) || 0);
  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT b.id,b.user_id,b.title,b.description,b.total_price,b.up_votes,b.down_votes,b.createdAt,b.updatedAt,b.parts_json,u.username
       FROM community_builds b
       LEFT JOIN users u ON u.id=b.user_id
       ORDER BY b.createdAt DESC LIMIT ? OFFSET ?`,
      [lim, off]
    );
    const mapped = rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      username: r.username || null,
      title: r.title,
      description: r.description,
      total_price: r.total_price,
      up_votes: r.up_votes||0,
      down_votes: r.down_votes||0,
      score: (r.up_votes||0) - (r.down_votes||0),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      parts: safeParse(r.parts_json, {})
    }));
    res.json(mapped);
  } catch (err) {
    console.error('community list error', err.message||err);
    res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Create community build
app.post(`${API_PREFIX}/community/builds`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { title, description, parts, total_price } = req.body || {};
  if (!title || !parts) return res.status(400).json({ error: 'title and parts required' });
  const id = uuidv4();
  const now = new Date();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO community_builds (id,user_id,title,description,parts_json,total_price,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)',
      [id, userId, title, description || '', JSON.stringify(parts), total_price || 0, now, now]
    );
    res.status(201).json({ id, title });
  } catch (err) {
    console.error('community create error', err.message||err);
    res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Get build detail with comments
app.get(`${API_PREFIX}/community/builds/:id`, async (req, res) => {
  const { id } = req.params;
  const userId = getUserIdFromRequest(req); // Optional; used to return user_vote
  const conn = await pool.getConnection();
  try {
  const [rows] = await conn.query('SELECT b.*, u.username FROM community_builds b LEFT JOIN users u ON u.id=b.user_id WHERE b.id=? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    const build = rows[0];
    const [comments] = await conn.query('SELECT c.id,c.comment_text,c.user_id,c.createdAt,u.username,u.email FROM community_build_comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.build_id=? ORDER BY c.createdAt ASC LIMIT 500', [id]);
    let user_vote = null;
    if (userId) {
      const [voteRows] = await conn.query('SELECT direction FROM community_build_votes WHERE build_id=? AND user_id=? LIMIT 1', [id, userId]);
      if (voteRows.length) user_vote = voteRows[0].direction;
    }
    res.json({
      id: build.id,
  user_id: build.user_id,
  username: build.username || null,
      title: build.title,
      description: build.description,
      total_price: build.total_price,
      up_votes: build.up_votes||0,
      down_votes: build.down_votes||0,
      score: (build.up_votes||0)-(build.down_votes||0),
      createdAt: build.createdAt,
      updatedAt: build.updatedAt,
      parts: safeParse(build.parts_json, {}),
      comments: comments.map(c => ({ id: c.id, text: c.comment_text, user_id: c.user_id, username: c.username, createdAt: c.createdAt })),
      user_vote
    });
  } catch (err) {
    console.error('community detail error', err.message||err);
    res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Add comment
app.post(`${API_PREFIX}/community/builds/:id/comments`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: 'comment required' });
  if (text.length > 600) return res.status(400).json({ error: 'comment too long' });
  const conn = await pool.getConnection();
  try {
    const [exist] = await conn.query('SELECT id FROM community_builds WHERE id=? LIMIT 1', [id]);
    if (!exist.length) return res.status(404).json({ error: 'not found' });
    const cid = uuidv4();
    const now = new Date();
    await conn.query('INSERT INTO community_build_comments (id,build_id,user_id,comment_text,createdAt) VALUES (?,?,?,?,?)', [cid, id, userId, text.trim(), now]);
    res.status(201).json({ id: cid, text: text.trim(), user_id: userId, createdAt: now });
  } catch (err) {
    console.error('community comment error', err.message||err);
    res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Vote endpoint (simple, no per-user dedupe yet)
app.post(`${API_PREFIX}/community/builds/:id/vote`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const { direction } = req.body || {};
  if (!['up','down','unvote'].includes(direction)) return res.status(400).json({ error: 'invalid direction' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existBuild] = await conn.query('SELECT id, up_votes, down_votes FROM community_builds WHERE id=? LIMIT 1', [id]);
    if (!existBuild.length) { await conn.rollback(); return res.status(404).json({ error: 'not found' }); }
    const [voteRows] = await conn.query('SELECT direction FROM community_build_votes WHERE build_id=? AND user_id=? LIMIT 1', [id, userId]);
    if (direction === 'unvote') {
      if (voteRows.length) {
        const prev = voteRows[0].direction;
        const now = new Date();
        await conn.query('DELETE FROM community_build_votes WHERE build_id=? AND user_id=?', [id, userId]);
        if (prev === 'up') await conn.query('UPDATE community_builds SET up_votes=GREATEST(up_votes-1,0), updatedAt=? WHERE id=?', [now, id]);
        else await conn.query('UPDATE community_builds SET down_votes=GREATEST(down_votes-1,0), updatedAt=? WHERE id=?', [now, id]);
      }
    } else if (!voteRows.length) {
      // First vote
      const now = new Date();
      await conn.query('INSERT INTO community_build_votes (build_id,user_id,direction,createdAt,updatedAt) VALUES (?,?,?,?,?)', [id, userId, direction, now, now]);
      if (direction === 'up') await conn.query('UPDATE community_builds SET up_votes=up_votes+1, updatedAt=? WHERE id=?', [now, id]);
      else await conn.query('UPDATE community_builds SET down_votes=down_votes+1, updatedAt=? WHERE id=?', [now, id]);
    } else {
      const prev = voteRows[0].direction;
      if (prev !== direction) {
        const now = new Date();
        await conn.query('UPDATE community_build_votes SET direction=?, updatedAt=? WHERE build_id=? AND user_id=?', [direction, now, id, userId]);
        if (direction === 'up') {
          // switched from down -> up
            await conn.query('UPDATE community_builds SET up_votes=up_votes+1, down_votes=GREATEST(down_votes-1,0), updatedAt=? WHERE id=?', [now, id]);
        } else if (direction === 'down') {
            await conn.query('UPDATE community_builds SET down_votes=down_votes+1, up_votes=GREATEST(up_votes-1,0), updatedAt=? WHERE id=?', [now, id]);
        }
      }
    }
    const [after] = await conn.query('SELECT up_votes,down_votes FROM community_builds WHERE id=? LIMIT 1', [id]);
    await conn.commit();
    const row = after[0];
    // Determine current user vote
    let currentVote = null;
    if (direction === 'unvote') currentVote = null; else if (direction === 'up' || direction === 'down') currentVote = direction;
    if (direction !== 'unvote' && voteRows.length && voteRows[0].direction === direction) currentVote = direction; // unchanged
    res.json({ up_votes: row.up_votes||0, down_votes: row.down_votes||0, score: (row.up_votes||0)-(row.down_votes||0), user_vote: currentVote });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error('community vote error', err.message||err);
    res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});

// Delete community build (owner only)
app.delete(`${API_PREFIX}/community/builds/:id`, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT user_id FROM community_builds WHERE id=? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    if (rows[0].user_id !== userId) return res.status(403).json({ error: 'forbidden' });
    await conn.query('DELETE FROM community_builds WHERE id=?', [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('community delete error', err.message||err);
    return res.status(500).json({ error: 'db error' });
  } finally { conn.release(); }
});
