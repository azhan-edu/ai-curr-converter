const CONVERSION_HISTORY_UPDATED_EVENT = 'conversion-history-updated'

export function emitConversionHistoryUpdated(): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new Event(CONVERSION_HISTORY_UPDATED_EVENT))
}

export function subscribeToConversionHistoryUpdated(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = () => listener()
  window.addEventListener(CONVERSION_HISTORY_UPDATED_EVENT, handler)

  return () => {
    window.removeEventListener(CONVERSION_HISTORY_UPDATED_EVENT, handler)
  }
}