#!/usr/bin/env node
import { query } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('🔧 Creating admin user...\n');

    const adminEmail = 'admin@happytweet.com';
    const adminPassword = 'Admin@123';
    const adminUsername = 'admin';
    const adminFullName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [adminEmail, adminUsername]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Username: ${adminUsername}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('\n⚠️  Please change the password after first login!\n');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, 'admin', 1)`,
      [adminUsername, adminEmail, passwordHash, adminFullName]
    );

    console.log('✅ Admin user created successfully!\n');
    console.log('📝 Admin Account Details:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Full Name: ${adminFullName}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 IMPORTANT SECURITY REMINDERS:');
    console.log('   1. Change the password immediately after first login');
    console.log('   2. Use a strong password (min 8 characters recommended)');
    console.log('   3. Keep credentials secure and do not share');
    console.log('   4. Enable 2FA if available in future updates\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

createAdminUser();