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

    // Top products by revenue
    const topByRevenue = await sql.query(`
      SELECT 
        items as product,
        category,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(*) as order_count
      FROM odoo_sales
      WHERE ${dateFilter} AND items IS NOT NULL AND items != ''
      GROUP BY items, category
      ORDER BY revenue DESC
      LIMIT ${limit}
    `)

    // Top products by units sold
    const topByUnits = await sql.query(`
      SELECT 
        items as product,
        category,
        COALESCE(SUM(qty), 0) as units,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COUNT(*) as order_count
      FROM odoo_sales
      WHERE ${dateFilter} AND items IS NOT NULL AND items != ''
      GROUP BY items, category
      ORDER BY units DESC
      LIMIT ${limit}
    `)

    // Get total for percentages
    const totalResult = await sql.query(`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as total_revenue,
        COALESCE(SUM(qty), 0) as total_units
      FROM odoo_sales
      WHERE ${dateFilter}
    `)

    const totalRevenue = Number(totalResult.rows[0]?.total_revenue || 0)
    const totalUnits = Number(totalResult.rows[0]?.total_units || 0)

    return NextResponse.json({
      topByRevenue: topByRevenue.rows.map(row => ({
        product: row.product,
        category: row.category || 'Uncategorized',
        revenue: Number(row.revenue),
        units: Number(row.units),
        orderCount: Number(row.order_count),
        revenuePercentage: totalRevenue > 0 
          ? Math.round((Number(row.revenue) / totalRevenue) * 100 * 10) / 10 
          : 0,
      })),
      topByUnits: topByUnits.rows.map(row => ({
        product: row.product,
        category: row.category || 'Uncategorized',
        units: Number(row.units),
        revenue: Number(row.revenue),
        orderCount: Number(row.order_count),
        unitsPercentage: totalUnits > 0 
          ? Math.round((Number(row.units) / totalUnits) * 100 * 10) / 10 
          : 0,
      })),
      totals: {
        revenue: totalRevenue,
        units: totalUnits,
      },
      period,
    })
  } catch (error) {
    console.error('Analytics products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product analytics' },
      { status: 500 }
    )
  }
}

