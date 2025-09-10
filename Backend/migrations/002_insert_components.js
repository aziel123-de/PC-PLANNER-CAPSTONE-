const pool = require('../mysql');
const path = require('path');

async function insertRows(conn, table, columns, rows, batchSize = 100) {
  if (!rows || rows.length === 0) return 0;
  const colList = columns.map(c => `\`${c}\``).join(', ');
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
    const values = [];
    batch.forEach(r => {
      columns.forEach(col => values.push(r[col] === undefined ? null : r[col]));
    });
    const sql = `INSERT INTO \`${table}\` (${colList}) VALUES ${placeholders}`;
    await conn.query(sql, values);
    inserted += batch.length;
  }
  return inserted;
}

async function run() {
  // require the normalized rows from the frontend file
  // use a path relative to project root
  const dbFile = path.join(__dirname, '..', '..', 'src', 'PCBuilder', 'PCBuilding', 'PCcomponentsDatabase.js');
  // require via esm-interop: dynamic import of the compiled CommonJS file
  let data;
  try {
    data = require(dbFile);
  } catch (err) {
    console.error('Failed to require PCcomponentsDatabase.js:', err.message);
    process.exit(1);
  }

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    // Insert CPUs
    if (Array.isArray(data.cpuRows)) {
      console.log('Inserting cpuRows...');
      const cols = ['id','name','price','socket','cores','threads','base_clock_ghz','boost_clock_ghz','tdp','max_tdp','ram_type','ram_max','cache_mb','raw'];
      const rows = data.cpuRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'cpu', cols, rows);
    }

    // Insert GPUs
    if (Array.isArray(data.gpuRows)) {
      console.log('Inserting gpuRows...');
      const cols = ['id','name','price','vram_gb','power_draw_w','boost_freq_mhz','cuda_cores','compute_units','xe_cores','raw'];
      const rows = data.gpuRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'gpu', cols, rows);
    }

    // Insert PSUs
    if (Array.isArray(data.psuRows)) {
      console.log('Inserting psuRows...');
      const cols = ['id','name','price','wattage','rating','modular','raw'];
      const rows = data.psuRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'psu', cols, rows);
    }

    // Insert mobos
    if (Array.isArray(data.moboRows)) {
      console.log('Inserting moboRows...');
      const cols = ['id','name','price','socket','chipset','form_factor','ram_type','ram_slots','gpu_slots','storage_slots','m2_slots','raw'];
      const rows = data.moboRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'mobo', cols, rows);
    }

    // Insert ram
    if (Array.isArray(data.ramRows)) {
      console.log('Inserting ramRows...');
      const cols = ['id','name','price','type','frequency_mhz','capacity_gb','raw'];
      const rows = data.ramRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'ram', cols, rows);
    }

    // Insert storage
    if (Array.isArray(data.storageRows)) {
      console.log('Inserting storageRows...');
      const cols = ['id','name','price','type','interface','capacity_gb','power_w','raw'];
      const rows = data.storageRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'storage', cols, rows);
    }

    // Insert m2
    if (Array.isArray(data.m2Rows)) {
      console.log('Inserting m2Rows...');
      const cols = ['id','name','price','type','interface','capacity_gb','power_w','raw'];
      const rows = data.m2Rows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'm2', cols, rows);
    }

    // Insert cases (table name in SQL is pc_case)
    if (Array.isArray(data.caseRows)) {
      console.log('Inserting caseRows...');
      const cols = ['id','name','price','form_factor','color','raw'];
      const rows = data.caseRows.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'pc_case', cols, rows);
    }

    await conn.query('COMMIT');
    console.log('All inserts completed and committed.');
  } catch (err) {
    console.error('Insert migration failed, rolling back:', err.message);
    try { await conn.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
  } finally {
    conn.release();
    pool.end();
  }
}

run();
