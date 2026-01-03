import { config } from 'dotenv'
import { sql } from '@vercel/postgres'
import branchesData from '../data/branches.json'

// Load environment variables from .env.local
config({ path: '.env.local' })

interface Contact {
  name: string
  role: string
  phone: string
  email: string
}

interface DeliverySchedule {
  day: string
  time: string
  items: string
}

interface KPIs {
  salesTarget: string
  wastePct: string
  hygieneScore: string
}

interface Media {
  photos: string[]
  videos: string[]
}

interface Branch {
  id: string
  slug: string
  name: string
  branchType?: 'production' | 'service'
  school: string
  location: string
  manager: string
  contacts: Contact[]
  operatingHours: string
  deliverySchedule: DeliverySchedule[]
  kpis: KPIs
  roles: string[]
  media: Media
}

async function createBranchesTable() {
  console.log('🚀 Creating branches table in Postgres...\n')

  try {
    // Create branches table
    console.log('📋 Creating branches table...')
    await sql`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        branch_type VARCHAR(50) DEFAULT 'service' CHECK (branch_type IN ('production', 'service')),
        school VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        manager VARCHAR(255) NOT NULL,
        contacts JSONB DEFAULT '[]'::jsonb,
        operating_hours VARCHAR(255),
        delivery_schedule JSONB DEFAULT '[]'::jsonb,
        kpis JSONB DEFAULT '{}'::jsonb,
        roles JSONB DEFAULT '[]'::jsonb,
        media JSONB DEFAULT '{"photos": [], "videos": []}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✓ branches table created\n')

    // Create indexes
    console.log('📋 Creating indexes...')
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_slug ON branches(slug)`
    console.log('  ✓ idx_branches_slug')
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_location ON branches(location)`
    console.log('  ✓ idx_branches_location')
    await sql`CREATE INDEX IF NOT EXISTS idx_branches_branch_type ON branches(branch_type)`
    console.log('  ✓ idx_branches_branch_type')

    console.log('\n✅ Branches table and indexes created successfully!')
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  }
}

async function seedBranchesData() {
  console.log('\n🌱 Seeding branches data from JSON...\n')

  const branches = branchesData as Branch[]
  let successCount = 0
  let skipCount = 0

  for (const branch of branches) {
    try {
      // Check if branch already exists
      const existing = await sql`SELECT slug FROM branches WHERE slug = ${branch.slug}`
      
      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Skipping ${branch.name} (already exists)`)
        skipCount++
        continue
      }

      await sql`
        INSERT INTO branches (
          slug, name, branch_type, school, location, manager,
          contacts, operating_hours, delivery_schedule, kpis, roles, media
        )
        VALUES (
          ${branch.slug},
          ${branch.name},
          ${branch.branchType || 'service'},
          ${branch.school},
          ${branch.location},
          ${branch.manager},
          ${JSON.stringify(branch.contacts)}::jsonb,
          ${branch.operatingHours},
          ${JSON.stringify(branch.deliverySchedule)}::jsonb,
          ${JSON.stringify(branch.kpis)}::jsonb,
          ${JSON.stringify(branch.roles)}::jsonb,
          ${JSON.stringify(branch.media)}::jsonb
        )
      `
      console.log(`  ✓ Inserted ${branch.name}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Failed to insert ${branch.name}:`, error)
    }
  }

  console.log(`\n📊 Seeding complete: ${successCount} inserted, ${skipCount} skipped`)
}

async function main() {
  console.log('='.repeat(50))
  console.log('   Branches Migration to PostgreSQL')
  console.log('='.repeat(50))
  console.log()

  await createBranchesTable()
  await seedBranchesData()

  console.log('\n🎉 Migration complete!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Migration error:', error)
    process.exit(1)
  })

