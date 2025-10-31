import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testQuery() {
  try {
    console.log('Testing SQL query with LIMIT and OFFSET...\n');

    const parsedLimit = 6;
    const offset = 0;
    const params = [];

    console.log('Parameters:', params);
    console.log('LIMIT:', parsedLimit);
    console.log('OFFSET:', offset);
    console.log('Final params array:', [...params, parsedLimit, offset]);
    console.log();

    const result = await query(
      `SELECT s.id, s.title, s.description, s.image_url, s.category, s.priority, s.status,
              u.username, u.full_name as user_name, u.email,
              s.created_at, s.updated_at
       FROM suggestions s
       JOIN users u ON s.user_id = u.id
       WHERE 1=1
       ORDER BY s.created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    console.log('✅ Query successful!');
    console.log(`Found ${result.rows.length} suggestions\n`);

    if (result.rows.length > 0) {
      console.log('Sample result:');
      console.log(`  Title: ${result.rows[0].title}`);
      console.log(`  Author: ${result.rows[0].user_name}`);
      console.log(`  Image URL: ${result.rows[0].image_url || 'none'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testQuery();

