import { useEffect, useRef } from 'react'

export default function ConfirmModal({
  title        = 'Confirmar acao',
  message,
  detail,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  danger       = true,
  onConfirm,
  onCancel,
}) {
  const cancelRef  = useRef(null)
  const confirmRef = useRef(null)
  const wrapRef    = useRef(null)

  useEffect(() => {
    // Foca o Cancel por padrao (mais seguro — Enter nao confirma acidentalmente)
    cancelRef.current?.focus()

    const onKey = (e) => {
      // ESC sempre cancela
      if (e.key === 'Escape') { onCancel(); return }

      // Setas trocam foco entre os botoes
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        if (document.activeElement === cancelRef.current) {
          confirmRef.current?.focus()
        } else {
          cancelRef.current?.focus()
        }
        return
      }

      // Focus trap — Tab e Shift+Tab ficam dentro do modal
      if (e.key === 'Tab') {
        const focusable = wrapRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        ref={wrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`flex items-center justify-center pt-8 pb-4
          ${danger ? 'text-red-500 dark:text-gh-red' : 'text-blue-500 dark:text-gh-blue'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center
            ${danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            {danger ? (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="px-6 pb-2 text-center">
          <h2 id="confirm-title" className="text-base font-bold text-gray-900 dark:text-gh-text mb-1">
            {title}
          </h2>
          {message && (
            <p className="text-sm text-gray-600 dark:text-gh-muted leading-relaxed">{message}</p>
          )}
          {detail && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gh-border">{detail}</p>
          )}
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-gray-400 dark:text-gh-muted mt-1 mb-0">
          {[['←→','navegar'], ['Enter','confirmar'], ['ESC','cancelar']].map(([key, label], i) => (
            <span key={key}>
              {i > 0 && <span className="mx-1 text-gray-300 dark:text-gh-border">·</span>}
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono
                bg-gray-100 text-gray-600 border border-gray-300
                dark:bg-gh-surface dark:text-gh-muted dark:border-gh-border">
                {key}
              </kbd>
              {' '}{label}
            </span>
          ))}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 px-6 py-5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
              bg-gray-100 text-gray-700 hover:bg-gray-200
              dark:bg-gh-border dark:text-gh-text dark:hover:bg-gh-muted/30
              focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
              focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gh-surface"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-gh-surface
              ${danger
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 dark:bg-gh-green dark:text-gh-dark dark:hover:bg-green-400'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
