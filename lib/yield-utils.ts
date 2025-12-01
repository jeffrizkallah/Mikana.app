/**
 * Utility functions for parsing and scaling recipe yields
 */

export interface ParsedYield {
  value: number
  unit: string
  originalString: string
}

/**
 * Parse a yield string like "1 KG", "60 pieces", "1 Pizza (23cm)" into components
 */
export function parseYield(yieldString: string): ParsedYield {
  if (!yieldString) {
    return { value: 1, unit: '', originalString: '' }
  }

  const trimmed = yieldString.trim()
  
  // Match patterns like "1 KG", "60 pieces", "1 Pizza (23cm)", "1 portion"
  // Pattern: number (with optional decimal) followed by rest as unit
  const match = trimmed.match(/^([\d.]+)\s*(.*)$/)
  
  if (match) {
    const value = parseFloat(match[1])
    const unit = match[2].trim() || 'unit'
    return {
      value: isNaN(value) ? 1 : value,
      unit,
      originalString: trimmed
    }
  }

  // If no number found, assume value is 1
  return {
    value: 1,
    unit: trimmed,
    originalString: trimmed
  }
}

/**
 * Calculate the multiplier needed to scale from base yield to target yield
 */
export function calculateMultiplier(baseYield: ParsedYield, targetValue: number): number {
  if (baseYield.value === 0) return 1
  return targetValue / baseYield.value
}

/**
 * Scale a numeric quantity by a multiplier
 * Handles string quantities that may contain numbers
 */
export function scaleQuantity(quantity: number | string, multiplier: number): number {
  const numValue = typeof quantity === 'string' ? parseFloat(quantity) : quantity
  if (isNaN(numValue)) return 0
  
  const scaled = numValue * multiplier
  
  // Round to reasonable precision (up to 2 decimal places, but remove trailing zeros)
  return Math.round(scaled * 100) / 100
}

/**
 * Format a scaled quantity for display
 * Shows the scaled value prominently with the base value in parentheses
 */
export function formatScaledQuantity(
  baseQuantity: number | string, 
  multiplier: number,
  showBase: boolean = true
): { scaled: string; base: string; isScaled: boolean } {
  const numBase = typeof baseQuantity === 'string' ? parseFloat(baseQuantity) : baseQuantity
  const scaled = scaleQuantity(baseQuantity, multiplier)
  const isScaled = multiplier !== 1
  
  return {
    scaled: formatNumber(scaled),
    base: formatNumber(numBase),
    isScaled
  }
}

/**
 * Format a number for display (remove unnecessary decimals)
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return '0'
  
  // If it's a whole number, show without decimals
  if (Number.isInteger(num)) {
    return num.toString()
  }
  
  // Otherwise show up to 2 decimal places, removing trailing zeros
  return num.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * Format the multiplier for display (e.g., "×10", "×2.5")
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 1) return ''
  return `×${formatNumber(multiplier)}`
}

/**
 * Format a scaled yield string (e.g., "10 KG" from base "1 KG")
 */
export function formatScaledYield(baseYield: ParsedYield, targetValue: number): string {
  return `${formatNumber(targetValue)} ${baseYield.unit}`
}

