import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Calculate yesterday's date explicitly to avoid timezone issues
    // Use UTC to ensure consistency
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)
    const yesterdayDateStr = yesterday.toISOString().split('T')[0]
    
    // Get yesterday's sales by branch
    // Try both exact date match and date range to handle timezone differences
    const yesterdayResult = await sql`
      SELECT 
        branch,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date::text = ${yesterdayDateStr}
         OR date = CURRENT_DATE - INTERVAL '1 day'
      GROUP BY branch
      ORDER BY revenue DESC
    `

    // Debug: Check what dates we have data for
    const dateCheck = await sql`
      SELECT 
        date,
        COUNT(*) as row_count,
        COALESCE(SUM(price_subtotal_with_tax), 0) as total_revenue
      FROM odoo_sales
      WHERE date >= CURRENT_DATE - INTERVAL '3 days'
      GROUP BY date
      ORDER BY date DESC
      LIMIT 5
    `

    console.log('Yesterday branch analytics debug:', {
      targetDate: yesterdayDateStr,
      availableDates: dateCheck.rows.map(r => ({
        date: r.date,
        rows: r.row_count,
        revenue: r.total_revenue
      })),
      branchRows: yesterdayResult.rows.length,
      sampleBranches: yesterdayResult.rows.slice(0, 5).map(r => ({
        branch: r.branch,
        revenue: r.revenue
      }))
    })

    const branches = yesterdayResult.rows
      .filter(row => {
        const revenue = Number(row.revenue)
        return revenue > 0 && row.branch // Filter out zero revenue and null branches
      })
      .map(row => ({
        branch: row.branch || 'Unknown',
        revenue: Number(row.revenue),
        units: Number(row.units),
        orders: Number(row.orders),
      }))

    return NextResponse.json({
      branches,
      date: yesterdayDateStr,
    })
  } catch (error) {
    console.error('Yesterday branch analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch yesterday branch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
