'use client'

import { scaleQuantity, formatNumber } from '@/lib/yield-utils'

interface ScaledQuantityProps {
  quantity: number | string
  multiplier: number
  unit?: string
  className?: string
  showBase?: boolean
}

/**
 * Displays a quantity that may be scaled by a multiplier.
 * Shows the scaled value prominently with the base value in parentheses when scaled.
 */
export function ScaledQuantity({ 
  quantity, 
  multiplier, 
  unit = '',
  className = '',
  showBase = true
}: ScaledQuantityProps) {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity
  const isScaled = multiplier !== 1
  const scaledValue = scaleQuantity(numQuantity, multiplier)

  if (!isScaled) {
    return (
      <span className={className}>
        {formatNumber(numQuantity)}
        {unit && <span className="ml-1">{unit}</span>}
      </span>
    )
  }

  return (
    <span className={`${className}`}>
      <span className="font-semibold text-primary">{formatNumber(scaledValue)}</span>
      {unit && <span className="ml-1">{unit}</span>}
      {showBase && (
        <span className="ml-1.5 text-xs text-muted-foreground">
          (base: {formatNumber(numQuantity)})
        </span>
      )}
    </span>
  )
}

interface ScaledQuantityTableCellProps {
  quantity: number | string
  multiplier: number
  className?: string
}

/**
 * A table cell version of ScaledQuantity optimized for ingredient tables.
 * Shows the scaled value in the main cell with base value below when scaled.
 */
export function ScaledQuantityTableCell({ 
  quantity, 
  multiplier,
  className = ''
}: ScaledQuantityTableCellProps) {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity
  const isScaled = multiplier !== 1
  const scaledValue = scaleQuantity(numQuantity, multiplier)

  if (!isScaled) {
    return (
      <span className={`font-mono ${className}`}>
        {formatNumber(numQuantity)}
      </span>
    )
  }

  return (
    <div className={`${className}`}>
      <span className="font-mono font-semibold text-primary">{formatNumber(scaledValue)}</span>
      <div className="text-xs text-muted-foreground mt-0.5">
        base: {formatNumber(numQuantity)}
      </div>
    </div>
  )
}

