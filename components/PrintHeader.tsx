'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/date'

interface PrintHeaderProps {
  branchName: string
  pageTitle?: string
}

export function PrintHeader({ branchName, pageTitle }: PrintHeaderProps) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(formatDate(new Date()))
  }, [])

  return (
    <div className="print-header hidden print:block mb-6 pb-4 border-b border-gray-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mikana Branch Guidebook</h1>
          <p className="text-lg font-semibold mt-1">{branchName}</p>
          {pageTitle && <p className="text-sm text-gray-600">{pageTitle}</p>}
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>Printed: {currentDate}</p>
        </div>
      </div>
    </div>
  )
}

