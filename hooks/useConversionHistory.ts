'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ConversionHistory as ConversionHistoryEntry } from '@/types'
import { subscribeToConversionHistoryUpdated } from '@/utils/conversionHistoryEvents'

export default function useConversionHistory() {
  const [history, setHistory] = useState<ConversionHistoryEntry[]>([])

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/conversions')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const parsedHistory: ConversionHistoryEntry[] = data.data.map((item: ConversionHistoryEntry) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsedHistory)
        return
      }

      setHistory([])
    } catch {
      setHistory([])
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      await fetch('/api/conversions', {
        method: 'DELETE',
      })
      setHistory([])
    } catch {
      // Ignore clear failures and keep current UI state.
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const unsubscribe = subscribeToConversionHistoryUpdated(() => {
      void loadHistory()
    })

    return unsubscribe
  }, [loadHistory])

  return {
    history,
    refreshHistory: loadHistory,
    clearHistory,
  }
}