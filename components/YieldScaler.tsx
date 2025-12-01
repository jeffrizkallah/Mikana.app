'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scale, RotateCcw, Plus, Minus, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { parseYield, formatMultiplier, formatNumber, type ParsedYield } from '@/lib/yield-utils'

interface YieldScalerProps {
  baseYield: string
  onMultiplierChange: (multiplier: number, targetValue: number) => void
  className?: string
}

export function YieldScaler({ baseYield, onMultiplierChange, className = '' }: YieldScalerProps) {
  const parsedBase = parseYield(baseYield)
  const [targetValue, setTargetValue] = useState<number>(parsedBase.value)
  const [inputValue, setInputValue] = useState<string>(formatNumber(parsedBase.value))

  // Calculate multiplier
  const multiplier = parsedBase.value > 0 ? targetValue / parsedBase.value : 1
  const isScaled = multiplier !== 1

  // Notify parent of multiplier changes
  useEffect(() => {
    onMultiplierChange(multiplier, targetValue)
  }, [multiplier, targetValue, onMultiplierChange])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setTargetValue(numValue)
    }
  }

  // Handle input blur - ensure valid value
  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue)
    if (isNaN(numValue) || numValue <= 0) {
      setTargetValue(parsedBase.value)
      setInputValue(formatNumber(parsedBase.value))
    } else {
      setInputValue(formatNumber(numValue))
    }
  }

  // Increment/decrement handlers
  const increment = () => {
    const newValue = targetValue + parsedBase.value
    setTargetValue(newValue)
    setInputValue(formatNumber(newValue))
  }

  const decrement = () => {
    const newValue = Math.max(parsedBase.value, targetValue - parsedBase.value)
    setTargetValue(newValue)
    setInputValue(formatNumber(newValue))
  }

  // Quick multiplier buttons
  const applyQuickMultiplier = (mult: number) => {
    const newValue = parsedBase.value * mult
    setTargetValue(newValue)
    setInputValue(formatNumber(newValue))
  }

  // Reset to base
  const reset = () => {
    setTargetValue(parsedBase.value)
    setInputValue(formatNumber(parsedBase.value))
  }

  return (
    <Card className={`border-2 ${isScaled ? 'border-primary bg-primary/5' : 'border-muted'} ${className}`}>
      <CardContent className="py-4">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Scale Recipe</h3>
            </div>
            {isScaled && (
              <Badge variant="default" className="bg-primary text-primary-foreground text-sm px-3 py-1">
                {formatMultiplier(multiplier)} Multiplier
              </Badge>
            )}
          </div>

          {/* Base yield info */}
          <div className="text-sm text-muted-foreground">
            Base recipe yield: <span className="font-semibold text-foreground">{baseYield}</span>
          </div>

          {/* Main control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium mb-1.5 block">Target Yield</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrement}
                  disabled={targetValue <= parsedBase.value}
                  className="h-10 w-10 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="relative flex-1 min-w-[100px]">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="text-center text-lg font-semibold pr-12 h-10"
                    min={parsedBase.value}
                    step={parsedBase.value}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {parsedBase.unit}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increment}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick multipliers */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Quick Scale</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[2, 5, 10, 15, 20].map((mult) => (
                  <Button
                    key={mult}
                    variant={multiplier === mult ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyQuickMultiplier(mult)}
                    className="h-8 px-2.5 text-xs font-medium"
                  >
                    ×{mult}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reset button */}
            {isScaled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-muted-foreground hover:text-foreground mt-auto"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
            )}
          </div>

          {/* Scaled indicator */}
          {isScaled && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Calculator className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm">
                <span className="font-medium">All quantities below are scaled to {formatNumber(targetValue)} {parsedBase.unit}</span>
                <span className="text-muted-foreground"> (base quantities shown in parentheses)</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

