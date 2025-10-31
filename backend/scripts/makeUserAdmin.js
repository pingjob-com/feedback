#!/usr/bin/env node
import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const makeUserAdmin = async (username) => {
  try {
    console.log(`🔧 Making user '${username}' an admin...\n`);

    // Check if user exists
    const existingUser = await query(
      'SELECT id, username, email, role FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.rows.length === 0) {
      console.log(`❌ User '${username}' not found!`);
      console.log('   Please make sure the username is correct.\n');
      process.exit(1);
    }

    const user = existingUser.rows[0];

    if (user.role === 'admin') {
      console.log(`✅ User '${username}' is already an admin!`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}\n`);
      process.exit(0);
    }

    // Update user role to admin
    await query(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
      ['admin', username]
    );

    console.log('✅ User successfully promoted to admin!\n');
    console.log('📝 Updated Account Details:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Role:     user → admin`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 The user can now access admin features!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

const username = process.argv[2] || 'nahidul';
makeUserAdmin(username);

