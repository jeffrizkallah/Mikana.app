import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: Request) {
  try {
    const dispatch = await request.json()
    
    // Insert new dispatch into database
    await sql`
      INSERT INTO dispatches (
        id,
        created_date,
        delivery_date,
        created_by,
        branch_dispatches,
        is_archived
      ) VALUES (
        ${dispatch.id},
        ${dispatch.createdDate},
        ${dispatch.deliveryDate},
        ${dispatch.createdBy},
        ${JSON.stringify(dispatch.branchDispatches)}::jsonb,
        false
      )
    `
    
    return NextResponse.json({ success: true, id: dispatch.id })
  } catch (error) {
    console.error('Error saving dispatch:', error)
    return NextResponse.json({ error: 'Failed to save dispatch' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get all non-archived dispatches
    const result = await sql`
      SELECT 
        id,
        created_date as "createdDate",
        delivery_date as "deliveryDate",
        created_by as "createdBy",
        branch_dispatches as "branchDispatches"
      FROM dispatches
      WHERE is_archived = false
      ORDER BY delivery_date DESC
    `
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching dispatches:', error)
    return NextResponse.json([], { status: 200 })
  }
}

