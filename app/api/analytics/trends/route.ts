import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get daily revenue and units for the specified period
    const result = await sql`
      SELECT 
        date,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= CURRENT_DATE - CAST(${days} || ' days' AS INTERVAL)
      GROUP BY date
      ORDER BY date ASC
    `

    // Format data for charts
    const trends = result.rows.map(row => ({
      date: row.date,
      revenue: Number(row.revenue),
      units: Number(row.units),
      orders: Number(row.orders),
    }))

    // Calculate moving averages (7-day)
    const withMovingAvg = trends.map((day, index) => {
      const start = Math.max(0, index - 6)
      const slice = trends.slice(start, index + 1)
      const avgRevenue = slice.reduce((sum, d) => sum + d.revenue, 0) / slice.length
      
      return {
        ...day,
        revenueMA7: Math.round(avgRevenue * 100) / 100,
      }
    })

    return NextResponse.json({
      trends: withMovingAvg,
      summary: {
        totalRevenue: trends.reduce((sum, d) => sum + d.revenue, 0),
        totalUnits: trends.reduce((sum, d) => sum + d.units, 0),
        totalOrders: trends.reduce((sum, d) => sum + d.orders, 0),
        avgDailyRevenue: trends.length > 0 
          ? Math.round(trends.reduce((sum, d) => sum + d.revenue, 0) / trends.length * 100) / 100
          : 0,
      }
    })
  } catch (error) {
    console.error('Analytics trends error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    )
  }
}

