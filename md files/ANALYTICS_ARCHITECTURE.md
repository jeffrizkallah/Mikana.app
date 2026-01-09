# Quality Analytics System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │         Quality Control Admin Page                             │ │
│  │  ┌──────────┐  ┌─────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Overview │  │ Submissions │  │      Analytics Tab       │ │ │
│  │  └──────────┘  └─────────────┘  └──────────────────────────┘ │ │
│  │                                           │                     │ │
│  │                                           │                     │ │
│  │                              ┌────────────▼──────────────┐     │ │
│  │                              │ QualityAnalytics.tsx      │     │ │
│  │                              │ - AI Insights Display     │     │ │
│  │                              │ - Chart Components        │     │ │
│  │                              │ - Generate Button         │     │ │
│  │                              └────────────┬──────────────┘     │ │
│  └─────────────────────────────────────────┼────────────────────┘ │
└────────────────────────────────────────────┼──────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         │                     │
                    ▼                         ▼                     ▼
        ┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
        │  GET /analytics     │  │  POST /analyze       │  │  GET /analyze│
        │  (Chart Data)       │  │  (Generate AI)       │  │  (Get Cached)│
        └─────────────────────┘  └──────────────────────┘  └──────────────┘
                    │                         │                     │
                    │                         │                     │
                    ▼                         ▼                     ▼
        ┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
        │   SQL Queries       │  │   OpenAI GPT-4o      │  │   Database   │
        │   - Aggregations    │  │   - Analyze Data     │  │   - Cache    │
        │   - Real-time       │  │   - Generate JSON    │  │   - Retrieve │
        └─────────────────────┘  └──────────────────────┘  └──────────────┘
                    │                         │                     
                    │                         │                     
                    ▼                         ▼                     
        ┌─────────────────────────────────────────────────────────┐
        │              PostgreSQL Database (Vercel)                │
        │  ┌────────────────────┐  ┌──────────────────────────┐  │
        │  │ quality_checks     │  │ quality_analytics_cache  │  │
        │  │ - submissions      │  │ - AI insights            │  │
        │  │ - scores           │  │ - recommendations        │  │
        │  │ - notes            │  │ - metadata               │  │
        │  │ - remarks          │  │ - costs                  │  │
        │  └────────────────────┘  └──────────────────────────┘  │
        └─────────────────────────────────────────────────────────┘
                                              ▲
                                              │
                                              │
                    ┌─────────────────────────┴─────────────────────┐
                    │         Vercel Cron Job (Weekly)              │
                    │  ┌──────────────────────────────────────────┐ │
                    │  │ /api/cron/weekly-quality-analysis        │ │
                    │  │ - Schedule: Every Monday 2 AM UTC        │ │
                    │  │ - Analyzes last 7 days                   │ │
                    │  │ - Calls OpenAI                           │ │
                    │  │ - Stores in cache                        │ │
                    │  └──────────────────────────────────────────┘ │
                    └────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Manual Analysis Flow

```
User Action: Click "Generate AI Analysis"
│
├─► Frontend (QualityAnalytics.tsx)
│   └─► POST /api/quality-checks/analyze
│       Body: { periodType, startDate, endDate }
│
├─► Backend (analyze/route.ts)
│   ├─► Check cache (< 1 hour old?)
│   │   ├─► YES: Return cached result ✓
│   │   └─► NO: Continue ↓
│   │
│   ├─► Fetch submissions from quality_checks
│   │   └─► Filter by date range
│   │
│   ├─► Calculate statistics
│   │   ├─► Average scores
│   │   ├─► Low/high score counts
│   │   ├─► Branch performance
│   │   └─► Prepare textual data
│   │
│   ├─► Build AI prompt
│   │   ├─► Include statistics
│   │   ├─► Include notes/remarks
│   │   └─► Request JSON format
│   │
│   ├─► Call OpenAI API
│   │   ├─► Model: gpt-4o
│   │   ├─► Temperature: 0.7
│   │   ├─► Max tokens: 2500
│   │   └─► Response format: JSON
│   │
│   ├─► Parse AI response
│   │   ├─► Extract insights
│   │   ├─► Extract recommendations
│   │   └─► Extract trends
│   │
│   ├─► Calculate cost
│   │   ├─► Input tokens × $0.01/1K
│   │   └─► Output tokens × $0.03/1K
│   │
│   └─► Store in quality_analytics_cache
│       ├─► Save JSON results
│       ├─► Save metadata
│       └─► Save cost/time
│
└─► Frontend receives response
    ├─► Display AI insights
    ├─► Show recommendations
    └─► Render charts
```

### 2. Automatic Weekly Analysis Flow

```
Vercel Cron Trigger: Monday 2 AM UTC
│
├─► Vercel Cron Service
│   └─► GET /api/cron/weekly-quality-analysis
│       Header: Authorization: Bearer <CRON_SECRET>
│
├─► Backend (weekly-quality-analysis/route.ts)
│   ├─► Verify CRON_SECRET
│   │   ├─► Invalid: Return 401 ✗
│   │   └─► Valid: Continue ↓
│   │
│   ├─► Calculate date range
│   │   ├─► End: Today
│   │   └─► Start: 7 days ago
│   │
│   ├─► Check if analysis exists
│   │   ├─► YES: Skip (return success) ✓
│   │   └─► NO: Continue ↓
│   │
│   ├─► Fetch submissions
│   │   └─► Last 7 days from quality_checks
│   │
│   ├─► Calculate statistics
│   │   └─► Same as manual flow
│   │
│   ├─► Build AI prompt
│   │   └─► Same as manual flow
│   │
│   ├─► Call OpenAI API
│   │   └─► Same as manual flow
│   │
│   ├─► Store results in cache
│   │   └─► quality_analytics_cache table
│   │
│   └─► Log execution
│       ├─► Submissions analyzed
│       ├─► Cost incurred
│       └─► Time taken
│
└─► Cron job completes
    └─► Results available in Analytics tab
```

### 3. Chart Data Flow (Real-time)

```
User Opens Analytics Tab
│
├─► Frontend (QualityAnalytics.tsx)
│   └─► GET /api/quality-checks/analytics
│       Query: ?startDate=...&endDate=...
│
├─► Backend (analytics/route.ts)
│   ├─► Execute SQL queries (parallel)
│   │   ├─► Scores over time (daily avg)
│   │   ├─► Branch performance
│   │   ├─► Section performance
│   │   ├─► Meal service comparison
│   │   ├─► Top products
│   │   ├─► Bottom products
│   │   └─► Temperature compliance
│   │
│   └─► Return aggregated data
│       └─► JSON response
│
└─► Frontend renders charts
    ├─► Line chart (scores over time)
    ├─► Bar charts (performance)
    ├─► Lists (top/bottom products)
    └─► All render instantly (no AI delay)
```

## Component Architecture

### QualityAnalytics.tsx Structure

```
QualityAnalytics Component
│
├─► State Management
│   ├─► analyticsData (SQL charts)
│   ├─► aiAnalysis (AI insights)
│   ├─► loading (boolean)
│   ├─► generatingAI (boolean)
│   └─► expandedSections (object)
│
├─► Data Fetching (useEffect)
│   ├─► fetchAnalyticsData() → SQL charts
│   └─► fetchAIAnalysis() → Cached AI results
│
├─► User Actions
│   ├─► generateAIAnalysis() → Manual trigger
│   └─► toggleSection() → Expand/collapse
│
└─► Render Structure
    │
    ├─► AI Analysis Card
    │   ├─► Header (title + generate button)
    │   ├─► Executive Summary
    │   ├─► Key Insights (color-coded)
    │   ├─► Common Issues
    │   ├─► Top/Low Performers
    │   └─► Recommendations
    │
    └─► Charts Section
        ├─► Scores Over Time (LineChart)
        ├─► Branch Performance (BarChart)
        ├─► Section Performance (BarChart)
        ├─► Meal Service Comparison (BarChart)
        ├─► Top Products (List)
        └─► Bottom Products (List)
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     quality_checks                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id, branch_slug, submitted_by, submission_date     │    │
│  │ meal_service, product_name, section                │    │
│  │ taste_score, appearance_score                      │    │
│  │ portion_qty_gm, temp_celsius                       │    │
│  │ taste_notes, appearance_notes, remarks             │    │
│  │ corrective_action_taken, corrective_action_notes   │    │
│  │ photos, custom_fields, status                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Analyzed by AI
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                quality_analytics_cache                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id, analysis_date, period_type                     │    │
│  │ period_start, period_end                           │    │
│  │ summary (TEXT)                                     │    │
│  │ insights (JSONB)                                   │    │
│  │ common_issues (JSONB)                              │    │
│  │ recommendations (JSONB)                            │    │
│  │ top_performers (JSONB)                             │    │
│  │ low_performers (JSONB)                             │    │
│  │ trends (JSONB)                                     │    │
│  │ total_submissions, branches_analyzed               │    │
│  │ generation_cost, generation_time_ms                │    │
│  │ status, error_message                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Retrieved by
                            │
                            ▼
                    ┌───────────────┐
                    │   Frontend    │
                    │  (Analytics   │
                    │     Tab)      │
                    └───────────────┘
```

## API Request/Response Flow

### POST /api/quality-checks/analyze

```
Request:
┌──────────────────────────────────┐
│ POST /api/quality-checks/analyze │
├──────────────────────────────────┤
│ Headers:                         │
│   Content-Type: application/json │
│   Cookie: next-auth.session-token│
├──────────────────────────────────┤
│ Body:                            │
│ {                                │
│   "periodType": "weekly",        │
│   "startDate": "2026-01-01...",  │
│   "endDate": "2026-01-08..."     │
│ }                                │
└──────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│ Backend Processing               │
├──────────────────────────────────┤
│ 1. Authenticate user             │
│ 2. Check cache                   │
│ 3. Fetch submissions             │
│ 4. Calculate stats               │
│ 5. Call OpenAI                   │
│ 6. Store results                 │
└──────────────────────────────────┘
                │
                ▼
Response:
┌──────────────────────────────────┐
│ 200 OK                           │
├──────────────────────────────────┤
│ {                                │
│   "success": true,               │
│   "cached": false,               │
│   "analysis": {                  │
│     "summary": "...",            │
│     "insights": [...],           │
│     "recommendations": [...],    │
│     "metadata": {                │
│       "totalSubmissions": 145,   │
│       "generationCost": 0.0234   │
│     }                            │
│   }                              │
│ }                                │
└──────────────────────────────────┘
```

## Cron Job Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Cron Job Scheduler                    │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ Schedule: 0 2 * * 1 (Every Monday 2 AM UTC) │ │    │
│  │  │ Path: /api/cron/weekly-quality-analysis     │ │    │
│  │  │ Method: GET                                  │ │    │
│  │  │ Headers: Authorization: Bearer <SECRET>     │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Triggers
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Your Next.js Application                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /api/cron/weekly-quality-analysis/route.ts       │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ 1. Verify CRON_SECRET                       │ │    │
│  │  │ 2. Calculate date range (last 7 days)       │ │    │
│  │  │ 3. Check if analysis exists                 │ │    │
│  │  │ 4. Fetch submissions                        │ │    │
│  │  │ 5. Call OpenAI                              │ │    │
│  │  │ 6. Store in cache                           │ │    │
│  │  │ 7. Return success/failure                   │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Logs to
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel Logs Dashboard                      │
│  - Execution time                                           │
│  - Success/failure status                                   │
│  - Error messages (if any)                                  │
│  - Response payload                                         │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                              │
│  Layer 1: Authentication (NextAuth)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - User must be logged in                           │    │
│  │ - Session token validated                          │    │
│  │ - Role checked (admin/operations_lead only)        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 2: API Authorization                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - POST /analyze: Admin only                        │    │
│  │ - GET /analyze: Authenticated users                │    │
│  │ - GET /analytics: Authenticated users              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 3: Cron Security                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - CRON_SECRET verification                         │    │
│  │ - Bearer token in Authorization header             │    │
│  │ - Rejects unauthorized requests                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 4: Data Security                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - OpenAI API key stored in env vars                │    │
│  │ - Database credentials secured by Vercel           │    │
│  │ - No sensitive data in frontend                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              Performance Optimizations                       │
│                                                              │
│  1. Caching Strategy                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - AI results cached in database                    │    │
│  │ - 1-hour freshness check                           │    │
│  │ - Prevents duplicate OpenAI calls                  │    │
│  │ - Instant retrieval for users                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  2. SQL Optimization                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - Indexed columns (date, branch, status)           │    │
│  │ - Aggregations at database level                   │    │
│  │ - Parallel query execution                         │    │
│  │ - Charts render instantly                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  3. Frontend Optimization                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - Lazy loading of chart components                 │    │
│  │ - Collapsible sections                             │    │
│  │ - Responsive design                                │    │
│  │ - Loading states                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  4. API Optimization                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ - JSON response format                             │    │
│  │ - Efficient token usage                            │    │
│  │ - Error handling                                   │    │
│  │ - Cost tracking                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Vercel Edge Network                   │    │
│  │  - Global CDN                                      │    │
│  │  - Auto-scaling                                    │    │
│  │  - Zero-downtime deployments                       │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js Application (Serverless)           │    │
│  │  - API Routes                                      │    │
│  │  - React Components                                │    │
│  │  - Server-side rendering                           │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│           ┌───────────────┼───────────────┐                │
│           │               │               │                │
│           ▼               ▼               ▼                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │   Vercel     │ │   OpenAI     │ │   Vercel     │      │
│  │  Postgres    │ │     API      │ │    Cron      │      │
│  │  Database    │ │              │ │   Service    │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:

✅ **Scalability**: Serverless functions auto-scale
✅ **Reliability**: Caching prevents failures
✅ **Performance**: SQL charts instant, AI cached
✅ **Security**: Multi-layer authentication
✅ **Cost-Effective**: Smart caching reduces API calls
✅ **Maintainability**: Clear separation of concerns
✅ **Monitoring**: Cost and performance tracking

The system is production-ready and designed to handle growth as your quality control program expands.

