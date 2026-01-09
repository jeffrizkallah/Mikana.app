import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sql } from '@vercel/postgres'
import { authOptions } from '@/lib/auth-options'

// GET - Get analytics data for charts (SQL-based, fast)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    // Get scores over time (daily averages)
    const scoresOverTime = await sql`
      SELECT 
        DATE(submission_date) as date,
        COUNT(*) as count,
        ROUND(AVG(taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(appearance_score)::numeric, 2) as avg_appearance,
        COUNT(CASE WHEN taste_score <= 2 OR appearance_score <= 2 THEN 1 END) as low_scores_count
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY DATE(submission_date)
      ORDER BY date ASC
    `

    // Get performance by branch
    const branchPerformance = await sql`
      SELECT 
        b.name as branch_name,
        qc.branch_slug,
        COUNT(*) as total_checks,
        ROUND(AVG(qc.taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(qc.appearance_score)::numeric, 2) as avg_appearance,
        ROUND(AVG((qc.taste_score + qc.appearance_score) / 2.0)::numeric, 2) as avg_overall,
        COUNT(CASE WHEN qc.taste_score <= 2 OR qc.appearance_score <= 2 THEN 1 END) as low_scores,
        COUNT(CASE WHEN qc.taste_score >= 4 AND qc.appearance_score >= 4 THEN 1 END) as high_scores
      FROM quality_checks qc
      LEFT JOIN branches b ON qc.branch_slug = b.slug
      WHERE qc.submission_date >= ${startDate}::timestamp
        AND qc.submission_date <= ${endDate}::timestamp
      GROUP BY b.name, qc.branch_slug
      ORDER BY avg_overall DESC
    `

    // Get performance by section
    const sectionPerformance = await sql`
      SELECT 
        section,
        COUNT(*) as total_checks,
        ROUND(AVG(taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(appearance_score)::numeric, 2) as avg_appearance,
        ROUND(AVG((taste_score + appearance_score) / 2.0)::numeric, 2) as avg_overall,
        COUNT(CASE WHEN taste_score <= 2 OR appearance_score <= 2 THEN 1 END) as low_scores
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY section
      ORDER BY avg_overall DESC
    `

    // Get meal service comparison
    const mealServiceComparison = await sql`
      SELECT 
        meal_service,
        COUNT(*) as total_checks,
        ROUND(AVG(taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(appearance_score)::numeric, 2) as avg_appearance,
        ROUND(AVG(temp_celsius)::numeric, 2) as avg_temperature
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY meal_service
      ORDER BY meal_service
    `

    // Get top products (require at least 3 checks for consistency)
    const topProductsQuery = await sql`
      SELECT 
        product_name,
        section,
        COUNT(*) as check_count,
        ROUND(AVG(taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(appearance_score)::numeric, 2) as avg_appearance,
        ROUND(AVG((taste_score + appearance_score) / 2.0)::numeric, 2) as avg_overall
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY product_name, section
      HAVING COUNT(*) >= 3
        AND AVG((taste_score + appearance_score) / 2.0) >= 4.0
      ORDER BY avg_overall DESC
      LIMIT 10
    `

    // Get bottom products (show ALL low-scoring items, even with 1 check)
    const bottomProductsQuery = await sql`
      SELECT 
        product_name,
        section,
        COUNT(*) as check_count,
        ROUND(AVG(taste_score)::numeric, 2) as avg_taste,
        ROUND(AVG(appearance_score)::numeric, 2) as avg_appearance,
        ROUND(AVG((taste_score + appearance_score) / 2.0)::numeric, 2) as avg_overall
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY product_name, section
      HAVING AVG((taste_score + appearance_score) / 2.0) < 3.5
      ORDER BY avg_overall ASC
      LIMIT 10
    `

    const topProducts = topProductsQuery.rows
    const bottomProducts = bottomProductsQuery.rows

    // Temperature compliance (hot items should be >60C, cold items <10C)
    const temperatureCompliance = await sql`
      SELECT 
        section,
        COUNT(*) as total,
        COUNT(CASE 
          WHEN section = 'Hot' AND temp_celsius >= 60 THEN 1
          WHEN section = 'Cold' AND temp_celsius <= 10 THEN 1
          WHEN section IN ('Bakery', 'Beverages') THEN 1
        END) as compliant,
        ROUND(AVG(temp_celsius)::numeric, 2) as avg_temp,
        MIN(temp_celsius) as min_temp,
        MAX(temp_celsius) as max_temp
      FROM quality_checks
      WHERE submission_date >= ${startDate}::timestamp
        AND submission_date <= ${endDate}::timestamp
      GROUP BY section
    `

    // Score distribution
    const scoreDistribution = await sql`
      SELECT 
        score,
        COUNT(taste_count) as taste_frequency,
        COUNT(appearance_count) as appearance_frequency
      FROM (
        SELECT taste_score as score, 1 as taste_count, NULL as appearance_count
        FROM quality_checks
        WHERE submission_date >= ${startDate}::timestamp
          AND submission_date <= ${endDate}::timestamp
        UNION ALL
        SELECT appearance_score as score, NULL as taste_count, 1 as appearance_count
        FROM quality_checks
        WHERE submission_date >= ${startDate}::timestamp
          AND submission_date <= ${endDate}::timestamp
      ) scores
      GROUP BY score
      ORDER BY score
    `

    return NextResponse.json({
      scoresOverTime: scoresOverTime.rows,
      branchPerformance: branchPerformance.rows,
      sectionPerformance: sectionPerformance.rows,
      mealServiceComparison: mealServiceComparison.rows,
      topProducts,
      bottomProducts,
      temperatureCompliance: temperatureCompliance.rows,
      scoreDistribution: scoreDistribution.rows,
    })

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 })
  }
}

