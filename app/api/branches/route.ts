import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import type { Branch } from '@/lib/data'

// Helper to convert database row to Branch type
function rowToBranch(row: any): Branch {
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    branchType: row.branch_type,
    school: row.school || '',
    location: row.location,
    manager: row.manager,
    contacts: row.contacts || [],
    operatingHours: row.operating_hours || '',
    deliverySchedule: row.delivery_schedule || [],
    kpis: row.kpis || { salesTarget: '', wastePct: '', hygieneScore: '' },
    roles: row.roles || [],
    media: row.media || { photos: [], videos: [] }
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM branches ORDER BY name ASC
    `
    const branches = result.rows.map(rowToBranch)
    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const newBranch = await request.json()
    
    // Basic validation
    if (!newBranch.slug || !newBranch.name || !newBranch.location || !newBranch.manager) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name, location, manager' },
        { status: 400 }
      )
    }

    // Check if slug exists
    const existing = await sql`SELECT slug FROM branches WHERE slug = ${newBranch.slug}`
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Branch slug already exists' },
        { status: 409 }
      )
    }

    // Insert new branch
    const result = await sql`
      INSERT INTO branches (
        slug, name, branch_type, school, location, manager,
        contacts, operating_hours, delivery_schedule, kpis, roles, media
      )
      VALUES (
        ${newBranch.slug},
        ${newBranch.name},
        ${newBranch.branchType || 'service'},
        ${newBranch.school || ''},
        ${newBranch.location},
        ${newBranch.manager},
        ${JSON.stringify(newBranch.contacts || [])}::jsonb,
        ${newBranch.operatingHours || ''},
        ${JSON.stringify(newBranch.deliverySchedule || [])}::jsonb,
        ${JSON.stringify(newBranch.kpis || { salesTarget: '', wastePct: '', hygieneScore: '' })}::jsonb,
        ${JSON.stringify(newBranch.roles || ['manager', 'supervisor', 'kitchen', 'counter', 'cleaner'])}::jsonb,
        ${JSON.stringify(newBranch.media || { photos: [], videos: [] })}::jsonb
      )
      RETURNING *
    `

    return NextResponse.json(rowToBranch(result.rows[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
