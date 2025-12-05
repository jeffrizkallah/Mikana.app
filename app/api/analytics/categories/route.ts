import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

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

    // Get revenue by category
    const result = await sql.query(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders,
        COUNT(DISTINCT items) as product_count
      FROM odoo_sales
      WHERE ${dateFilter}
      GROUP BY category
      ORDER BY revenue DESC
    `)

    const totalRevenue = result.rows.reduce((sum, row) => sum + Number(row.revenue), 0)

    // Define colors for chart
    const colors = [
      '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
    ]

    const categories = result.rows.map((row, index) => ({
      category: row.category,
      revenue: Number(row.revenue),
      units: Number(row.units),
      orders: Number(row.orders),
      productCount: Number(row.product_count),
      percentage: totalRevenue > 0 
        ? Math.round((Number(row.revenue) / totalRevenue) * 100 * 10) / 10
        : 0,
      color: colors[index % colors.length],
    }))

    return NextResponse.json({
      categories,
      totalRevenue,
      period,
    })
  } catch (error) {
    console.error('Analytics categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category analytics' },
      { status: 500 }
    )
  }
}

