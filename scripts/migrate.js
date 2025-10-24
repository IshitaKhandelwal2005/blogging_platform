const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.log('Please set DATABASE_URL in your .env or .env.local file');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('Running migration: Add image_url column to posts table...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../drizzle/0001_add_image_url.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
