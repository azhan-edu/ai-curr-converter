'use client'

interface SwapButtonProps {
  onClick: () => void
}

export default function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Swap currencies"
    >
      ⇄
    </button>
  )
}