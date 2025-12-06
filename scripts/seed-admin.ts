import { config } from 'dotenv'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function seedAdmin() {
  // Get admin email from command line or use default
  const adminEmail = process.argv[2] || 'admin@mikana.ae'
  const adminPassword = process.argv[3] || 'admin123'

  console.log('🔐 Seeding admin user...\n')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}\n`)

  try {
    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${adminEmail.toLowerCase()}
    `

    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists!')
      
      // Update to active admin if not already
      await sql`
        UPDATE users 
        SET role = 'admin', status = 'active', updated_at = CURRENT_TIMESTAMP
        WHERE email = ${adminEmail.toLowerCase()}
      `
      console.log('✓ Updated existing user to admin role')
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    await sql`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        status
      )
      VALUES (
        ${adminEmail.toLowerCase()},
        ${passwordHash},
        'Admin',
        'User',
        'admin',
        'active'
      )
    `

    console.log('✅ Admin user created successfully!')
    console.log('\nYou can now log in with:')
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Password: ${adminPassword}`)
    console.log('\n⚠️  Remember to change the password after first login!')

  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    throw error
  }
}

// Run the seeder
seedAdmin()
  .then(() => {
    console.log('\n🎉 Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Seeding error:', error)
    process.exit(1)
  })

