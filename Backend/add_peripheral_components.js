const pool = require('./mysql');

async function addPeripheralComponents() {
  const conn = await pool.getConnection();
  try {
    // Sample monitors
    await conn.query(`INSERT IGNORE INTO monitor (id, name, type, price, size_inches, resolution, refresh_rate, panel_type, connection) VALUES
      (1, 'ASUS VG248QE 24" Gaming Monitor', 'Gaming', 199, 24.0, '1920x1080', 144, 'TN', 'DVI-D, HDMI, DisplayPort'),
      (2, 'Dell UltraSharp U2720Q 27" 4K Monitor', 'Professional', 549, 27.0, '3840x2160', 60, 'IPS', 'USB-C, HDMI, DisplayPort'),
      (3, 'LG 34WN80C-B 34" Ultrawide Monitor', 'Ultrawide', 449, 34.0, '3440x1440', 60, 'IPS', 'USB-C, HDMI, DisplayPort')`);

    // Sample keyboards
    await conn.query(`INSERT IGNORE INTO keyboard (id, name, price, type, connection, layout, backlight) VALUES
      (1, 'Corsair K95 RGB Platinum XT', 199, 'Mechanical', 'USB', 'Full-size', 'RGB'),
      (2, 'Logitech MX Keys', 99, 'Membrane', 'Wireless', 'Full-size', 'White Backlight'),
      (3, 'Razer BlackWidow V3 Tenkeyless', 139, 'Mechanical', 'USB', 'TKL', 'RGB')`);

    // Sample mice
    await conn.query(`INSERT IGNORE INTO mouse (id, name, price, type, connection, dpi, buttons) VALUES
      (1, 'Logitech G502 HERO', 79, 'Gaming', 'USB', 25600, 11),
      (2, 'Razer DeathAdder V3', 89, 'Gaming', 'USB', 30000, 8),
      (3, 'Logitech MX Master 3S', 99, 'Productivity', 'Wireless', 8000, 7)`);

    // Sample headsets
    await conn.query(`INSERT IGNORE INTO headset (id, name, price, type, connection, frequency_response, microphone) VALUES
      (1, 'SteelSeries Arctis 7P', 149, 'Gaming', 'Wireless', '20Hz-20kHz', 'Retractable'),
      (2, 'HyperX Cloud II', 99, 'Gaming', 'USB/3.5mm', '15Hz-25kHz', 'Detachable'),
      (3, 'Audio-Technica ATH-M50xBT2', 199, 'Studio', 'Wireless', '15Hz-28kHz', 'Built-in')`);

    console.log('Peripheral components added successfully!');
  } catch (err) {
    console.error('Error adding peripheral components:', err);
  } finally {
    conn.release();
  }
}

addPeripheralComponents().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});