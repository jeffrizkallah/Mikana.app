'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loadBranches } from '@/lib/data'

interface ParsedBranchData {
  branchSlug: string
  branchName: string
  items: Array<{
    name: string
    quantity: number
    unit: string
  }>
}

interface ParsedData {
  deliveryDate: string
  branches: ParsedBranchData[]
  totalItems: number
}

export default function DispatchUploadPage() {
  const [pastedData, setPastedData] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const branches = loadBranches()

  // Map Excel branch names to slugs
  const branchNameToSlug: Record<string, string> = {
    'Soufouh': 'isc-soufouh',
    'DIP': 'isc-dip',
    'Sharja': 'isc-sharja',
    'AlJada': 'isc-aljada',
    'Ajman': 'isc-ajman',
    'UEQ': 'isc-ueq',
    'RAK': 'isc-rak',
    'YAS': 'sabis-yas',
    'Ruwais': 'sis-ruwais',
    'Ain': 'isc-ain',
    'Khalifa': 'isc-khalifa',
  }

  const parseExcelData = () => {
    setError('')
    setParsedData(null)
    
    try {
      const lines = pastedData.trim().split('\n')
      if (lines.length < 2) {
        setError('Please paste data with header row and at least one item row')
        return
      }

      // First row has branch names, second row may have dates or "Total" labels
      const branchHeaderLine = lines[0]
      const secondHeaderLine = lines[1]
      const branchHeaders = branchHeaderLine.split('\t')
      const secondHeaders = secondHeaderLine.split('\t')
      
      console.log('Branch headers:', branchHeaders.slice(0, 20))
      console.log('Second row headers:', secondHeaders.slice(0, 20))
      
      // Branch names to look for
      const branchNames = Object.keys(branchNameToSlug)
      
      // Find where each branch starts and its Total column
      const branchTotalColumns: Record<string, number> = {}
      
      branchHeaders.forEach((header, index) => {
        const trimmed = header.trim()
        if (branchNames.includes(trimmed)) {
          // Found a branch, now find its Total column
          // Check same column first, then look ahead for "Total" column
          for (let i = index; i < Math.min(index + 15, secondHeaders.length); i++) {
            const cell = secondHeaders[i]?.trim() || ''
            if (cell.toLowerCase() === 'total') {
              branchTotalColumns[trimmed] = i
              console.log(`Found Total column for ${trimmed} at index ${i}`)
              break
            }
          }
        }
      })
      
      console.log('Branch Total columns:', branchTotalColumns)
      
      if (Object.keys(branchTotalColumns).length === 0) {
        setError('No branches with Total columns found. Make sure branch names like Soufouh, DIP, Sharja are in the header and each has a "Total" column.')
        return
      }

      setError('')
      alert(`✓ Data parsed successfully!\n\nFound ${Object.keys(branchTotalColumns).length} branches with Total columns.\n\nClick "Generate Dispatch Preview" to continue.`)
      
      // Set a dummy date since we're using totals
      setAvailableDates(['Weekly Total'])
      setSelectedDate('Weekly Total')
      
    } catch (err) {
      setError('Error parsing data. Please make sure you copied the correct Excel format.')
      console.error(err)
    }
  }

  const generateDispatch = () => {
    if (!selectedDate) {
      setError('Please select a delivery date')
      return
    }

    setError('')
    setLoading(true)

    try {
      const lines = pastedData.trim().split('\n')
      const branchHeaderLine = lines[0]
      const secondHeaderLine = lines[1]
      const branchHeaders = branchHeaderLine.split('\t')
      const secondHeaders = secondHeaderLine.split('\t')
      
      // Branch names to look for
      const branchNames = Object.keys(branchNameToSlug)
      
      // Find Total column for each branch
      const branchTotalColumns: Record<string, number> = {}
      
      branchHeaders.forEach((header, index) => {
        const trimmed = header.trim()
        if (branchNames.includes(trimmed)) {
          // Found a branch, now find its Total column
          // Check same column first, then look ahead for "Total" column
          for (let i = index; i < Math.min(index + 15, secondHeaders.length); i++) {
            const cell = secondHeaders[i]?.trim() || ''
            if (cell.toLowerCase() === 'total') {
              branchTotalColumns[trimmed] = i
              break
            }
          }
        }
      })

      // Parse items using Total columns
      const branchData: Record<string, Array<{ name: string, quantity: number, unit: string }>> = {}
      
      // Initialize branches
      Object.keys(branchTotalColumns).forEach(branchName => {
        branchData[branchName] = []
      })

      // Parse each item line (start from line 2, skip header rows)
      for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('\t')
        
        // Skip empty lines
        if (cells.length < 2 || !cells[1] || !cells[1].trim()) continue
        
        // Column B (index 1) = Recipe name
        const itemName = cells[1].trim()
        
        // Skip if item name is invalid
        if (!itemName || itemName === 'Recipe') continue
        
        // For each branch, get the total quantity from the Total column
        Object.entries(branchTotalColumns).forEach(([branchName, totalColumnIndex]) => {
          const quantityStr = cells[totalColumnIndex]?.trim() || '0'
          
          // Parse quantity - handle numbers, commas, and multiple space-separated values
          let quantity = 0
          try {
            // Remove commas and get only the first number if there are multiple space-separated values
            const cleaned = quantityStr.replace(/,/g, '').split(/\s+/)[0] || '0'
            quantity = parseFloat(cleaned) || 0
          } catch {
            quantity = 0
          }
          
          // Determine unit: "KG" by default, "unit" if quantity > 150
          const unit = quantity > 150 ? 'unit' : 'KG'
          
          // Only add if quantity > 0
          if (quantity > 0) {
            branchData[branchName].push({
              name: itemName,
              quantity: quantity,
              unit: unit
            })
          }
        })
      }

      // Convert to final structure
      const branchesWithItems: ParsedBranchData[] = []
      let totalItems = 0

      Object.entries(branchData).forEach(([branchName, items]) => {
        if (items.length > 0) {
          const slug = branchNameToSlug[branchName]
          const branch = branches.find(b => b.slug === slug)
          
          if (branch) {
            branchesWithItems.push({
              branchSlug: slug,
              branchName: branch.name,
              items: items
            })
            totalItems += items.length
          }
        }
      })

      const parsed: ParsedData = {
        deliveryDate: selectedDate,
        branches: branchesWithItems,
        totalItems: totalItems
      }

      setParsedData(parsed)
      setLoading(false)
      
    } catch (err) {
      setError('Error generating dispatch. Please check your data.')
      setLoading(false)
      console.error(err)
    }
  }

  const saveDispatch = async () => {
    if (!parsedData) return

    setLoading(true)
    
    try {
      // Since we're using weekly totals, use today's date or next Monday as the delivery date
      const today = new Date()
      const formattedDate = today.toISOString().split('T')[0] // Format: YYYY-MM-DD

      // Create dispatch object
      const dispatch = {
        id: `dispatch-${formattedDate}-${Date.now()}`,
        createdDate: new Date().toISOString(),
        deliveryDate: formattedDate,
        createdBy: 'Head Office',
        branchDispatches: parsedData.branches.map(branch => ({
          branchSlug: branch.branchSlug,
          branchName: branch.branchName,
          status: 'pending' as const,
          items: branch.items.map((item, index) => ({
            id: `${branch.branchSlug}-item-${index}`,
            name: item.name,
            orderedQty: item.quantity,
            packedQty: null,
            receivedQty: null,
            unit: item.unit,
            packedChecked: false,
            receivedChecked: false,
            notes: '',
            issue: null
          })),
          // Packing checkpoint
          packedBy: null,
          packingStartedAt: null,
          packingCompletedAt: null,
          // Receiving checkpoint
          receivedBy: null,
          receivingStartedAt: null,
          receivedAt: null,
          completedAt: null,
          overallNotes: ''
        }))
      }

      // Save to dispatches.json via API
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatch)
      })

      if (!response.ok) {
        throw new Error('Failed to save dispatch')
      }

      setSuccess(true)
      setLoading(false)
      
      setTimeout(() => {
        router.push('/dispatch')
      }, 2000)
      
    } catch (err) {
      setError('Error saving dispatch. Please try again.')
      setLoading(false)
      console.error(err)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 flex flex-col pt-16 md:pt-0">
        <div className="flex-1 container mx-auto px-4 py-8">
          <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dispatch', href: '/dispatch' },
            { label: 'Upload' },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Dispatch Order</h1>
          <p className="text-muted-foreground">Upload or paste Excel data to create dispatch orders for branches</p>
        </div>

        {success ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Dispatch Created Successfully!</h2>
                <p className="text-muted-foreground mb-4">
                  {parsedData?.branches.length} branches can now see their deliveries
                </p>
                <p className="text-sm text-muted-foreground">Redirecting to dispatch dashboard...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Step 1: Paste Data */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Step 1: Paste Excel Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Copy and paste your Excel data here (including headers):
                    </label>
                    <textarea
                      className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                      placeholder="Paste Excel data here (Ctrl+C from Excel, then Ctrl+V here)...&#10;&#10;Include the header row with branch names and dates.&#10;Then paste all item rows with quantities."
                      value={pastedData}
                      onChange={(e) => setPastedData(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={parseExcelData} 
                    disabled={!pastedData.trim()}
                    size="lg"
                  >
                    Parse Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Generate Dispatch */}
            {availableDates.length > 0 && !parsedData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step 2: Generate Dispatch from Total Quantities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will create a dispatch using the total weekly quantities for each branch.
                  </p>
                  <Button onClick={generateDispatch} size="lg" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Dispatch Preview'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Preview & Confirm */}
            {parsedData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step 3: Preview & Confirm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Dispatch Type</div>
                          <div className="text-lg font-semibold">Weekly Total</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Branches</div>
                          <div className="text-lg font-semibold">{parsedData.branches.length}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Items</div>
                          <div className="text-lg font-semibold">{parsedData.totalItems}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold">Branches & Items:</h3>
                      {parsedData.branches.map(branch => (
                        <div key={branch.branchSlug} className="border-l-4 border-primary pl-4 py-2">
                          <div className="font-medium">{branch.branchName}</div>
                          <div className="text-sm text-muted-foreground">
                            {branch.items.length} items
                          </div>
                          <details className="mt-2">
                            <summary className="text-sm text-primary cursor-pointer hover:underline">
                              View items
                            </summary>
                            <div className="mt-2 text-sm space-y-1">
                              {branch.items.slice(0, 10).map((item, idx) => (
                                <div key={idx} className="text-muted-foreground">
                                  • {item.name}: {item.quantity} {item.unit}
                                </div>
                              ))}
                              {branch.items.length > 10 && (
                                <div className="text-muted-foreground italic">
                                  ... and {branch.items.length - 10} more items
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={saveDispatch} 
                        size="lg" 
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Creating...' : '📤 Create Digital Dispatches'}
                      </Button>
                      <Button 
                        onClick={() => setParsedData(null)} 
                        variant="outline"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-semibold">Error</div>
                      <div className="text-sm">{error}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </div>
  )
}

