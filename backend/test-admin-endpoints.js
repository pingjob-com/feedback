// Quick test script to verify admin endpoints
import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Endpoints...\n');

  try {
    // Test 1: Get Users
    console.log('1️⃣ Testing getUsers query...');
    const users = await query('SELECT id, username, email, role FROM users LIMIT 5');
    console.log(`✅ Found ${users.rows.length} users`);
    console.log(`   Sample: ${users.rows[0]?.username} (${users.rows[0]?.role})\n`);

    // Test 2: Get Suggestions
    console.log('2️⃣ Testing getSuggestions query...');
    const suggestions = await query(`
      SELECT s.id, s.title, s.status, u.username, u.email
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LIMIT 5
    `);
    console.log(`✅ Found ${suggestions.rows.length} suggestions`);
    if (suggestions.rows.length > 0) {
      console.log(`   Sample: "${suggestions.rows[0]?.title}" by ${suggestions.rows[0]?.username}\n`);
    }

    // Test 3: Get Stats
    console.log('3️⃣ Testing getAdminStats queries...');
    const totalUsers = await query('SELECT COUNT(*) as count FROM users');
    const totalSuggestions = await query('SELECT COUNT(*) as count FROM suggestions');
    const newSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "new"');
    const inProgressSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "in_progress"');
    const resolvedSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "resolved"');

    console.log('✅ Stats calculated successfully:');
    console.log(`   Total Users: ${totalUsers.rows[0].count}`);
    console.log(`   Total Suggestions: ${totalSuggestions.rows[0].count}`);
    console.log(`   New: ${newSuggestions.rows[0].count}`);
    console.log(`   In Progress: ${inProgressSuggestions.rows[0].count}`);
    console.log(`   Resolved: ${resolvedSuggestions.rows[0].count}\n`);

    console.log('🎉 All database queries work correctly!');
    console.log('✅ Admin endpoints should be functional\n');

    console.log('📝 If admin panel still shows error, check:');
    console.log('   1. Backend is running on http://localhost:5000');
    console.log('   2. User is logged in with admin role');
    console.log('   3. Token is valid in localStorage');
    console.log('   4. CORS is properly configured');
    console.log('   5. Check browser console for detailed errors\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('   - Database connection failed');
    console.error('   - Tables not created');
    console.error('   - Invalid DATABASE_URL in .env');
    process.exit(1);
  }
}

testAdminEndpoints();

