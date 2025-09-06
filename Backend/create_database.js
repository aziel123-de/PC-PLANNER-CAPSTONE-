const mysql = require('mysql2/promise');
require('dotenv').config();

(async function(){
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  });
  try{
    const db = process.env.DB_NAME || 'pcbuild';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
    console.log('Database ensured:', db);
  }catch(e){
    console.error('create db error', e.message || e);
    process.exitCode = 1;
  } finally{
    await connection.end();
  }
})();
