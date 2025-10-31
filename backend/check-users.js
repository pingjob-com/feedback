import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    const result = await query('SELECT username, email, role FROM users');
    console.log('\n📋 All Users in Database:\n');
    console.log('═══════════════════════════════════════════════════════════');
    result.rows.forEach(u => {
      const roleLabel = u.role === 'admin' ? '🔐 ADMIN' : '👤 USER';
      console.log(`   ${roleLabel} | ${u.username.padEnd(20)} | ${u.email}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const adminCount = result.rows.filter(u => u.role === 'admin').length;
    console.log(`✅ Total Users: ${result.rows.length}`);
    console.log(`🔐 Admin Users: ${adminCount}`);
    console.log(`👤 Regular Users: ${result.rows.length - adminCount}\n`);

    const nahidulUser = result.rows.find(u => u.username === 'nahidul');
    if (nahidulUser) {
      if (nahidulUser.role === 'admin') {
        console.log('✅ User "nahidul" HAS admin role - Admin panel should work!\n');
      } else {
        console.log('❌ User "nahidul" is NOT admin - Need to make admin first!');
        console.log('   Run: node scripts/makeUserAdmin.js nahidul\n');
      }
    } else {
      console.log('⚠️  User "nahidul" not found in database');
      console.log('   Please create this user first\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

