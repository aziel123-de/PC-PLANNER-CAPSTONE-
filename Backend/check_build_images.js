// Check build images in database
const pool = require('./mysql');

async function checkBuildImages() {
  const conn = await pool.getConnection();
  try {
    // Check column type
    const [columns] = await conn.query("SHOW COLUMNS FROM community_builds LIKE 'build_image'");
    console.log('build_image column info:', columns[0]);
    
    // Check existing build images
    const [builds] = await conn.query("SELECT id, title, build_image FROM community_builds WHERE build_image IS NOT NULL LIMIT 5");
    console.log(`\nFound ${builds.length} builds with images:`);
    
    builds.forEach((build, i) => {
      const img = build.build_image;
      if (img) {
        const isBase64 = img.startsWith('data:');
        const length = img.length;
        const preview = img.substring(0, 100);
        console.log(`\nBuild ${i + 1}: ${build.title}`);
        console.log(`  ID: ${build.id}`);
        console.log(`  Image type: ${isBase64 ? 'Base64' : 'Other'}`);
        console.log(`  Length: ${length} characters`);
        console.log(`  Preview: ${preview}${length > 100 ? '...' : ''}`);
        
        if (isBase64 && length < 1000) {
          console.log(`  ⚠️  WARNING: Base64 image seems too short (${length} chars)`);
        }
      }
    });
    
  } catch (error) {
    console.error('Error checking build images:', error);
  } finally {
    conn.release();
  }
}

checkBuildImages().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});