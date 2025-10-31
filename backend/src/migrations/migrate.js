import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  let connection;
  try {
    console.log('Starting database migrations...');
    console.log('Database:', process.env.DATABASE_URL);
    
    // Get connection
    connection = await pool.getConnection();
    console.log('✓ Connected to database');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split and execute statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_INDEX') {
            console.log('⚠ Skipped (already exists):', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('\n✓ Database migrations completed successfully!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration error:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
};

runMigrations();