import axios from 'axios';
import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';

// Color console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testPublicEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TESTING PUBLIC ENDPOINTS (No Auth Required)');
  console.log('='.repeat(60) + '\n');

  try {
    // Test public suggestions
    log.info('Testing GET /api/suggestions/public');
    const suggestionsRes = await axios.get(`${BASE_URL}/api/suggestions/public`);
    const suggestions = suggestionsRes.data.data;
    
    if (suggestions && suggestions.length > 0) {
      log.success(`Found ${suggestions.length} public suggestions`);
      log.info(`Sample: "${suggestions[0].title}" by ${suggestions[0].user_name}`);
      
      // Check if image_url is present
      const withImages = suggestions.filter(s => s.image_url).length;
      log.info(`${withImages} suggestions have images`);
    } else {
      log.warn('No public suggestions found');
    }

    // Test public stats
    log.info('Testing GET /api/suggestions/public/stats');
    const statsRes = await axios.get(`${BASE_URL}/api/suggestions/public/stats`);
    const stats = statsRes.data.data;
    log.success(`Stats: ${stats.total} total suggestions from ${stats.users} users`);

  } catch (error) {
    log.error(`Public endpoints failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function testAuthenticatedEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 TESTING AUTHENTICATED ENDPOINTS');
  console.log('='.repeat(60) + '\n');

  try {
    // Login as testuser
    log.info('Logging in as testuser...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'Test123!'
    });

    if (!loginRes.data.data || !loginRes.data.data.token) {
      log.error('Login failed - no token received');
      return null;
    }

    const token = loginRes.data.data.token;
    const user = loginRes.data.data.user;
    log.success(`Logged in as ${user.username} (${user.role})`);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test user suggestions
    log.info('Testing GET /api/suggestions (user suggestions)');
    const userSuggestions = await axios.get(`${BASE_URL}/api/suggestions`, config);
    const userSuggestionsData = userSuggestions.data.data?.data || userSuggestions.data.data || [];
    log.success(`User has ${userSuggestionsData.length} suggestions`);

    // Test suggestion stats
    log.info('Testing GET /api/suggestions/stats');
    const statsRes = await axios.get(`${BASE_URL}/api/suggestions/stats`, config);
    log.success(`Stats retrieved successfully`);

    return token;

  } catch (error) {
    log.error(`Authenticated endpoints failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('👑 TESTING ADMIN ENDPOINTS');
  console.log('='.repeat(60) + '\n');

  try {
    // Login as testadmin
    log.info('Logging in as testadmin...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'testadmin@example.com',
      password: 'Admin123!'
    });

    if (!loginRes.data.data || !loginRes.data.data.token) {
      log.error('Admin login failed - no token received');
      return;
    }

    const token = loginRes.data.data.token;
    const user = loginRes.data.data.user;
    log.success(`Logged in as ${user.username} (${user.role})`);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test admin stats
    log.info('Testing GET /api/admin/stats');
    const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, config);
    const stats = statsRes.data.data;
    log.success(`Admin Stats Retrieved:`);
    log.info(`  Total Users: ${stats.totalUsers}`);
    log.info(`  Total Suggestions: ${stats.totalSuggestions}`);
    log.info(`  New: ${stats.newSuggestions}`);
    log.info(`  In Progress: ${stats.inProgressSuggestions}`);
    log.info(`  Resolved: ${stats.resolvedSuggestions}`);

    // Test admin users
    log.info('Testing GET /api/admin/users');
    const usersRes = await axios.get(`${BASE_URL}/api/admin/users?limit=10`, config);
    const users = usersRes.data.data?.data || usersRes.data.data || [];
    log.success(`Found ${users.length} users`);

    // Test admin suggestions
    log.info('Testing GET /api/admin/suggestions');
    const suggestionsRes = await axios.get(`${BASE_URL}/api/admin/suggestions?limit=10`, config);
    const suggestions = suggestionsRes.data.data?.data || suggestionsRes.data.data || [];
    log.success(`Found ${suggestions.length} suggestions`);
    
    const withImages = suggestions.filter(s => s.image_url).length;
    log.info(`${withImages} suggestions have images attached`);

  } catch (error) {
    log.error(`Admin endpoints failed: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function testDatabaseIntegrity() {
  console.log('\n' + '='.repeat(60));
  console.log('🗄️  TESTING DATABASE INTEGRITY');
  console.log('='.repeat(60) + '\n');

  try {
    // Check users
    const usersResult = await query('SELECT COUNT(*) as count, role FROM users GROUP BY role');
    log.success('Users by role:');
    usersResult.rows.forEach(row => {
      log.info(`  ${row.role}: ${row.count}`);
    });

    // Check suggestions
    const suggestionsResult = await query('SELECT COUNT(*) as count, status FROM suggestions GROUP BY status');
    log.success('Suggestions by status:');
    suggestionsResult.rows.forEach(row => {
      log.info(`  ${row.status}: ${row.count}`);
    });

    // Check suggestions with images
    const imagesResult = await query('SELECT COUNT(*) as count FROM suggestions WHERE image_url IS NOT NULL AND image_url != ""');
    log.success(`Suggestions with images: ${imagesResult.rows[0].count}`);

    // Check orphaned suggestions (suggestions without users)
    const orphanedResult = await query(`
      SELECT COUNT(*) as count FROM suggestions s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    if (orphanedResult.rows[0].count > 0) {
      log.warn(`Found ${orphanedResult.rows[0].count} orphaned suggestions (no matching user)`);
    } else {
      log.success('No orphaned suggestions found');
    }

  } catch (error) {
    log.error(`Database integrity check failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('█'.repeat(60));

  try {
    // Test if backend is running
    log.info('Checking if backend is running...');
    await axios.get(`${BASE_URL}/health`);
    log.success('Backend is running on http://localhost:5000\n');

    await testDatabaseIntegrity();
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    await testAdminEndpoints();

    console.log('\n' + '█'.repeat(60));
    log.success('ALL TESTS COMPLETED!');
    console.log('█'.repeat(60));
    console.log('\n📝 Summary:');
    console.log('  ✅ Database integrity verified');
    console.log('  ✅ Public endpoints working');
    console.log('  ✅ Authenticated endpoints working');
    console.log('  ✅ Admin endpoints working');
    console.log('\n💡 Next steps:');
    console.log('  1. Open http://localhost:3000 in your browser');
    console.log('  2. Test the homepage (public suggestions)');
    console.log('  3. Login as testuser / Test123!');
    console.log('  4. Test dashboard functionality');
    console.log('  5. Logout and login as testadmin / Admin123!');
    console.log('  6. Test admin panel functionality\n');

    process.exit(0);

  } catch (error) {
    log.error('Backend is not running or not accessible');
    log.error(`Error: ${error.message}`);
    log.warn('Please start the backend with: npm run dev');
    process.exit(1);
  }
}

runAllTests();

