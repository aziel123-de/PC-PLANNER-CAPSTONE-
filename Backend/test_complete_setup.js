// Complete test for profile picture functionality
require('dotenv').config();
const pool = require('./mysql');
const fs = require('fs');
const path = require('path');

async function testCompleteSetup() {
  console.log('🧪 Testing Profile Picture Setup...\n');
  
  const conn = await pool.getConnection();
  try {
    // 1. Check database structure
    console.log('1️⃣ Checking database structure...');
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);
    
    const profilePictureColumn = columns.find(col => col.COLUMN_NAME === 'profile_picture');
    if (profilePictureColumn) {
      console.log('✅ profile_picture column exists:', profilePictureColumn);
    } else {
      console.log('❌ profile_picture column missing');
      return;
    }
    
    // 2. Check uploads directory
    console.log('\n2️⃣ Checking uploads directory...');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ uploads directory exists:', uploadsDir);
      const stats = fs.statSync(uploadsDir);
      console.log('   Directory permissions:', stats.mode.toString(8));
    } else {
      console.log('❌ uploads directory missing');
      return;
    }
    
    // 3. Check if multer is installed
    console.log('\n3️⃣ Checking dependencies...');
    try {
      require('multer');
      console.log('✅ multer is installed');
    } catch (e) {
      console.log('❌ multer is not installed');
      return;
    }
    
    // 4. Check sample users
    console.log('\n4️⃣ Checking sample users...');
    const [users] = await conn.query('SELECT id, email, username, profile_picture FROM users LIMIT 3');
    if (users.length > 0) {
      console.log('✅ Found users in database:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.username || 'No username'})`);
        console.log(`      Profile Picture: ${user.profile_picture || 'None'}`);
      });
    } else {
      console.log('⚠️  No users found in database');
    }
    
    console.log('\n🎉 Setup verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: node index.js');
    console.log('   2. Login to your account');
    console.log('   3. Go to Settings and upload a profile picture');
    console.log('   4. Logout and login again - your picture should persist!');
    
  } catch (err) {
    console.error('❌ Error during setup verification:', err.message);
  } finally {
    conn.release();
  }
}

testCompleteSetup().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});