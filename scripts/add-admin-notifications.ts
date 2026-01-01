import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function addAdminNotifications() {
  console.log('🚀 Adding admin notification features...\n')

  try {
    // 1. Add target_roles column (array of roles that should see this notification)
    console.log('📋 Adding target_roles column...')
    await sql`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT NULL
    `
    console.log('  ✓ target_roles column added')

    // 2. Add metadata column (JSONB for storing related data like userId)
    console.log('📋 Adding metadata column...')
    await sql`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL
    `
    console.log('  ✓ metadata column added')

    // 3. Add related_user_id column (for linking to a specific user, e.g., signup notifications)
    console.log('📋 Adding related_user_id column...')
    await sql`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS related_user_id INTEGER DEFAULT NULL
    `
    console.log('  ✓ related_user_id column added')

    // 4. Update the type CHECK constraint to include 'user_signup'
    console.log('📋 Updating type constraint to include user_signup...')
    
    // First, drop the existing constraint
    await sql`
      ALTER TABLE notifications 
      DROP CONSTRAINT IF EXISTS notifications_type_check
    `
    
    // Then add the new constraint with user_signup included
    await sql`
      ALTER TABLE notifications 
      ADD CONSTRAINT notifications_type_check 
      CHECK (type IN ('feature', 'patch', 'alert', 'announcement', 'urgent', 'user_signup'))
    `
    console.log('  ✓ type constraint updated')

    // 5. Create index for target_roles queries
    console.log('📋 Creating index for target_roles...')
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_target_roles 
      ON notifications USING GIN (target_roles)
    `
    console.log('  ✓ target_roles index created')

    // 6. Create index for related_user_id (for cleanup when user is approved/rejected)
    console.log('📋 Creating index for related_user_id...')
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_related_user 
      ON notifications(related_user_id) WHERE related_user_id IS NOT NULL
    `
    console.log('  ✓ related_user_id index created')

    console.log('\n✅ Migration complete!')
    console.log('\n📝 Summary of changes:')
    console.log('  - Added target_roles column (TEXT[]) for role-based notification targeting')
    console.log('  - Added metadata column (JSONB) for storing additional notification data')
    console.log('  - Added related_user_id column (INTEGER) for linking to users')
    console.log('  - Added "user_signup" to valid notification types')
    console.log('  - Created indexes for efficient queries')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
addAdminNotifications()
  .then(() => {
    console.log('\n🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error)
    process.exit(1)
  })

