'use client'

import { useSearchParams } from 'next/navigation'

export function useEditMode() {
  const searchParams = useSearchParams()
  return searchParams.get('edit') === '1'
}

export function usePrintMode() {
  const searchParams = useSearchParams()
  return searchParams.get('print') === '1'
}

