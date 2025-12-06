import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

config({ path: '.env.local' })

async function addBranchStaffRole() {
  console.log('Adding branch_staff role to database...\n')
  
  try {
    // Drop existing constraint
    await sql`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check
    `
    console.log('✓ Dropped existing constraint')
    
    // Add new constraint with branch_staff
    await sql`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN (
        'admin', 
        'operations_lead', 
        'dispatcher', 
        'central_kitchen', 
        'branch_manager',
        'branch_staff'
      ))
    `
    console.log('✓ Added new constraint with branch_staff role')
    
    console.log('\n✅ branch_staff role added successfully!')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

addBranchStaffRole()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

