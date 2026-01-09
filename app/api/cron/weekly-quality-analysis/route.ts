import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// This endpoint runs weekly via Vercel Cron
// Vercel Cron secret for authentication
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting weekly quality analysis cron job...')

    // Calculate date range (last 7 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const startDateStr = startDate.toISOString()
    const endDateStr = endDate.toISOString()

    console.log(`Analyzing period: ${startDateStr} to ${endDateStr}`)

    // Check if analysis already exists for this exact period
    const existing = await sql`
      SELECT id FROM quality_analytics_cache
      WHERE period_type = 'weekly'
        AND period_start::date = ${startDate.toISOString().split('T')[0]}::date
        AND period_end::date = ${endDate.toISOString().split('T')[0]}::date
        AND status = 'completed'
    `

    if (existing.rows.length > 0) {
      console.log('Analysis already exists for this period, skipping...')
      return NextResponse.json({ 
        message: 'Analysis already exists for this period',
        skipped: true 
      })
    }

    // Fetch quality check data
    const checks = await sql`
      SELECT 
        qc.id,
        qc.branch_slug as "branchSlug",
        qc.submission_date as "submissionDate",
        qc.meal_service as "mealService",
        qc.product_name as "productName",
        qc.section,
        qc.taste_score as "tasteScore",
        qc.appearance_score as "appearanceScore",
        qc.portion_qty_gm as "portionQtyGm",
        qc.temp_celsius as "tempCelsius",
        qc.taste_notes as "tasteNotes",
        qc.portion_notes as "portionNotes",
        qc.appearance_notes as "appearanceNotes",
        qc.remarks,
        qc.corrective_action_taken as "correctiveActionTaken",
        qc.corrective_action_notes as "correctiveActionNotes",
        b.name as "branchName"
      FROM quality_checks qc
      LEFT JOIN branches b ON qc.branch_slug = b.slug
      WHERE qc.submission_date >= ${startDateStr}::timestamp
        AND qc.submission_date <= ${endDateStr}::timestamp
      ORDER BY qc.submission_date DESC
    `

    if (checks.rows.length === 0) {
      console.log('No quality check data found for this period')
      return NextResponse.json({ 
        message: 'No data to analyze',
        submissionsCount: 0 
      })
    }

    const submissions = checks.rows
    const submissionCount = submissions.length

    console.log(`Found ${submissionCount} submissions to analyze`)

    // Calculate statistics
    const avgTaste = submissions.reduce((acc, s) => acc + s.tasteScore, 0) / submissionCount
    const avgAppearance = submissions.reduce((acc, s) => acc + s.appearanceScore, 0) / submissionCount
    const lowScores = submissions.filter(s => s.tasteScore <= 2 || s.appearanceScore <= 2)
    const highScores = submissions.filter(s => s.tasteScore >= 4 && s.appearanceScore >= 4)
    const uniqueBranches = [...new Set(submissions.map(s => s.branchSlug))]

    // Branch statistics
    const branchStats = uniqueBranches.map(branchSlug => {
      const branchSubs = submissions.filter(s => s.branchSlug === branchSlug)
      const branchName = branchSubs[0]?.branchName || branchSlug
      return {
        branchSlug,
        branchName,
        count: branchSubs.length,
        avgTaste: (branchSubs.reduce((acc, s) => acc + s.tasteScore, 0) / branchSubs.length).toFixed(1),
        avgAppearance: (branchSubs.reduce((acc, s) => acc + s.appearanceScore, 0) / branchSubs.length).toFixed(1),
      }
    })

    // Prepare textual data
    const textualData = submissions
      .filter(s => s.tasteNotes || s.appearanceNotes || s.remarks || s.correctiveActionNotes)
      .map(s => ({
        branch: s.branchName,
        product: s.productName,
        section: s.section,
        tasteScore: s.tasteScore,
        appearanceScore: s.appearanceScore,
        notes: [
          s.tasteNotes ? `Taste: ${s.tasteNotes}` : null,
          s.appearanceNotes ? `Appearance: ${s.appearanceNotes}` : null,
          s.portionNotes ? `Portion: ${s.portionNotes}` : null,
          s.remarks ? `Remarks: ${s.remarks}` : null,
          s.correctiveActionNotes ? `Action Taken: ${s.correctiveActionNotes}` : null,
        ].filter(Boolean).join(' | ')
      }))

    // Create AI prompt
    const prompt = `You are a food quality analyst for Mikana, a catering company operating 12 branches in UAE. Analyze the following weekly quality control data and provide actionable insights.

PERIOD: Weekly analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}
TOTAL SUBMISSIONS: ${submissionCount}
BRANCHES ANALYZED: ${uniqueBranches.length}

AGGREGATE STATISTICS:
- Average Taste Score: ${avgTaste.toFixed(2)}/5
- Average Appearance Score: ${avgAppearance.toFixed(2)}/5
- Low Scores (≤2): ${lowScores.length} submissions (${((lowScores.length/submissionCount)*100).toFixed(1)}%)
- High Scores (≥4): ${highScores.length} submissions (${((highScores.length/submissionCount)*100).toFixed(1)}%)

BRANCH PERFORMANCE:
${branchStats.map(b => `- ${b.branchName}: ${b.count} checks, Taste ${b.avgTaste}, Appearance ${b.avgAppearance}`).join('\n')}

DETAILED NOTES AND FEEDBACK:
${textualData.slice(0, 100).map((item, i) => 
  `${i+1}. [${item.branch}] ${item.product} (${item.section}) - Scores: ${item.tasteScore}/5 taste, ${item.appearanceScore}/5 appearance
   Notes: ${item.notes}`
).join('\n\n')}

${textualData.length > 100 ? `\n(... ${textualData.length - 100} more submissions with notes)` : ''}

Please analyze this data and provide:

1. **Executive Summary** (2-3 sentences): Overall quality status and key takeaways

2. **Critical Issues** (3-5 items): Urgent problems requiring immediate attention, with specific branch/product details

3. **Common Patterns** (3-5 items): Recurring themes in the notes/feedback (e.g., "underseasoning", "portion inconsistency", "temperature issues"). Include frequency count if possible.

4. **Top Performers** (2-3 items): Branches or products with excellent consistent quality

5. **Low Performers** (2-3 items): Branches or products needing improvement, with specific scores

6. **Actionable Recommendations** (3-5 items): Specific, practical steps to improve quality

7. **Trends & Insights**: Any notable patterns (meal service differences, section performance, temperature/portion issues)

Format your response as valid JSON with this structure:
{
  "summary": "string",
  "insights": [
    {"type": "critical|warning|success|info", "title": "string", "description": "string", "branches": ["branch1"], "products": ["product1"]}
  ],
  "commonIssues": [
    {"issue": "string", "frequency": number, "branches": ["branch1", "branch2"], "sections": ["Hot", "Cold"]}
  ],
  "topPerformers": [
    {"name": "string", "type": "branch|product", "avgScore": number, "note": "string"}
  ],
  "lowPerformers": [
    {"name": "string", "type": "branch|product", "avgScore": number, "criticalProducts": ["product1"], "note": "string"}
  ],
  "recommendations": [
    {"priority": "high|medium|low", "action": "string", "target": "string", "expectedImpact": "string"}
  ],
  "trends": {
    "mealServiceComparison": "string",
    "sectionComparison": "string", 
    "temperatureIssues": "string",
    "portionConsistency": "string"
  }
}

Important: Return ONLY the JSON object, no additional text or markdown formatting.`

    // Call OpenAI API
    console.log('Calling OpenAI API...')
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert food quality analyst. Analyze quality control data and provide actionable insights in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    })

    const aiResponse = completion.choices[0].message.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    const analysis = JSON.parse(aiResponse)

    // Calculate cost
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0
    const estimatedCost = (inputTokens * 0.01 / 1000) + (outputTokens * 0.03 / 1000)
    const generationTime = Date.now() - startTime

    console.log(`Analysis complete. Tokens: ${inputTokens + outputTokens}, Cost: $${estimatedCost.toFixed(4)}, Time: ${generationTime}ms`)

    // Store in cache
    await sql`
      INSERT INTO quality_analytics_cache (
        analysis_date,
        period_type,
        period_start,
        period_end,
        summary,
        insights,
        common_issues,
        recommendations,
        top_performers,
        low_performers,
        trends,
        total_submissions,
        branches_analyzed,
        generated_by,
        generation_cost,
        generation_time_ms,
        status
      ) VALUES (
        CURRENT_DATE,
        'weekly',
        ${startDateStr},
        ${endDateStr},
        ${analysis.summary},
        ${JSON.stringify(analysis.insights)}::jsonb,
        ${JSON.stringify(analysis.commonIssues || [])}::jsonb,
        ${JSON.stringify(analysis.recommendations || [])}::jsonb,
        ${JSON.stringify(analysis.topPerformers || [])}::jsonb,
        ${JSON.stringify(analysis.lowPerformers || [])}::jsonb,
        ${JSON.stringify(analysis.trends || {})}::jsonb,
        ${submissionCount},
        ${JSON.stringify(uniqueBranches)}::jsonb,
        'openai-gpt-4o',
        ${estimatedCost},
        ${generationTime},
        'completed'
      )
    `

    console.log('Weekly analysis completed and cached successfully')

    return NextResponse.json({
      success: true,
      message: 'Weekly analysis completed',
      submissionsAnalyzed: submissionCount,
      branchesAnalyzed: uniqueBranches.length,
      cost: estimatedCost,
      timeMs: generationTime,
    })

  } catch (error: any) {
    console.error('Error in weekly analysis cron:', error)
    return NextResponse.json({ 
      error: 'Failed to run weekly analysis',
      details: error.message 
    }, { status: 500 })
  }
}

