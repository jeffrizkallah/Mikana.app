import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function createQualityAnalyticsTable() {
  console.log('🚀 Creating quality_analytics_cache table in Postgres...\n')

  try {
    // ==========================================
    // QUALITY ANALYTICS CACHE TABLE
    // ==========================================
    console.log('📋 Creating quality_analytics_cache table...')
    await sql`
      CREATE TABLE IF NOT EXISTS quality_analytics_cache (
        id SERIAL PRIMARY KEY,
        analysis_date DATE NOT NULL,
        period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        
        -- AI-generated insights
        summary TEXT NOT NULL,
        insights JSONB NOT NULL, -- Array of insight objects
        common_issues JSONB, -- Array of common issue patterns
        recommendations JSONB, -- Array of actionable recommendations
        top_performers JSONB, -- Array of top performing branches/products
        low_performers JSONB, -- Array of underperforming branches/products
        trends JSONB, -- Trend analysis data
        
        -- Metadata
        total_submissions INTEGER,
        branches_analyzed TEXT[],
        generated_by VARCHAR(50) DEFAULT 'openai-gpt-4',
        generation_cost DECIMAL(10, 4), -- Track API cost
        generation_time_ms INTEGER, -- Performance tracking
        
        -- Status
        status VARCHAR(50) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
        error_message TEXT,
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure one analysis per period
        UNIQUE(period_type, period_start, period_end)
      )
    `
    console.log('✓ quality_analytics_cache table created\n')

    // Create indexes
    console.log('📋 Creating indexes...')
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_date ON quality_analytics_cache(analysis_date DESC)`
    console.log('  ✓ idx_analytics_date')
    
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_period ON quality_analytics_cache(period_type, period_start, period_end)`
    console.log('  ✓ idx_analytics_period')
    
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_status ON quality_analytics_cache(status)`
    console.log('  ✓ idx_analytics_status')

    console.log('\n═'.repeat(50))
    console.log('✅ Quality analytics cache table created successfully!')
    console.log('═'.repeat(50))
    console.log('\n📊 Table created:')
    console.log('   - quality_analytics_cache')
    console.log('\n📊 Indexes created:')
    console.log('   - idx_analytics_date')
    console.log('   - idx_analytics_period')
    console.log('   - idx_analytics_status')

  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  }
}

// Run the migration
createQualityAnalyticsTable()
  .then(() => {
    console.log('\n🎉 Quality analytics database setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Setup error:', error)
    process.exit(1)
  })

