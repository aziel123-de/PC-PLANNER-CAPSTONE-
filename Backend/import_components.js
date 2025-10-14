const pool = require('./mysql');
const fs = require('fs');
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
  const dataFile = path.join(__dirname, 'migrations', 'components_export.json');
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    // Insert CPUs
    if (Array.isArray(data.cpu)) {
      console.log('Inserting CPUs...');
      const cols = ['id','name','price','socket','cores','threads','base_clock_ghz','boost_clock_ghz','tdp','max_tdp','ram_type','ram_max','cache_mb','raw'];
      const rows = data.cpu.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'cpu', cols, rows);
      console.log(`Inserted ${rows.length} CPUs`);
    }

    // Insert GPUs
    if (Array.isArray(data.gpu)) {
      console.log('Inserting GPUs...');
      const cols = ['id','name','price','vram_gb','power_draw_w','boost_freq_mhz','cuda_cores','compute_units','xe_cores','raw'];
      const rows = data.gpu.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'gpu', cols, rows);
      console.log(`Inserted ${rows.length} GPUs`);
    }

    // Insert PSUs
    if (Array.isArray(data.psu)) {
      console.log('Inserting PSUs...');
      const cols = ['id','name','price','wattage','rating','modular','raw'];
      const rows = data.psu.map(r => ({...r, raw: JSON.stringify(r.raw)}));
      await insertRows(conn, 'psu', cols, rows);
      console.log(`Inserted ${rows.length} PSUs`);
    }

    await conn.query('COMMIT');
    console.log('All components imported successfully!');
  } catch (err) {
    console.error('Import failed:', err.message);
    try { await conn.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
  } finally {
    conn.release();
    pool.end();
  }
}

run();