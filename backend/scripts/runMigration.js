import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const parseConnectionString = (connectionString) => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: parseInt(url.port) || 3306,
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

async function runMigration() {
  const pool = mysql.createPool(parseConnectionString(process.env.DATABASE_URL));
  
  try {
    const sql = readFileSync('src/migrations/add_image_url_to_suggestions.sql', 'utf8');
    await pool.execute(sql);
    console.log('✅ Migration executed successfully: image_url column added');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists - migration already applied');
    } else {
      console.error('❌ Migration error:', error.message);
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();

