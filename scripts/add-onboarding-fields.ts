import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function addOnboardingFields() {
  console.log('🚀 Adding onboarding fields to users table...\n')

  try {
    // Step 1: Add onboarding_completed column
    console.log('📋 Adding onboarding_completed column...')
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE
    `
    console.log('✓ onboarding_completed column added\n')

    // Step 2: Add tours_completed column (array of tour IDs)
    console.log('📋 Adding tours_completed column...')
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS tours_completed TEXT[] DEFAULT '{}'
    `
    console.log('✓ tours_completed column added\n')

    // Step 3: Add onboarding_skipped column
    console.log('📋 Adding onboarding_skipped column...')
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE
    `
    console.log('✓ onboarding_skipped column added\n')

    // Step 4: Add onboarding_started_at column
    console.log('📋 Adding onboarding_started_at column...')
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE
    `
    console.log('✓ onboarding_started_at column added\n')

    console.log('\n✅ All onboarding fields added successfully!')
    console.log('\n📊 New columns added to users table:')
    console.log('   - onboarding_completed (tracks if welcome modal was completed)')
    console.log('   - tours_completed (array of tour IDs user has seen)')
    console.log('   - onboarding_skipped (if user chose to skip onboarding)')
    console.log('   - onboarding_started_at (when onboarding started)')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run the migration
addOnboardingFields()
  .then(() => {
    console.log('\n🎉 Onboarding database migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error)
    process.exit(1)
  })

