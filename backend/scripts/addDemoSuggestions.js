import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const demoSuggestions = [
  {
    title: 'Dark Mode Theme',
    description: 'Add a dark mode toggle to reduce eye strain during night-time usage. This would include a system-wide color scheme that works across all pages and components.',
    category: 'feature',
    priority: 'high',
    status: 'new',
    image_url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format&fit=crop'
  },
  {
    title: 'Export Data Feature',
    description: 'Allow users to export their suggestions and statistics in various formats like CSV, JSON, and PDF for better data portability and record keeping.',
    category: 'feature',
    priority: 'medium',
    status: 'in_progress',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
  },
  {
    title: 'Fix Login Page Responsiveness',
    description: 'The login page has layout issues on mobile devices below 375px width. Buttons overlap with input fields and the form becomes unusable.',
    category: 'bug',
    priority: 'high',
    status: 'in_progress',
    image_url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&auto=format&fit=crop'
  },
  {
    title: 'Add Email Notifications',
    description: 'Implement email notifications for status updates on suggestions. Users should receive an email when their suggestion is reviewed, approved, or resolved.',
    category: 'feature',
    priority: 'medium',
    status: 'new',
    image_url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop'
  },
  {
    title: 'Improve Dashboard Loading Speed',
    description: 'Dashboard takes too long to load when there are many suggestions. Consider implementing pagination, lazy loading, or caching to improve performance.',
    category: 'improvement',
    priority: 'medium',
    status: 'new',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
  },
  {
    title: 'Add Search Functionality',
    description: 'Add a search bar to quickly find specific suggestions by title, description, or category. This will greatly improve usability as the number of suggestions grows.',
    category: 'improvement',
    priority: 'high',
    status: 'resolved',
    image_url: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&auto=format&fit=crop'
  },
  {
    title: 'Mobile App Development',
    description: 'Develop native mobile applications for iOS and Android platforms to provide a better user experience on mobile devices with offline support.',
    category: 'feature',
    priority: 'low',
    status: 'new',
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop'
  },
  {
    title: 'Two-Factor Authentication',
    description: 'Add 2FA support for enhanced account security. Users should be able to enable authentication via SMS, email, or authenticator apps.',
    category: 'feature',
    priority: 'high',
    status: 'resolved',
    image_url: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&auto=format&fit=crop'
  }
];

async function addDemoSuggestions() {
  try {
    console.log('🚀 Adding demo suggestions...\n');

    // Get all non-admin users to distribute suggestions among them
    const userResult = await query(
      'SELECT id, username FROM users WHERE role = "user" ORDER BY id'
    );

    if (userResult.rows.length === 0) {
      console.log('❌ No regular users found in database. Please create users first.');
      console.log('💡 Run: node scripts/addTestUsers.js');
      process.exit(1);
    }

    const users = userResult.rows;
    console.log(`📝 Found ${users.length} user(s) to distribute suggestions among\n`);

    // Check if demo suggestions already exist
    const existingResult = await query(
      'SELECT COUNT(*) as count FROM suggestions WHERE title IN (?)',
      [demoSuggestions.map(s => s.title)]
    );

    if (existingResult.rows[0].count > 0) {
      console.log('⚠️  Some demo suggestions already exist. Skipping duplicates...\n');
    }

    let added = 0;
    for (let i = 0; i < demoSuggestions.length; i++) {
      const suggestion = demoSuggestions[i];
      
      // Check if this specific suggestion exists
      const checkResult = await query(
        'SELECT id FROM suggestions WHERE title = ?',
        [suggestion.title]
      );

      if (checkResult.rows.length > 0) {
        console.log(`⏭️  Skipping: "${suggestion.title}" (already exists)`);
        continue;
      }

      // Distribute suggestions evenly among users
      const user = users[i % users.length];

      // Add the suggestion
      await query(
        `INSERT INTO suggestions (title, description, image_url, category, priority, status, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          suggestion.title,
          suggestion.description,
          suggestion.image_url,
          suggestion.category,
          suggestion.priority,
          suggestion.status,
          user.id
        ]
      );

      added++;
      console.log(`✅ Added: "${suggestion.title}" [${suggestion.status}] - by ${user.username}`);
    }

    console.log(`\n🎉 Successfully added ${added} demo suggestion(s)!`);
    console.log('💡 You can now view them in the dashboard or admin panel.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding demo suggestions:', error.message);
    process.exit(1);
  }
}

addDemoSuggestions();

