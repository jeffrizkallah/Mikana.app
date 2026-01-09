'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Loader2, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QualityImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  warnings: number
  errors: number
  details: {
    success: number[]
    warnings: Array<{ row: number; message: string; data?: any }>
    errors: Array<{ row: number; message: string }>
  }
  columnMapping: Record<string, string>
}

export function QualityImportModal({ onClose, onSuccess }: QualityImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ]
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.xlsx') && 
        !selectedFile.name.endsWith('.xls') &&
        !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid Excel file (.xlsx, .xls, or .csv)')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/quality-checks/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Failed to import'
        try {
          const data = await response.json()
          errorMessage = data.error || data.details || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data)
      
      console.log('Import result:', {
        imported: data.imported,
        errors: data.errors,
        warnings: data.warnings,
        total: data.total
      })
      
      // Don't auto-close - let user review and click Done when ready
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message || 'Failed to import quality checks')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadErrorReport = () => {
    if (!result) return

    const report = [
      'Quality Control Import Report',
      '='.repeat(50),
      `Total Rows: ${result.total}`,
      `Successfully Imported: ${result.imported}`,
      `Warnings: ${result.warnings}`,
      `Errors: ${result.errors}`,
      '',
      'WARNINGS:',
      ...result.details.warnings.map(w => `Row ${w.row}: ${w.message}`),
      '',
      'ERRORS:',
      ...result.details.errors.map(e => `Row ${e.row}: ${e.message}`)
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quality-import-report-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Results screen
  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Import Complete</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Success icon */}
            <div className="text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                result.errors === 0 ? "bg-green-100" : "bg-yellow-100"
              )}>
                {result.errors === 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {result.errors === 0 ? 'All Records Imported!' : 'Import Completed with Issues'}
              </h3>
              <p className="text-muted-foreground">
                {result.imported} of {result.total} records successfully imported
              </p>
              {result.imported > 0 && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1 justify-center">
                  <AlertTriangle className="h-4 w-4" />
                  Change date filter to "Last 30 days" to see all imported records
                </p>
              )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                <p className="text-sm text-green-600">Imported</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-700">{result.warnings}</p>
                <p className="text-sm text-yellow-600">Warnings</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
                <p className="text-sm text-red-600">Errors</p>
              </div>
            </div>

            {/* Column mapping */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                AI Auto-Mapped Columns ({Object.keys(result.columnMapping).length} detected)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs font-mono max-h-48 overflow-y-auto">
                {Object.entries(result.columnMapping).map(([field, column]) => (
                  <div key={field} className="flex items-start gap-2 py-1">
                    <span className="text-blue-600 flex-shrink-0">→</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-900">{field}</div>
                      <div className="text-blue-700 truncate">{column}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {result.details.warnings.length > 0 && (
              <div className="border-l-4 border-l-yellow-500 p-4 bg-yellow-50 rounded">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Warnings ({result.details.warnings.length})
                </h4>
                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                  {result.details.warnings.slice(0, 10).map((warning, i) => (
                    <div key={i} className="text-yellow-700">
                      Row {warning.row}: {warning.message}
                    </div>
                  ))}
                  {result.details.warnings.length > 10 && (
                    <div className="text-yellow-600 italic">
                      +{result.details.warnings.length - 10} more warnings...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.details.errors.length > 0 && (
              <div className="border-l-4 border-l-red-500 p-4 bg-red-50 rounded">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Errors ({result.details.errors.length})
                </h4>
                <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
                  {result.details.errors.slice(0, 20).map((error, i) => (
                    <div key={i} className="text-red-700 font-mono text-xs">
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                  {result.details.errors.length > 20 && (
                    <div className="text-red-600 italic">
                      +{result.details.errors.length - 20} more errors...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {(result.details.warnings.length > 0 || result.details.errors.length > 0) && (
                <Button variant="outline" onClick={downloadErrorReport} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
              <Button 
                onClick={() => {
                  // If any records were imported, refresh the data
                  if (result.imported > 0) {
                    onSuccess()
                  } else {
                    onClose()
                  }
                }} 
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Upload screen
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-xl w-full">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Import Historical Quality Control Data</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg text-sm space-y-2">
            <p className="font-medium text-blue-900">📋 Import Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Excel file must contain quality control data</li>
              <li>AI will automatically map columns</li>
              <li>Branch names will be matched intelligently</li>
              <li>Photos will be skipped (can be added manually later)</li>
              <li>All records will be imported with status "submitted"</li>
            </ul>
          </div>

          {/* File drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-gray-300",
              file && "border-green-500 bg-green-50"
            )}
          >
            {file ? (
              <div className="space-y-3">
                <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium mb-1">Drop Excel file here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0]
                      if (selectedFile) handleFileSelect(selectedFile)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      document.getElementById('file-upload')?.click()
                    }}
                  >
                    Select File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports .xlsx, .xls, .csv (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

