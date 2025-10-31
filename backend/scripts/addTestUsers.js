import { query } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testUsers = [
  {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test123!',
    fullName: 'Test User',
    role: 'user'
  },
  {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'Test123!',
    fullName: 'John Doe',
    role: 'user'
  },
  {
    username: 'janedoe',
    email: 'jane.doe@example.com',
    password: 'Test123!',
    fullName: 'Jane Doe',
    role: 'user'
  },
  {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'Admin123!',
    fullName: 'Test Admin',
    role: 'admin'
  },
  {
    username: 'alice',
    email: 'alice@example.com',
    password: 'Test123!',
    fullName: 'Alice Johnson',
    role: 'user'
  },
  {
    username: 'bob',
    email: 'bob@example.com',
    password: 'Test123!',
    fullName: 'Bob Smith',
    role: 'user'
  }
];

async function addTestUsers() {
  try {
    console.log('🚀 Adding test users...\n');

    let added = 0;
    let skipped = 0;

    for (const user of testUsers) {
      // Check if user already exists
      const checkResult = await query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [user.username, user.email]
      );

      if (checkResult.rows.length > 0) {
        console.log(`⏭️  Skipping: ${user.username} (already exists)`);
        skipped++;
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Add user
      await query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        [
          user.username,
          user.email,
          passwordHash,
          user.fullName,
          user.role
        ]
      );

      added++;
      const roleEmoji = user.role === 'admin' ? '👑' : '👤';
      console.log(`✅ Added: ${roleEmoji} ${user.username} (${user.email}) - Role: ${user.role.toUpperCase()}`);
    }

    console.log(`\n🎉 Successfully added ${added} test user(s)!`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped ${skipped} existing user(s)`);
    }
    
    console.log('\n📋 Test Account Credentials:');
    console.log('════════════════════════════════════════════════════════');
    console.log('Regular Users:');
    console.log('  Username: testuser  | Password: Test123!');
    console.log('  Username: johndoe   | Password: Test123!');
    console.log('  Username: janedoe   | Password: Test123!');
    console.log('  Username: alice     | Password: Test123!');
    console.log('  Username: bob       | Password: Test123!');
    console.log('\nAdmin Account:');
    console.log('  Username: testadmin | Password: Admin123!');
    console.log('════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test users:', error.message);
    process.exit(1);
  }
}

addTestUsers();

