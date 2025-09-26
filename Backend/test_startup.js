// Test backend startup
require('dotenv').config();

console.log('🚀 Testing backend startup...');

try {
  // Test that all required modules can be loaded
  const express = require('express');
  const multer = require('multer');
  const pool = require('./mysql');
  
  console.log('✅ All modules loaded successfully');
  
  // Test database connection
  pool.getConnection().then(conn => {
    console.log('✅ Database connection successful');
    conn.release();
    
    console.log('🎉 Backend is ready to start!');
    console.log('Run: node index.js');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
  
} catch (err) {
  console.error('❌ Module loading failed:', err.message);
  process.exit(1);
}