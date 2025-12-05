import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const limit = parseInt(searchParams.get('limit') || '10')

    let dateFilter = ''
    switch (period) {
      case 'today':
        dateFilter = 'date = CURRENT_DATE'
        break
      case 'week':
        dateFilter = 'date >= DATE_TRUNC(\'week\', CURRENT_DATE)'
        break
      case 'year':
        dateFilter = 'date >= DATE_TRUNC(\'year\', CURRENT_DATE)'
        break
      case 'month':
      default:
        dateFilter = 'date >= DATE_TRUNC(\'month\', CURRENT_DATE)'
    }

    // Top clients by revenue
    const result = await sql.query(`
      SELECT 
        COALESCE(client, 'Unknown Client') as client,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders,
        COUNT(DISTINCT date) as active_days
      FROM odoo_sales
      WHERE ${dateFilter} AND client IS NOT NULL AND client != ''
      GROUP BY client
      ORDER BY revenue DESC
      LIMIT ${limit}
    `)

    // Get total for percentages
    const totalResult = await sql.query(`
      SELECT COALESCE(SUM(price_subtotal_with_tax), 0) as total_revenue
      FROM odoo_sales
      WHERE ${dateFilter}
    `)

    const totalRevenue = Number(totalResult.rows[0]?.total_revenue || 0)

    const clients = result.rows.map(row => ({
      client: row.client,
      revenue: Number(row.revenue),
      units: Number(row.units),
      orders: Number(row.orders),
      activeDays: Number(row.active_days),
      avgOrderValue: Number(row.orders) > 0 
        ? Math.round((Number(row.revenue) / Number(row.orders)) * 100) / 100
        : 0,
      percentage: totalRevenue > 0 
        ? Math.round((Number(row.revenue) / totalRevenue) * 100 * 10) / 10
        : 0,
    }))

    return NextResponse.json({
      clients,
      totalRevenue,
      period,
    })
  } catch (error) {
    console.error('Analytics clients error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client analytics' },
      { status: 500 }
    )
  }
}

