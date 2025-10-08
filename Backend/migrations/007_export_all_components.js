const pool = require('../mysql');
const fs = require('fs');
const path = require('path');

async function exportComponents() {
  const conn = await pool.getConnection();
  try {
    const tables = ['cpu', 'gpu', 'psu', 'mobo', 'ram', 'storage', 'm2', 'pc_case', 'keyboard', 'mouse', 'headset', 'monitor'];
    const result = {};

    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      const [rows] = await conn.query(`SELECT * FROM \`${table}\` ORDER BY id ASC`);
      result[table] = rows;
      console.log(`  Found ${rows.length} rows`);
    }

    const outputPath = path.join(__dirname, 'components_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nExport complete! Saved to: ${outputPath}`);
    console.log('\nSummary:');
    Object.keys(result).forEach(key => {
      console.log(`  ${key}: ${result[key].length} items`);
    });
  } catch (err) {
    console.error('Export failed:', err.message);
  } finally {
    conn.release();
    pool.end();
  }
}

exportComponents();
