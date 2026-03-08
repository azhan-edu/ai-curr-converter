'use client'

import ConversionHistory from '@/components/ConversionHistory'
import useConversionHistory from '@/hooks/useConversionHistory'
import type { ConversionHistory as ConversionHistoryEntry } from '@/types'

export default function ConversionHistoryPanel() {
  const { history, clearHistory, refreshHistory } = useConversionHistory()

  const handleReload = (_conversion: ConversionHistoryEntry) => {
    void refreshHistory()
  }

  return (
    <ConversionHistory
      history={history}
      onClear={clearHistory}
      onReload={handleReload}
    />
  )
}