'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, 
  Plus, 
  Package, 
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react'
import type { BranchDispatch } from '@/lib/data'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  dispatchId: string
  branchDispatches: BranchDispatch[]
  preSelectedBranch?: string // If set, modal opens for single branch
  onItemAdded: () => void // Callback to refresh data
}

interface BranchQuantity {
  branchSlug: string
  branchName: string
  quantity: number
  selected: boolean
  canAdd: boolean // Based on status (pending/packing only)
}

const UNIT_OPTIONS = ['KG', 'Grams', 'Unit', 'Box', 'Liters']

export function AddItemModal({ 
  isOpen, 
  onClose, 
  dispatchId, 
  branchDispatches,
  preSelectedBranch,
  onItemAdded
}: AddItemModalProps) {
  // Form state
  const [itemName, setItemName] = useState('')
  const [defaultQuantity, setDefaultQuantity] = useState<number>(0)
  const [unit, setUnit] = useState('KG')
  const [reason, setReason] = useState('')
  
  // Branch selection state
  const [selectionMode, setSelectionMode] = useState<'all' | 'specific'>('all')
  const [useCustomQuantities, setUseCustomQuantities] = useState(false)
  const [branchQuantities, setBranchQuantities] = useState<BranchQuantity[]>([])
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Initialize branch quantities when modal opens or branches change
  useEffect(() => {
    if (isOpen) {
      const quantities = branchDispatches.map(bd => ({
        branchSlug: bd.branchSlug,
        branchName: bd.branchName,
        quantity: defaultQuantity,
        selected: preSelectedBranch 
          ? bd.branchSlug === preSelectedBranch 
          : true,
        canAdd: bd.status === 'pending' || bd.status === 'packing'
      }))
      setBranchQuantities(quantities)
      
      // If preselected branch, switch to specific mode
      if (preSelectedBranch) {
        setSelectionMode('specific')
      }
    }
  }, [isOpen, branchDispatches, preSelectedBranch])

  // Update all quantities when default quantity changes (if not using custom)
  useEffect(() => {
    if (!useCustomQuantities) {
      setBranchQuantities(prev => prev.map(bq => ({
        ...bq,
        quantity: defaultQuantity
      })))
    }
  }, [defaultQuantity, useCustomQuantities])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItemName('')
      setDefaultQuantity(0)
      setUnit('KG')
      setReason('')
      setSelectionMode('all')
      setUseCustomQuantities(false)
      setError('')
    }
  }, [isOpen])

  const handleBranchSelect = (branchSlug: string, selected: boolean) => {
    setBranchQuantities(prev => prev.map(bq => 
      bq.branchSlug === branchSlug ? { ...bq, selected } : bq
    ))
  }

  const handleBranchQuantityChange = (branchSlug: string, quantity: number) => {
    setBranchQuantities(prev => prev.map(bq => 
      bq.branchSlug === branchSlug ? { ...bq, quantity } : bq
    ))
  }

  const handleSelectAll = () => {
    setBranchQuantities(prev => prev.map(bq => ({
      ...bq,
      selected: bq.canAdd
    })))
  }

  const handleClearSelection = () => {
    setBranchQuantities(prev => prev.map(bq => ({
      ...bq,
      selected: false
    })))
  }

  const getSelectedBranches = () => {
    if (selectionMode === 'all') {
      return branchQuantities.filter(bq => bq.canAdd)
    }
    return branchQuantities.filter(bq => bq.selected && bq.canAdd)
  }

  const handleSubmit = async () => {
    setError('')
    
    // Validation
    if (!itemName.trim()) {
      setError('Please enter an item name')
      return
    }
    
    const selectedBranches = getSelectedBranches()
    if (selectedBranches.length === 0) {
      setError('Please select at least one branch')
      return
    }
    
    // Validate quantities
    const invalidBranches = selectedBranches.filter(b => b.quantity <= 0)
    if (invalidBranches.length > 0) {
      setError('All selected branches must have a quantity greater than 0')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/dispatch/${dispatchId}/add-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          unit,
          reason: reason.trim(),
          branches: selectedBranches.map(b => ({
            branchSlug: b.branchSlug,
            quantity: b.quantity
          }))
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add item')
      }

      // Success - refresh data and close
      onItemAdded()
      onClose()
      
    } catch (err: any) {
      setError(err.message || 'Failed to add item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedBranches = getSelectedBranches()
  const eligibleBranches = branchQuantities.filter(bq => bq.canAdd)
  const ineligibleBranches = branchQuantities.filter(bq => !bq.canAdd)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add Item to Dispatch</h2>
              <p className="text-sm text-muted-foreground">
                {preSelectedBranch 
                  ? `Adding to ${branchQuantities.find(b => b.branchSlug === preSelectedBranch)?.branchName}`
                  : 'Add new items to one or more branches'
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Branches Section - Hide if preselected */}
          {!preSelectedBranch && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Target Branches
              </h3>
              
              {/* Selection Mode */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="selectionMode" 
                    checked={selectionMode === 'all'}
                    onChange={() => setSelectionMode('all')}
                    className="w-4 h-4 text-primary"
                  />
                  <span>All Eligible Branches ({eligibleBranches.length})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="selectionMode" 
                    checked={selectionMode === 'specific'}
                    onChange={() => setSelectionMode('specific')}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Specific Branches</span>
                </label>
              </div>

              {/* Branch Selection Grid */}
              {selectionMode === 'specific' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Select branches to add the item to:
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {eligibleBranches.map(bq => (
                      <label 
                        key={bq.branchSlug}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          bq.selected 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          checked={bq.selected}
                          onCheckedChange={(checked) => handleBranchSelect(bq.branchSlug, checked as boolean)}
                        />
                        <span className="text-sm truncate">{bq.branchName}</span>
                      </label>
                    ))}
                  </div>

                  {/* Show ineligible branches */}
                  {ineligibleBranches.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Cannot add items to these branches (already dispatched or completed):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ineligibleBranches.map(bq => (
                          <Badge key={bq.branchSlug} variant="outline" className="text-muted-foreground">
                            {bq.branchName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm font-medium text-primary">
                    {selectedBranches.length} branch{selectedBranches.length !== 1 ? 'es' : ''} selected
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Item Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              📦 Item Details
            </h3>
            
            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter item name (e.g., Fruit Salad)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Quantity and Unit Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={defaultQuantity || ''}
                    onChange={(e) => setDefaultQuantity(parseFloat(e.target.value) || 0)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full h-11 px-3 border rounded-md bg-background"
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Quantities Toggle - Only show if multiple branches */}
              {selectedBranches.length > 1 && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={useCustomQuantities}
                      onCheckedChange={(checked) => setUseCustomQuantities(checked as boolean)}
                    />
                    <span className="text-sm font-medium">
                      Set different quantities for each branch
                    </span>
                  </label>

                  {useCustomQuantities && (
                    <div className="mt-4 space-y-2">
                      {selectedBranches.map(bq => (
                        <div key={bq.branchSlug} className="flex items-center gap-3">
                          <span className="text-sm flex-1 truncate">{bq.branchName}</span>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={bq.quantity || ''}
                            onChange={(e) => handleBranchQuantityChange(
                              bq.branchSlug, 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-24 h-9"
                          />
                          <span className="text-sm text-muted-foreground w-16">{unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Reason for Addition <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  placeholder="e.g., Branch manager requested for event"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {selectedBranches.length > 0 && itemName && defaultQuantity > 0 && (
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Preview
              </h4>
              <p className="text-sm text-green-800 mb-2">
                Adding "<strong>{itemName}</strong>" to:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                {selectedBranches.slice(0, 5).map(bq => (
                  <li key={bq.branchSlug} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{bq.branchName}</span>
                    <span className="text-green-600 font-medium">
                      ({bq.quantity} {unit})
                    </span>
                  </li>
                ))}
                {selectedBranches.length > 5 && (
                  <li className="text-green-600">
                    ... and {selectedBranches.length - 5} more branches
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Late Addition Notice</p>
              <p className="mt-1">
                Items added here will be marked as "Late Addition" in the packing checklist 
                and tracked separately in reports.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !itemName || selectedBranches.length === 0}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to {selectedBranches.length} Branch{selectedBranches.length !== 1 ? 'es' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
