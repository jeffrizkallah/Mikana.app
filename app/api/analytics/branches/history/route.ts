import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Get daily sales by branch for the last N days
    const result = await sql`
      SELECT 
        branch,
        date,
        COALESCE(SUM(price_subtotal_with_tax), 0) as revenue,
        COALESCE(SUM(qty), 0) as units,
        COUNT(DISTINCT order_number) as orders
      FROM odoo_sales
      WHERE date >= CURRENT_DATE - CAST(${days} || ' days' AS INTERVAL)
        AND date < CURRENT_DATE
      GROUP BY branch, date
      ORDER BY branch, date ASC
    `

    // Group by branch
    const branchMap = new Map<string, {
      branch: string
      history: { date: string; revenue: number; units: number; orders: number }[]
      totalRevenue: number
      totalOrders: number
      avgRevenue: number
    }>()

    result.rows.forEach(row => {
      const branchName = row.branch || 'Unknown'
      if (!branchMap.has(branchName)) {
        branchMap.set(branchName, {
          branch: branchName,
          history: [],
          totalRevenue: 0,
          totalOrders: 0,
          avgRevenue: 0,
        })
      }

      const branchData = branchMap.get(branchName)!
      const revenue = Number(row.revenue)
      const orders = Number(row.orders)
      
      branchData.history.push({
        date: row.date,
        revenue,
        units: Number(row.units),
        orders,
      })
      branchData.totalRevenue += revenue
      branchData.totalOrders += orders
    })

    // Calculate averages and format response
    const branches = Array.from(branchMap.values())
      .map(b => ({
        ...b,
        avgRevenue: b.history.length > 0 ? Math.round(b.totalRevenue / b.history.length) : 0,
      }))
      .filter(b => b.totalRevenue > 0) // Filter out branches with no revenue
      .sort((a, b) => {
        // Sort by yesterday's revenue (last item in history)
        const aYesterday = a.history[a.history.length - 1]?.revenue || 0
        const bYesterday = b.history[b.history.length - 1]?.revenue || 0
        return bYesterday - aYesterday
      })

    return NextResponse.json({
      branches,
      days,
      dateRange: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error('Branch history analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branch history analytics' },
      { status: 500 }
    )
  }
}
