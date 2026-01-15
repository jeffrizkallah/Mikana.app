'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DayData {
  date: string
  revenue: number | null // null means no data for this day
  dayOfWeek: number // 1 = Monday, 5 = Friday
  hasData: boolean
}

interface SparklineProps {
  data: number[]
  dates?: string[] // Optional dates array to match with data
  width?: number
  height?: number
  className?: string
  showDayLabels?: boolean
  excludeWeekends?: boolean
  /** 
   * Trend passed from parent - this is the single source of truth for coloring.
   * 'up' = green bars (rising)
   * 'down' = red bars (declining)  
   * 'neutral' = grey bars (steady)
   */
  trend?: 'up' | 'down' | 'neutral'
}

export function Sparkline({
  data,
  dates,
  width = 120,
  height = 40,
  className,
  showDayLabels = true,
  excludeWeekends = true,
  trend = 'neutral',
}: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("text-muted-foreground text-xs flex items-center justify-center", className)}
        style={{ width, height }}
      >
        --
      </div>
    )
  }

  // Build a map of day of week -> revenue from the input data
  const buildDayMap = (): Map<number, { revenue: number; date: string }> => {
    const dayMap = new Map<number, { revenue: number; date: string }>()
    
    for (let i = 0; i < data.length; i++) {
      let dayOfWeek: number
      let dateStr: string
      
      if (dates && dates[i]) {
        // Use provided date
        const date = new Date(dates[i])
        dayOfWeek = date.getUTCDay() // 0 = Sunday, 6 = Saturday
        dateStr = dates[i]
      } else {
        // Calculate date going back from today
        const today = new Date()
        const date = new Date(today)
        date.setDate(date.getDate() - (data.length - i))
        dayOfWeek = date.getDay()
        dateStr = date.toISOString().split('T')[0]
      }
      
      // Skip weekends if excluding
      if (excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue
      }
      
      // Store the data (if same day appears twice, use latest)
      dayMap.set(dayOfWeek, { revenue: data[i], date: dateStr })
    }
    
    return dayMap
  }

  const dayMap = buildDayMap()

  // Create ordered array for Mon-Fri (dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri)
  const weekdays = [1, 2, 3, 4, 5] // Monday to Friday
  const dayData: DayData[] = weekdays.map(dow => {
    const dayInfo = dayMap.get(dow)
    return {
      dayOfWeek: dow,
      revenue: dayInfo?.revenue ?? null,
      date: dayInfo?.date ?? '',
      hasData: dayInfo !== undefined,
    }
  })

  // Day name mapping (index = dayOfWeek from JS Date: 0=Sun, 1=Mon, etc.)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayLabelsShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Get only revenues that have data for min/max calculation
  const validRevenues = dayData.filter(d => d.hasData).map(d => d.revenue as number)
  
  if (validRevenues.length === 0) {
    return (
      <div 
        className={cn("text-muted-foreground text-xs flex items-center justify-center", className)}
        style={{ width, height }}
      >
        --
      </div>
    )
  }

  const max = Math.max(...validRevenues)

  // Normalize data from 0 to max (not min to max)
  // This way similar sales values = similar bar heights
  const normalizedData = dayData.map(d => {
    if (!d.hasData || d.revenue === null) {
      return 0.08 // Small grey bar for no data
    }
    // Normalize from 0 so bars are proportional to actual sales
    const normalized = d.revenue / max
    return Math.max(0.2, normalized) // Minimum 20% height so bars are visible
  })

  // Use the trend prop passed from parent (single source of truth)
  // This ensures the bar colors always match the status labels
  const isUpward = trend === 'up'
  const isDownward = trend === 'down'
  
  // Find the day with highest sales (for highlighting with dark color)
  const daysWithData = dayData.filter(d => d.hasData && d.revenue !== null)
  const highestSalesDay = daysWithData.reduce((best, current) => {
    if (!best || (current.revenue ?? 0) > (best.revenue ?? 0)) {
      return current
    }
    return best
  }, null as DayData | null)
  
  // Color scheme based on trend
  // Green = rising, Red = declining, Blue = steady, Grey = no data
  // Using blue for steady so it's clearly different from grey "no data" bars
  const barColor = isUpward ? 'bg-emerald-500' : isDownward ? 'bg-red-400' : 'bg-blue-400'
  const barColorLight = isUpward ? 'bg-emerald-200' : isDownward ? 'bg-red-200' : 'bg-blue-200'
  const hoverColor = isUpward ? 'bg-emerald-600' : isDownward ? 'bg-red-500' : 'bg-blue-500'
  const noDataColor = 'bg-slate-200' // Grey is ONLY for days with no sales data

  // Calculate bar dimensions
  const barGap = 3
  const labelHeight = showDayLabels ? 14 : 0
  const chartHeight = height - labelHeight
  const barWidth = (width - (dayData.length - 1) * barGap) / dayData.length

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Find the index of the highest sales day for highlighting
  const highestSalesIndex = highestSalesDay 
    ? dayData.findIndex(d => d.date === highestSalesDay.date && d.revenue === highestSalesDay.revenue)
    : -1

  return (
    <div 
      className={cn("flex flex-col relative", className)}
      style={{ width, height }}
    >
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50"
        >
          <span className="font-medium">{dayNames[dayData[hoveredIndex].dayOfWeek]}: </span>
          <span>
            {dayData[hoveredIndex].hasData 
              ? formatCurrency(dayData[hoveredIndex].revenue as number)
              : 'No sales'
            }
          </span>
        </div>
      )}

      {/* Bars */}
      <div 
        className="flex items-end"
        style={{ height: chartHeight, gap: barGap }}
      >
        {normalizedData.map((normalizedValue, index) => {
          const barHeight = normalizedValue * chartHeight
          const isHighestSales = index === highestSalesIndex
          const isHovered = hoveredIndex === index
          const hasData = dayData[index].hasData
          
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-end cursor-pointer"
              style={{ width: barWidth, height: chartHeight }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all",
                  !hasData 
                    ? noDataColor
                    : isHovered 
                      ? hoverColor 
                      : isHighestSales 
                        ? barColor 
                        : barColorLight
                )}
                style={{ 
                  height: barHeight,
                  minHeight: 4,
                }}
              />
            </div>
          )
        })}
      </div>
      
      {/* Day labels - M T W T F */}
      {showDayLabels && (
        <div 
          className="flex"
          style={{ height: labelHeight, gap: barGap }}
        >
          {dayData.map((day, index) => (
            <div
              key={index}
              className={cn(
                "text-[9px] text-center pt-0.5",
                hoveredIndex === index ? "text-slate-900 font-medium" : "text-muted-foreground"
              )}
              style={{ width: barWidth }}
            >
              {dayLabelsShort[day.dayOfWeek]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
