# 🚀 AI Analytics Deployment Checklist

## Pre-Deployment (Local Setup)

### 1. Database Setup
- [ ] Run migration script
  ```bash
  npm run setup:quality-analytics
  ```
- [ ] Verify table created
  ```sql
  SELECT * FROM quality_analytics_cache LIMIT 1;
  ```

### 2. Environment Variables (Local)
- [ ] Add to `.env.local`:
  ```env
  OPENAI_API_KEY=sk-proj-...
  CRON_SECRET=<random-32-byte-hex>
  ```
- [ ] Test OpenAI key is valid
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

### 3. Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to Admin → Quality Control → Analytics
- [ ] Click "Generate AI Analysis"
- [ ] Verify insights appear (may take 5-10 seconds)
- [ ] Check charts render correctly
- [ ] Test on mobile viewport
- [ ] Check browser console for errors

### 4. Code Review
- [ ] No linter errors: `npm run lint`
- [ ] All files committed to git
- [ ] Review changes in git diff

## Deployment to Vercel

### 5. Environment Variables (Production)
- [ ] Add to Vercel via CLI:
  ```bash
  vercel env add OPENAI_API_KEY
  # Paste your key when prompted
  
  vercel env add CRON_SECRET
  # Paste your secret when prompted
  ```
- [ ] Or via Vercel Dashboard:
  - Go to Project Settings → Environment Variables
  - Add `OPENAI_API_KEY` (Production, Preview, Development)
  - Add `CRON_SECRET` (Production, Preview, Development)

### 6. Deploy
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Add AI-powered quality analytics"
  git push origin main
  ```
- [ ] Deploy to production:
  ```bash
  vercel --prod
  ```
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

### 7. Verify Deployment
- [ ] Visit production URL
- [ ] Login as admin
- [ ] Navigate to Quality Control → Analytics
- [ ] Test manual analysis generation
- [ ] Verify charts display
- [ ] Check mobile responsiveness

## Post-Deployment

### 8. Verify Cron Job
- [ ] Go to Vercel Dashboard
- [ ] Navigate to your project
- [ ] Click "Cron Jobs" tab
- [ ] Verify `weekly-quality-analysis` appears
- [ ] Schedule shows: `0 2 * * 1`
- [ ] Status: Active

### 9. Test Cron Endpoint (Optional)
- [ ] Test manually:
  ```bash
  curl -X GET https://your-app.vercel.app/api/cron/weekly-quality-analysis \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
- [ ] Expected response:
  ```json
  {
    "success": true,
    "message": "Weekly analysis completed",
    "submissionsAnalyzed": 145,
    "branchesAnalyzed": 12
  }
  ```

### 10. Monitor First Week
- [ ] **Monday after deployment**: Check if cron ran
  - Vercel Dashboard → Cron Jobs → View logs
  - Should see successful execution around 2 AM UTC
- [ ] **Monday morning**: Check Analytics tab
  - Should see new weekly analysis
  - Review insights and recommendations
- [ ] **Throughout week**: Monitor costs
  ```sql
  SELECT 
    SUM(generation_cost) as total_cost,
    COUNT(*) as analysis_count
  FROM quality_analytics_cache
  WHERE created_at >= NOW() - INTERVAL '7 days';
  ```

## Validation Tests

### 11. Functional Tests
- [ ] **Manual Analysis**
  - Click "Generate AI Analysis"
  - Wait for completion (~5-10 seconds)
  - Insights appear correctly
  - Recommendations are actionable
  - Charts render properly
  
- [ ] **Cached Results**
  - Generate analysis once
  - Refresh page
  - Results load instantly (cached)
  - No duplicate OpenAI call
  
- [ ] **Different Time Periods**
  - Test "Today" period
  - Test "Last 7 days" period
  - Test "Last 30 days" period
  - Each shows correct data

- [ ] **Charts**
  - Scores over time line chart
  - Branch performance bar chart
  - Section performance chart
  - Top/bottom products lists
  - All interactive (tooltips, legends)

### 12. Security Tests
- [ ] **Authentication**
  - Logout and try to access Analytics
  - Should redirect to login
  
- [ ] **Authorization**
  - Login as non-admin user
  - Should not see "Generate Analysis" button
  
- [ ] **Cron Security**
  - Test cron endpoint without Authorization header
  - Should return 401 Unauthorized
  - Test with wrong secret
  - Should return 401 Unauthorized

### 13. Performance Tests
- [ ] **Load Times**
  - Charts load in < 1 second
  - Cached AI results load instantly
  - New AI analysis completes in < 15 seconds
  
- [ ] **Database**
  - Query analytics_cache table
  - Verify indexes exist
  - Check query performance

### 14. Error Handling
- [ ] **No Data**
  - Test with date range that has no submissions
  - Should show appropriate message
  
- [ ] **API Errors**
  - Temporarily use invalid OpenAI key
  - Should show error message (not crash)
  - Restore valid key
  
- [ ] **Network Errors**
  - Test with slow connection
  - Loading states appear correctly

## Documentation

### 15. Team Onboarding
- [ ] Share README_AI_ANALYTICS.md with team
- [ ] Walk through Analytics tab with stakeholders
- [ ] Explain how to interpret insights
- [ ] Show how to generate manual analysis
- [ ] Discuss action items from recommendations

### 16. Documentation Review
- [ ] Read AI_ANALYTICS_GUIDE.md
- [ ] Review QUALITY_ANALYTICS_SETUP.md
- [ ] Check ANALYTICS_ARCHITECTURE.md
- [ ] Verify all links work
- [ ] Update any project-specific details

## Monitoring & Maintenance

### 17. Set Up Monitoring
- [ ] **Weekly Check** (Every Monday)
  - Verify cron job ran successfully
  - Review new insights in Analytics tab
  - Check for critical issues flagged by AI
  
- [ ] **Monthly Review**
  - Check total OpenAI costs
  - Review analysis quality
  - Adjust prompts if needed
  - Evaluate ROI

### 18. Cost Monitoring
- [ ] Set up cost alert query:
  ```sql
  -- Run monthly
  SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(generation_cost) as total_cost,
    COUNT(*) as analysis_count,
    AVG(generation_cost) as avg_cost
  FROM quality_analytics_cache
  GROUP BY month
  ORDER BY month DESC;
  ```
- [ ] Expected: $0.50 - $5.00/month
- [ ] Alert if exceeds $15/month

### 19. Quality Monitoring
- [ ] **Review AI Insights**
  - Are recommendations actionable?
  - Are patterns accurately identified?
  - Are critical issues flagged correctly?
  
- [ ] **User Feedback**
  - Gather feedback from admin users
  - Note any confusion or issues
  - Track which recommendations are implemented

## Troubleshooting

### 20. Common Issues

#### Analysis Not Generating
- [ ] Check OpenAI API key is valid
- [ ] Verify user is admin
- [ ] Check browser console for errors
- [ ] Verify submissions exist for period
- [ ] Check Vercel function logs

#### Cron Job Not Running
- [ ] Verify `vercel.json` is deployed
- [ ] Check CRON_SECRET is set in Vercel
- [ ] Review Vercel Cron logs
- [ ] Test endpoint manually
- [ ] Check timezone (2 AM UTC = 6 AM UAE)

#### High Costs
- [ ] Review generation_cost in database
- [ ] Check for duplicate analyses
- [ ] Verify caching is working
- [ ] Reduce manual analysis frequency
- [ ] Consider GPT-4-turbo (cheaper)

#### Charts Not Loading
- [ ] Check browser console
- [ ] Verify API endpoint accessible
- [ ] Test SQL queries directly
- [ ] Check date range is valid
- [ ] Verify Recharts is installed

## Success Criteria

### 21. Launch Success Indicators
- [x] ✅ All tests passing
- [x] ✅ Cron job scheduled and active
- [x] ✅ Manual analysis works
- [x] ✅ Charts render correctly
- [x] ✅ Costs within budget (<$15/month)
- [x] ✅ No errors in production
- [x] ✅ Team trained on usage
- [x] ✅ Documentation complete

### 22. Week 1 Goals
- [ ] First automatic analysis completes successfully
- [ ] Admin reviews insights
- [ ] At least one recommendation implemented
- [ ] No critical errors
- [ ] User feedback collected

### 23. Month 1 Goals
- [ ] 4 automatic analyses completed
- [ ] Quality trends identified
- [ ] Improvements measured
- [ ] Cost under $15
- [ ] Team actively using insights

## Rollback Plan

### 24. If Issues Arise
- [ ] **Minor Issues**: Fix and redeploy
- [ ] **Major Issues**: Rollback deployment
  ```bash
  vercel rollback
  ```
- [ ] **Cron Issues**: Disable in Vercel Dashboard
- [ ] **Cost Issues**: Pause manual analyses
- [ ] **Data Issues**: Restore from backup

## Sign-Off

### 25. Final Approval
- [ ] Technical lead approval
- [ ] Operations manager approval
- [ ] Budget approval
- [ ] Security review complete
- [ ] Documentation approved

---

## Quick Reference

### Key URLs
- **Analytics Tab**: `/admin/quality-control` → Analytics
- **Vercel Dashboard**: https://vercel.com/dashboard
- **OpenAI Dashboard**: https://platform.openai.com/usage

### Key Commands
```bash
# Setup
npm run setup:quality-analytics

# Deploy
vercel --prod

# Test cron
curl -X GET https://your-app.vercel.app/api/cron/weekly-quality-analysis \
  -H "Authorization: Bearer $CRON_SECRET"

# Check costs
psql $POSTGRES_URL -c "SELECT SUM(generation_cost) FROM quality_analytics_cache WHERE created_at >= NOW() - INTERVAL '30 days';"
```

### Key Contacts
- **Development Team**: [Your contact]
- **Operations Lead**: [Contact]
- **Admin Users**: [Contacts]

---

## Status

- **Created**: [Date]
- **Last Updated**: [Date]
- **Deployment Date**: [Date]
- **Status**: ✅ Ready for Production

---

**Notes**: 
- This checklist should be completed in order
- Check off items as you complete them
- Document any issues or deviations
- Update this checklist based on lessons learned

**Estimated Time**: 2-3 hours for complete deployment and validation

