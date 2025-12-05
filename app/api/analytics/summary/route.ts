import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'today', 'week', 'month', 'year'

    // Get today's stats
    const todayResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date = CURRENT_DATE
    `

    // Get yesterday's stats for comparison
    const yesterdayResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date = CURRENT_DATE - INTERVAL '1 day'
    `

    // Get this month's stats
    const thisMonthResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
    `

    // Get last month's stats for comparison
    const lastMonthResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND date < DATE_TRUNC('month', CURRENT_DATE)
    `

    // Get this week's stats
    const thisWeekResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= DATE_TRUNC('week', CURRENT_DATE)
    `

    // Get last week's stats
    const lastWeekResult = await sql`
      SELECT 
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
        AND date < DATE_TRUNC('week', CURRENT_DATE)
    `

    // Calculate percentage changes
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 10) / 10
    }

    const today = todayResult.rows[0]
    const yesterday = yesterdayResult.rows[0]
    const thisMonth = thisMonthResult.rows[0]
    const lastMonth = lastMonthResult.rows[0]
    const thisWeek = thisWeekResult.rows[0]
    const lastWeek = lastWeekResult.rows[0]

    // Calculate average order value
    const todayAOV = Number(today.orders) > 0 
      ? Number(today.revenue) / Number(today.orders) 
      : 0
    const yesterdayAOV = Number(yesterday.orders) > 0 
      ? Number(yesterday.revenue) / Number(yesterday.orders) 
      : 0
    const thisMonthAOV = Number(thisMonth.orders) > 0 
      ? Number(thisMonth.revenue) / Number(thisMonth.orders) 
      : 0
    const lastMonthAOV = Number(lastMonth.orders) > 0 
      ? Number(lastMonth.revenue) / Number(lastMonth.orders) 
      : 0

    return NextResponse.json({
      today: {
        revenue: Number(today.revenue),
        units: Number(today.units),
        orders: Number(today.orders),
        aov: Math.round(todayAOV * 100) / 100,
        changes: {
          revenue: calcChange(Number(today.revenue), Number(yesterday.revenue)),
          units: calcChange(Number(today.units), Number(yesterday.units)),
          orders: calcChange(Number(today.orders), Number(yesterday.orders)),
          aov: calcChange(todayAOV, yesterdayAOV),
        }
      },
      thisWeek: {
        revenue: Number(thisWeek.revenue),
        units: Number(thisWeek.units),
        orders: Number(thisWeek.orders),
        changes: {
          revenue: calcChange(Number(thisWeek.revenue), Number(lastWeek.revenue)),
          units: calcChange(Number(thisWeek.units), Number(lastWeek.units)),
          orders: calcChange(Number(thisWeek.orders), Number(lastWeek.orders)),
        }
      },
      thisMonth: {
        revenue: Number(thisMonth.revenue),
        units: Number(thisMonth.units),
        orders: Number(thisMonth.orders),
        aov: Math.round(thisMonthAOV * 100) / 100,
        changes: {
          revenue: calcChange(Number(thisMonth.revenue), Number(lastMonth.revenue)),
          units: calcChange(Number(thisMonth.units), Number(lastMonth.units)),
          orders: calcChange(Number(thisMonth.orders), Number(lastMonth.orders)),
          aov: calcChange(thisMonthAOV, lastMonthAOV),
        }
      },
      lastMonth: {
        revenue: Number(lastMonth.revenue),
        units: Number(lastMonth.units),
        orders: Number(lastMonth.orders),
      }
    })
  } catch (error) {
    console.error('Analytics summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    )
  }
}

