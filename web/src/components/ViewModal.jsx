import { useEffect, useRef } from 'react'
import { toast } from './Toast'
import { useFocusTrap } from '../hooks/useFocusTrap'

const TYPE_LABEL = {
  command: { icon: '⬡', label: 'comando', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-gh-blue/10 dark:text-gh-blue dark:border-gh-blue/30' },
  task:    { icon: '◆', label: 'tarefa',  cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-gh-orange/10 dark:text-gh-orange dark:border-gh-orange/30' },
}

function isHtml(str) {
  return /<[a-z][\s\S]*>/i.test(str)
}

export default function ViewModal({ cmd, onClose, onEdit }) {
  const type     = TYPE_LABEL[cmd.type] ?? TYPE_LABEL.command
  const html     = isHtml(cmd.description)
  const modalRef = useRef(null)
  useFocusTrap(modalRef)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'e' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
        onEdit(cmd)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onEdit, cmd])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd.title)
      toast(`"${cmd.title}" copiado!`, 'success')
    } catch { toast('Clipboard indisponível', 'error') }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl
          bg-white dark:bg-gh-surface border border-gray-200 dark:border-gh-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-4 border-b
          border-gray-100 dark:border-gh-border bg-gray-50 dark:bg-gh-dark/40">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs text-gray-400 dark:text-gh-border">
                #{String(cmd.id).padStart(4, '0')}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium
                bg-gray-100 text-gray-600 dark:bg-gh-border/50 dark:text-gh-muted">
                {cmd.group}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold border ${type.cls}`}>
                {type.icon} {type.label}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gh-text leading-snug">
              {cmd.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={copy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-gray-100 text-gray-600 hover:bg-gray-200
                dark:bg-gh-border dark:text-gh-muted dark:hover:bg-gh-border/80 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </button>

            <button onClick={() => { onClose(); onEdit(cmd) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-blue-600 text-white hover:bg-blue-700
                dark:bg-gh-green dark:text-gh-dark dark:hover:bg-green-400 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>

            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {html ? (
            /* Rich HTML content — rendered as article */
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: cmd.description }}
            />
          ) : (
            /* Plain text / command — monospace block */
            cmd.type === 'command' ? (
              <pre className="font-mono text-sm bg-gray-900 dark:bg-black text-green-400
                rounded-xl px-5 py-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {cmd.description}
              </pre>
            ) : (
              <div className="prose-content whitespace-pre-wrap">{cmd.description}</div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t
          border-gray-100 dark:border-gh-border bg-gray-50 dark:bg-gh-dark/40 text-xs
          text-gray-400 dark:text-gh-muted">
          <div className="flex items-center gap-3">
            {[
              ['Tab', 'navegar botoes'],
              ['E', 'editar'],
              ['ESC', 'fechar'],
            ].map(([key, label]) => (
              <span key={key}>
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono
                  bg-gray-100 dark:bg-gh-surface border border-gray-200 dark:border-gh-border">
                  {key}
                </kbd>
                {' '}{label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
