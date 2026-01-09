# AI-Powered Quality Analytics Guide

## Overview

The Quality Control system now includes AI-powered analytics that automatically analyze quality check submissions and provide actionable insights, trends, and recommendations.

## Features

### 🤖 AI Analysis
- **Weekly Automatic Analysis**: Runs every Monday at 2 AM UTC (4x per month)
- **Manual On-Demand Analysis**: Generate analysis for any period with a button click
- **Comprehensive Insights**: AI reads all notes, remarks, and scores to identify patterns
- **Actionable Recommendations**: Specific steps to improve quality

### 📊 SQL-Based Charts (Real-time)
- Quality scores trend over time
- Branch performance comparison
- Section performance (Hot, Cold, Bakery, Beverages)
- Meal service comparison (Breakfast vs Lunch)
- Top and bottom performing products
- Temperature compliance tracking

### 💰 Cost Optimization
- **Cached Results**: Analysis results are stored and reused
- **Weekly Schedule**: Only 4 automatic analyses per month (~$8-12/month)
- **Smart Caching**: Prevents duplicate analysis within 1 hour
- **Cost Tracking**: Each analysis logs its OpenAI API cost

## How It Works

### 1. Data Collection
The system collects from quality_checks table:
- **Structured data**: Scores (1-5), temperatures, portions, sections
- **Unstructured data**: Taste notes, appearance notes, remarks, corrective actions
- **Metadata**: Branch, meal service, product, submission date

### 2. AI Processing
Using OpenAI GPT-4o, the system:
1. Aggregates statistics (averages, low scores, high scores)
2. Analyzes all textual feedback for patterns
3. Identifies critical issues requiring attention
4. Recognizes common themes (e.g., "underseasoning", "temperature issues")
5. Highlights top and low performers
6. Generates specific, actionable recommendations

### 3. Result Storage
Analysis results are cached in `quality_analytics_cache` table:
- Summary and insights stored as JSON
- Prevents duplicate processing
- Enables fast retrieval
- Tracks generation cost and time

## Using the Analytics Tab

### Viewing Analysis

1. Navigate to **Admin → Quality Control**
2. Click the **Analytics** tab
3. Select time period (Today, Last 7 days, Last 30 days)

### Generating Manual Analysis

1. Click **"Generate AI Analysis"** button
2. Wait 5-10 seconds for processing
3. View insights, recommendations, and charts

### Understanding the Output

#### Executive Summary
- 2-3 sentence overview of quality status
- Key takeaways from the period

#### Key Insights
Color-coded by severity:
- 🔴 **Critical**: Urgent issues requiring immediate action
- 🟡 **Warning**: Concerns that need attention
- 🟢 **Success**: Positive achievements
- 🔵 **Info**: Notable observations

#### Common Issues
- Recurring problems across submissions
- Frequency count
- Affected branches/sections

#### Top Performers
- Branches or products with excellent quality
- Average scores and notes

#### Needs Improvement
- Underperforming branches or products
- Specific areas for focus

#### Recommendations
Prioritized action items:
- **High Priority**: Urgent actions
- **Medium Priority**: Important improvements
- **Low Priority**: Nice-to-have enhancements

## Weekly Automation

### Schedule
- **Frequency**: Every Monday at 2:00 AM UTC
- **Coverage**: Previous 7 days of submissions
- **Automatic**: No manual intervention needed

### Cron Configuration
Located in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-quality-analysis",
      "schedule": "0 2 * * 1"
    }
  ]
}
```

### Monitoring
Check cron execution:
1. Go to Vercel Dashboard → Your Project
2. Click **Cron Jobs** tab
3. View execution history and logs

## API Endpoints

### Generate Analysis (Manual)
```
POST /api/quality-checks/analyze
Body: {
  "periodType": "daily" | "weekly" | "monthly",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-01-08T00:00:00Z"
}
```

### Get Cached Analysis
```
GET /api/quality-checks/analyze?periodType=weekly&latest=true
GET /api/quality-checks/analyze?periodType=weekly&startDate=2026-01-01&endDate=2026-01-08
```

### Get Chart Data
```
GET /api/quality-checks/analytics?startDate=2026-01-01T00:00:00Z&endDate=2026-01-08T00:00:00Z
```

### Weekly Cron (Automatic)
```
GET /api/cron/weekly-quality-analysis
Headers: Authorization: Bearer <CRON_SECRET>
```

## Cost Breakdown

### Per Analysis
- **Input tokens**: ~2,000-3,000 tokens
- **Output tokens**: ~1,000-1,500 tokens
- **Cost per analysis**: $0.02-0.04
- **Time**: 3-7 seconds

### Monthly Costs
- **Weekly automatic**: 4 analyses × $0.03 = ~$0.12/month
- **Manual analyses**: Variable (depends on usage)
- **Estimated total**: $5-15/month (including occasional manual runs)

### Cost Tracking
Each analysis logs:
- `generation_cost`: Estimated OpenAI API cost
- `generation_time_ms`: Processing time
- `total_submissions`: Number of submissions analyzed

Query costs:
```sql
SELECT 
  SUM(generation_cost) as total_cost,
  COUNT(*) as analysis_count,
  AVG(generation_cost) as avg_cost_per_analysis
FROM quality_analytics_cache
WHERE created_at >= NOW() - INTERVAL '30 days';
```

## Database Schema

### quality_analytics_cache
```sql
CREATE TABLE quality_analytics_cache (
  id SERIAL PRIMARY KEY,
  analysis_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- AI-generated insights
  summary TEXT NOT NULL,
  insights JSONB NOT NULL,
  common_issues JSONB,
  recommendations JSONB,
  top_performers JSONB,
  low_performers JSONB,
  trends JSONB,
  
  -- Metadata
  total_submissions INTEGER,
  branches_analyzed TEXT[],
  generated_by VARCHAR(50) DEFAULT 'openai-gpt-4',
  generation_cost DECIMAL(10, 4),
  generation_time_ms INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(period_type, period_start, period_end)
);
```

## Setup Instructions

### 1. Create Database Table
```bash
npm run tsx scripts/create-quality-analytics-table.ts
```

### 2. Set Environment Variables
Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...your-key...
CRON_SECRET=your-random-secret-string
```

Generate CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Configure Vercel Cron
1. Go to Vercel Dashboard → Project Settings
2. Navigate to **Environment Variables**
3. Add `CRON_SECRET` with the same value as local
4. Cron jobs will automatically start based on `vercel.json`

### 5. Test Manual Analysis
1. Go to Quality Control → Analytics tab
2. Click "Generate AI Analysis"
3. Verify insights appear

## Troubleshooting

### Analysis Not Generating
- Check OpenAI API key is valid
- Verify there are submissions in the selected period
- Check browser console for errors

### Cron Job Not Running
- Verify `vercel.json` is deployed
- Check Vercel Dashboard → Cron Jobs for execution logs
- Ensure `CRON_SECRET` environment variable is set

### High Costs
- Review `generation_cost` in database
- Reduce manual analysis frequency
- Consider using GPT-4-turbo instead of GPT-4o (cheaper)

### Slow Performance
- Charts load instantly (SQL-based)
- AI analysis takes 5-10 seconds (normal)
- Use cached results when available

## Future Enhancements

### Potential Improvements
1. **Photo Analysis**: Use GPT-4 Vision to analyze food photos
2. **Email Reports**: Send weekly summary to managers
3. **Predictive Analytics**: Predict which branches need attention
4. **Sentiment Analysis**: Track mood/tone in remarks over time
5. **Comparative Analysis**: Compare current week vs previous weeks
6. **Custom Alerts**: Notify when critical issues detected

### Model Options
- **GPT-4o**: Current (best quality, $$$)
- **GPT-4-turbo**: Cheaper alternative ($$)
- **Claude 3.5 Sonnet**: Better for long contexts ($$)
- **GPT-3.5-turbo**: Budget option ($)

## Support

For issues or questions:
1. Check logs in Vercel Dashboard
2. Review database entries in `quality_analytics_cache`
3. Test API endpoints directly
4. Contact development team

## Summary

The AI Analytics system provides:
- ✅ Automatic weekly insights (4x/month)
- ✅ Manual on-demand analysis
- ✅ Cost-effective ($5-15/month)
- ✅ Actionable recommendations
- ✅ Real-time charts
- ✅ Cached results for speed
- ✅ Full audit trail

This system helps identify quality issues early, recognize patterns, and take proactive steps to maintain high food quality standards across all branches.

