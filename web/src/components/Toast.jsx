import { useEffect, useState } from 'react'

const icons = {
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
}

const colors = {
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  error:   'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  info:    'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
}

let _setToasts = null

export function toast(message, type = 'info', duration = 3000) {
  if (_setToasts) {
    const id = Date.now()
    _setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      _setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  _setToasts = setToasts

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium
            shadow-lg pointer-events-auto animate-fade-in ${colors[t.type]}`}
        >
          <span className="shrink-0">{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
