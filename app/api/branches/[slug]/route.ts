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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const result = await sql`
      SELECT * FROM branches WHERE slug = ${slug}
    `
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    return NextResponse.json(rowToBranch(result.rows[0]))
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const updates = await request.json()
    
    // Check if branch exists
    const existing = await sql`SELECT id FROM branches WHERE slug = ${slug}`
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Update branch
    const result = await sql`
      UPDATE branches SET
        name = ${updates.name},
        branch_type = ${updates.branchType || 'service'},
        school = ${updates.school || ''},
        location = ${updates.location},
        manager = ${updates.manager},
        contacts = ${JSON.stringify(updates.contacts || [])}::jsonb,
        operating_hours = ${updates.operatingHours || ''},
        delivery_schedule = ${JSON.stringify(updates.deliverySchedule || [])}::jsonb,
        kpis = ${JSON.stringify(updates.kpis || { salesTarget: '', wastePct: '', hygieneScore: '' })}::jsonb,
        roles = ${JSON.stringify(updates.roles || [])}::jsonb,
        media = ${JSON.stringify(updates.media || { photos: [], videos: [] })}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = ${slug}
      RETURNING *
    `

    return NextResponse.json(rowToBranch(result.rows[0]))
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const result = await sql`
      DELETE FROM branches WHERE slug = ${slug}
      RETURNING slug
    `
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
