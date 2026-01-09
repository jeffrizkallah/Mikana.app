# Quality Analytics Setup Guide

## Quick Setup (5 minutes)

Follow these steps to enable AI-powered analytics for your Quality Control system.

### Step 1: Create Database Table

Run the migration script to create the analytics cache table:

```bash
npm run setup:quality-analytics
```

This creates the `quality_analytics_cache` table with all necessary indexes.

### Step 2: Set Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI API Key (required for AI analysis)
OPENAI_API_KEY=sk-proj-...your-key-here...

# Cron Secret (for weekly automation security)
CRON_SECRET=your-random-secret-here
```

#### Get OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste into `.env.local`

#### Generate Cron Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Test Locally

Start your development server:

```bash
npm run dev
```

1. Navigate to **Admin → Quality Control**
2. Click the **Analytics** tab
3. Click **"Generate AI Analysis"** button
4. Wait 5-10 seconds
5. Verify insights appear

### Step 4: Deploy to Vercel

#### 4.1 Add Environment Variables to Vercel

```bash
# Using Vercel CLI
vercel env add OPENAI_API_KEY
# Paste your OpenAI key when prompted

vercel env add CRON_SECRET
# Paste your cron secret when prompted
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `OPENAI_API_KEY` (Production, Preview, Development)
4. Add `CRON_SECRET` (Production, Preview, Development)

#### 4.2 Deploy

```bash
vercel --prod
```

The `vercel.json` file is already configured with the cron schedule.

### Step 5: Verify Cron Job

1. Go to Vercel Dashboard → Your Project
2. Click **Cron Jobs** tab
3. You should see: `weekly-quality-analysis` scheduled for "0 2 * * 1"
4. Wait for Monday 2 AM UTC, or trigger manually (see below)

## Testing the Cron Job Manually

You can test the cron endpoint locally or in production:

### Local Testing

```bash
curl -X GET http://localhost:3000/api/cron/weekly-quality-analysis \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Production Testing

```bash
curl -X GET https://your-app.vercel.app/api/cron/weekly-quality-analysis \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Weekly analysis completed",
  "submissionsAnalyzed": 145,
  "branchesAnalyzed": 12,
  "cost": 0.0234,
  "timeMs": 4521
}
```

## Verification Checklist

- [ ] Database table created (`quality_analytics_cache` exists)
- [ ] Environment variables set (locally and on Vercel)
- [ ] Manual analysis works in Analytics tab
- [ ] Charts display correctly
- [ ] Cron job appears in Vercel Dashboard
- [ ] Test cron endpoint returns success

## Troubleshooting

### "Unauthorized" Error
- Check `OPENAI_API_KEY` is set correctly
- Verify API key is valid at https://platform.openai.com/api-keys

### "No data to analyze"
- Ensure there are quality check submissions in the database
- Check date range includes submissions

### Cron Job Not Running
- Verify `vercel.json` is committed and deployed
- Check `CRON_SECRET` is set in Vercel environment variables
- View logs in Vercel Dashboard → Cron Jobs

### Charts Not Loading
- Check browser console for errors
- Verify API endpoint `/api/quality-checks/analytics` is accessible
- Ensure date range is valid

### High OpenAI Costs
- Each analysis costs ~$0.02-0.04
- Weekly schedule = 4 analyses/month = ~$0.12-0.16/month
- Manual analyses add to this cost
- Monitor costs in database:
  ```sql
  SELECT SUM(generation_cost) as total_cost
  FROM quality_analytics_cache
  WHERE created_at >= NOW() - INTERVAL '30 days';
  ```

## Usage Tips

### Best Practices
1. **Use cached results**: Don't regenerate analysis unnecessarily
2. **Weekly schedule**: Let automatic analysis run on Mondays
3. **Manual analysis**: Use for specific investigations only
4. **Review insights**: Check analytics tab weekly for trends

### When to Generate Manual Analysis
- Investigating a specific quality incident
- Need analysis for custom date range
- Want immediate insights (can't wait for Monday)
- Comparing different time periods

### Cost Management
- **Weekly automatic**: ~$0.12/month
- **Daily manual**: ~$0.60/month (if done daily)
- **On-demand**: Variable based on usage
- **Recommended**: Stick to weekly automatic + occasional manual

## What's Included

### AI Analysis Provides:
- ✅ Executive summary of quality status
- ✅ Critical issues requiring attention
- ✅ Common patterns and recurring problems
- ✅ Top performing branches/products
- ✅ Underperforming areas
- ✅ Actionable recommendations
- ✅ Trend analysis

### Charts Provide:
- ✅ Quality scores over time (line chart)
- ✅ Branch performance comparison (bar chart)
- ✅ Section performance (bar chart)
- ✅ Meal service comparison (bar chart)
- ✅ Top products (list)
- ✅ Products needing attention (list)
- ✅ Temperature compliance (data table)

## Schedule Details

### Cron Schedule
- **Time**: Every Monday at 2:00 AM UTC
- **Frequency**: 4 times per month
- **Coverage**: Previous 7 days
- **Cron Expression**: `0 2 * * 1`

### Timezone Conversion
- 2 AM UTC = 6 AM UAE (Dubai time)
- Analysis ready by Monday morning

## Next Steps

After setup is complete:

1. **Week 1**: Monitor first automatic analysis on Monday
2. **Week 2**: Review insights and take action on recommendations
3. **Week 3**: Compare trends week-over-week
4. **Week 4**: Evaluate impact of improvements

## Support

For issues:
1. Check this guide's troubleshooting section
2. Review logs in Vercel Dashboard
3. Test API endpoints manually
4. Check database for cached results
5. Contact development team

## Summary

You now have:
- 🤖 AI-powered quality insights
- 📊 Real-time performance charts
- ⏰ Automatic weekly analysis
- 💰 Cost-effective solution (~$5-15/month)
- 📈 Actionable recommendations

The system will help you identify quality issues early, recognize patterns, and maintain high standards across all branches.

