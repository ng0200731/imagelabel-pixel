const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

console.log('Starting ownership migration...');

try {
    // Check if images table has ownership column
    const imagesTableInfo = db.prepare("PRAGMA table_info(images)").all();
    const imagesHasOwnership = imagesTableInfo.some(col => col.name === 'ownership');
    
    if (!imagesHasOwnership) {
        console.log('Adding ownership column to images table...');
        db.exec("ALTER TABLE images ADD COLUMN ownership TEXT DEFAULT 'eric.brilliant@gmail.com'");
        console.log('✅ Added ownership column to images table');
    }
    
    // Update images without ownership
    const imagesUpdateResult = db.prepare(`
        UPDATE images 
        SET ownership = 'eric.brilliant@gmail.com' 
        WHERE ownership IS NULL OR ownership = ''
    `).run();
    console.log(`✅ Updated ${imagesUpdateResult.changes} image(s) with ownership`);
    
    // Check if projects table has ownership column
    const projectsTableInfo = db.prepare("PRAGMA table_info(projects)").all();
    const projectsHasOwnership = projectsTableInfo.some(col => col.name === 'ownership');
    
    if (!projectsHasOwnership) {
        console.log('Adding ownership column to projects table...');
        db.exec("ALTER TABLE projects ADD COLUMN ownership TEXT");
        console.log('✅ Added ownership column to projects table');
    }
    
    // Update projects without ownership
    const projectsUpdateResult = db.prepare(`
        UPDATE projects 
        SET ownership = 'eric.brilliant@gmail.com' 
        WHERE ownership IS NULL OR ownership = ''
    `).run();
    console.log(`✅ Updated ${projectsUpdateResult.changes} project(s) with ownership`);
    
    // Verify migration
    const imagesWithOwnership = db.prepare("SELECT COUNT(*) as count FROM images WHERE ownership IS NOT NULL AND ownership != ''").get();
    const totalImages = db.prepare("SELECT COUNT(*) as count FROM images").get();
    console.log(`\n✅ Images with ownership: ${imagesWithOwnership.count}/${totalImages.count}`);
    
    const projectsWithOwnership = db.prepare("SELECT COUNT(*) as count FROM projects WHERE ownership IS NOT NULL AND ownership != ''").get();
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get();
    console.log(`✅ Projects with ownership: ${projectsWithOwnership.count}/${totalProjects.count}`);
    
    console.log('\n✅ Ownership migration completed successfully!');
} catch (err) {
    console.error('❌ Error during ownership migration:', err);
    process.exit(1);
} finally {
    db.close();
}

