# Troubleshooting AI Analytics

## Error: "Failed to generate analysis"

When you see this error, the new error messages will now tell you the actual cause. Here are the most common issues and solutions:

### 1. ❌ "OPENAI_API_KEY environment variable is not set"

**Problem**: OpenAI API key is missing

**Solution**:
```bash
# Add to .env.local
OPENAI_API_KEY=sk-proj-your-key-here
```

Get your key from: https://platform.openai.com/api-keys

### 2. ❌ "No quality check data found"

**Problem**: No submissions exist for the selected date range

**Solution**:
- Change the date range filter (Today/Last 7 days/Last 30 days)
- Or add quality check submissions first from the Submissions tab
- Make sure the date range includes actual submission dates

### 3. ❌ "OpenAI API error: ... Check your API key and billing status"

**Problem**: OpenAI API key is invalid or account has no credits

**Solution**:
1. Verify your API key is correct at https://platform.openai.com/api-keys
2. Check billing: https://platform.openai.com/account/billing
3. Add payment method if needed
4. Ensure you have credits/budget available

### 4. ❌ "Table 'quality_analytics_cache' does not exist"

**Problem**: Database table not created yet

**Solution**:
```bash
npm run setup:quality-analytics
```

### 5. ❌ "OpenAI returned invalid JSON"

**Problem**: OpenAI's response couldn't be parsed (rare, usually temporary)

**Solution**:
- Wait a few seconds and try again
- This is usually a temporary OpenAI issue

## Checking Logs

### Browser Console (F12)
The error will now show in the browser console with full details. Press F12 and check the Console tab.

### Server Logs
If running locally:
```bash
# Check your terminal running `npm run dev`
# Look for "Error generating analysis:" messages
```

If on Vercel:
- Go to Vercel Dashboard → Your Project → Logs
- Filter by "Functions" to see API route errors

## Testing the Setup

### Test 1: Check Database Table
```sql
-- Run this query in your database
SELECT COUNT(*) FROM quality_analytics_cache;
```

If error "relation does not exist", run:
```bash
npm run setup:quality-analytics
```

### Test 2: Check OpenAI Key
```bash
# Test OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

Should return a list of models. If error, your key is invalid.

### Test 3: Check Quality Submissions Exist
```sql
-- Check if there are any submissions
SELECT 
  COUNT(*) as total,
  MIN(submission_date) as oldest,
  MAX(submission_date) as newest
FROM quality_checks;
```

### Test 4: Test API Endpoint Directly
```bash
# Test the analyze endpoint
curl -X POST http://localhost:3000/api/quality-checks/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "periodType": "weekly",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-01-08T00:00:00Z"
  }'
```

## Quick Fixes

### Fix 1: Ensure Everything is Set Up
```bash
# 1. Create database table
npm run setup:quality-analytics

# 2. Add environment variables to .env.local
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env.local
echo "CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env.local

# 3. Restart dev server
npm run dev
```

### Fix 2: Verify Data Exists
1. Go to Admin → Quality Control → Submissions tab
2. Make sure there are submissions in your selected date range
3. If not, either:
   - Add submissions manually
   - Change date range to include existing submissions

### Fix 3: Check OpenAI Billing
1. Go to https://platform.openai.com/account/billing
2. Ensure you have:
   - A payment method added
   - Available credits or monthly budget
   - No past-due invoices

## Still Having Issues?

If none of the above helps:

1. **Check browser console** (F12) for the detailed error message
2. **Check server logs** for backend errors
3. **Verify all environment variables** are set correctly
4. **Restart your development server** after changing .env.local
5. **Check database connection** is working

### Get Help

1. Review setup guide: `QUALITY_ANALYTICS_SETUP.md`
2. Check implementation details: `AI_ANALYTICS_IMPLEMENTATION_SUMMARY.md`
3. Review the error message shown in the browser alert

## Common Environment Variable Issues

### On Vercel (Production)
Make sure BOTH environment variables are set:
```
OPENAI_API_KEY=sk-proj-...
CRON_SECRET=...
```

Set them in:
- Vercel Dashboard → Project → Settings → Environment Variables
- Add for: Production, Preview, Development

### On Local (Development)
File: `.env.local`
```env
OPENAI_API_KEY=sk-proj-...
CRON_SECRET=...
POSTGRES_URL=... (should already exist)
```

**Important**: Restart dev server after changing .env.local!

## Success Indicators

You'll know it's working when:
- ✅ Click "Generate AI Analysis" button
- ✅ See "Analyzing..." for 5-10 seconds
- ✅ AI insights appear with summary
- ✅ Recommendations show up
- ✅ No error alerts

## Cost Monitoring

Each successful analysis costs ~$0.05-0.07. If you're getting charged but no results:
- Check OpenAI usage dashboard
- Look for failed API calls
- Verify error messages in logs

---

**Note**: After fixing any issues, try clicking "Generate AI Analysis" again. The new error messages will now show you exactly what went wrong!

