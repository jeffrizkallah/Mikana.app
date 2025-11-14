import { config } from 'dotenv'
import { sql } from '@vercel/postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: '.env.local' })

interface Dispatch {
  id: string
  createdDate: string
  deliveryDate: string
  createdBy: string
  branchDispatches: any[]
  deletedAt?: string
  deletedBy?: string
}

async function migrateDispatches() {
  console.log('🚀 Starting migration to Postgres...\n')

  try {
    // Read active dispatches
    const dispatchFilePath = join(process.cwd(), 'data', 'dispatches.json')
    let activeDispatches: Dispatch[] = []
    
    try {
      const fileContent = readFileSync(dispatchFilePath, 'utf-8')
      activeDispatches = JSON.parse(fileContent)
      console.log(`📦 Found ${activeDispatches.length} active dispatches`)
    } catch (err) {
      console.log('📦 No active dispatches found')
    }

    // Read archived dispatches
    const archiveFilePath = join(process.cwd(), 'data', 'dispatches-archive.json')
    let archivedDispatches: Dispatch[] = []
    
    try {
      const archiveContent = readFileSync(archiveFilePath, 'utf-8')
      archivedDispatches = JSON.parse(archiveContent)
      console.log(`📦 Found ${archivedDispatches.length} archived dispatches`)
    } catch (err) {
      console.log('📦 No archived dispatches found')
    }

    let successCount = 0
    let errorCount = 0

    // Migrate active dispatches
    console.log('\n📥 Migrating active dispatches...')
    for (const dispatch of activeDispatches) {
      try {
        await sql`
          INSERT INTO dispatches (
            id,
            created_date,
            delivery_date,
            created_by,
            branch_dispatches,
            is_archived,
            deleted_at,
            deleted_by
          ) VALUES (
            ${dispatch.id},
            ${dispatch.createdDate},
            ${dispatch.deliveryDate},
            ${dispatch.createdBy},
            ${JSON.stringify(dispatch.branchDispatches)}::jsonb,
            false,
            NULL,
            NULL
          )
          ON CONFLICT (id) DO NOTHING
        `
        successCount++
        console.log(`  ✓ Migrated: ${dispatch.id}`)
      } catch (error) {
        errorCount++
        console.error(`  ✗ Failed: ${dispatch.id}`, error)
      }
    }

    // Migrate archived dispatches
    console.log('\n📥 Migrating archived dispatches...')
    for (const dispatch of archivedDispatches) {
      try {
        await sql`
          INSERT INTO dispatches (
            id,
            created_date,
            delivery_date,
            created_by,
            branch_dispatches,
            is_archived,
            deleted_at,
            deleted_by
          ) VALUES (
            ${dispatch.id},
            ${dispatch.createdDate},
            ${dispatch.deliveryDate},
            ${dispatch.createdBy},
            ${JSON.stringify(dispatch.branchDispatches)}::jsonb,
            true,
            ${dispatch.deletedAt || new Date().toISOString()},
            ${dispatch.deletedBy || 'System'}
          )
          ON CONFLICT (id) DO NOTHING
        `
        successCount++
        console.log(`  ✓ Migrated: ${dispatch.id}`)
      } catch (error) {
        errorCount++
        console.error(`  ✗ Failed: ${dispatch.id}`, error)
      }
    }

    console.log('\n✅ Migration complete!')
    console.log(`   Success: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total: ${activeDispatches.length + archivedDispatches.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrateDispatches()
  .then(() => {
    console.log('\n🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error)
    process.exit(1)
  })

