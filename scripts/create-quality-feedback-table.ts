import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function createQualityFeedbackTable() {
  console.log('🚀 Creating quality_feedback table in Postgres...\n')

  try {
    // Step 1: Create quality_feedback table
    console.log('📋 Creating quality_feedback table...')
    await sql`
      CREATE TABLE IF NOT EXISTS quality_feedback (
        id SERIAL PRIMARY KEY,
        quality_check_id INTEGER NOT NULL REFERENCES quality_checks(id) ON DELETE CASCADE,
        feedback_text TEXT NOT NULL,
        feedback_by INTEGER NOT NULL REFERENCES users(id),
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ quality_feedback table created\n')

    // Step 2: Create indexes
    console.log('📋 Creating indexes...')
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_quality_feedback_check_id 
      ON quality_feedback(quality_check_id)
    `
    console.log('  ✓ idx_quality_feedback_check_id')

    await sql`
      CREATE INDEX IF NOT EXISTS idx_quality_feedback_by 
      ON quality_feedback(feedback_by)
    `
    console.log('  ✓ idx_quality_feedback_by')

    await sql`
      CREATE INDEX IF NOT EXISTS idx_quality_feedback_unread 
      ON quality_feedback(quality_check_id, is_read) 
      WHERE is_read = FALSE
    `
    console.log('  ✓ idx_quality_feedback_unread')

    console.log('\n✅ Quality feedback table and indexes created successfully!')
    console.log('\n📊 Table structure:')
    console.log('   - id: Primary key')
    console.log('   - quality_check_id: FK to quality_checks')
    console.log('   - feedback_text: The improvement suggestion')
    console.log('   - feedback_by: FK to users (who gave feedback)')
    console.log('   - is_read: Has the submitter seen this?')
    console.log('   - read_at: When they saw it')
    console.log('   - created_at: When feedback was given')

  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  }
}

// Run the migration
createQualityFeedbackTable()
  .then(() => {
    console.log('\n🎉 Migration completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
