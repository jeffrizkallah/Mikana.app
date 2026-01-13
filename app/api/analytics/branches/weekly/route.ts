import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Get current day of week (0 = Sunday, 6 = Saturday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    // Week runs from Sunday to Friday, data synced Friday evening
    // On Saturday, we show the complete previous week (Sunday to Friday)
    // On Sunday-Saturday, we show the most recent complete week
    let weekStart: Date
    let weekEnd: Date
    let isComplete: boolean
    
    if (dayOfWeek === 6) {
      // Saturday - show complete previous week (Sunday to Friday)
      // Data was synced Friday evening, so we have complete week data
      weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 6) // Go back to Sunday
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() - 1) // Friday
      weekEnd.setHours(23, 59, 59, 999)
      isComplete = true
    } else if (dayOfWeek === 0) {
      // Sunday - show the previous complete week (last Sunday to Friday)
      weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 7) // Go back to previous Sunday
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() - 2) // Previous Friday
      weekEnd.setHours(23, 59, 59, 999)
      isComplete = true
    } else {
      // Monday-Friday - show current week so far (Sunday to yesterday)
      // This is partial data until Friday evening sync
      weekStart = new Date(today)
      weekStart.setDate(today.getDate() - dayOfWeek) // Go back to Sunday
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() - 1) // Yesterday
      weekEnd.setHours(23, 59, 59, 999)
      isComplete = false
    }

    // Get weekly sales by branch
    const weeklyResult = await sql`
      SELECT 
        branch,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= ${weekStart.toISOString().split('T')[0]}::date
        AND date <= ${weekEnd.toISOString().split('T')[0]}::date
      GROUP BY branch
      ORDER BY revenue DESC
    `

    const branches = weeklyResult.rows.map(row => ({
      branch: row.branch || 'Unknown',
      revenue: Number(row.revenue),
      units: Number(row.units),
      orders: Number(row.orders),
    }))

    return NextResponse.json({
      branches,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      isComplete,
    })
  } catch (error) {
    console.error('Weekly branch analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly branch analytics' },
      { status: 500 }
    )
  }
}
