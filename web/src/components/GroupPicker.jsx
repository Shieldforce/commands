import { useState, useEffect, useRef } from 'react'

export default function GroupPicker({ groups, counts, active, onSelect, onClose }) {
  const [query, setQuery]       = useState('')
  const [cursor, setCursor]     = useState(0)
  const inputRef                = useRef(null)
  const listRef                 = useRef(null)

  const allGroups = ['all', ...groups]

  const filtered = allGroups.filter((g) =>
    !query || (g === 'all' ? 'todos' : g).toLowerCase().includes(query.toLowerCase())
  )

  // Reset cursor when filter changes
  useEffect(() => { setCursor(0) }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor]
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  useEffect(() => {
    inputRef.current?.focus()

    const handler = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => Math.min(c + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => Math.max(c - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[cursor]) { onSelect(filtered[cursor]); onClose() }
      }
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [filtered, cursor, onClose, onSelect])

  const choose = (g) => { onSelect(g); onClose() }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]
        bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-xl border shadow-2xl overflow-hidden
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b
          border-gray-100 dark:border-gh-border">
          <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gh-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar grupo..."
            className="flex-1 text-sm bg-transparent outline-none
              text-gray-900 dark:text-gh-text placeholder-gray-400 dark:placeholder-gh-muted"
          />
          {query && (
            <button
              tabIndex={-1}
              onClick={() => setQuery('')}
              className="text-gray-300 hover:text-gray-500 dark:text-gh-border
                dark:hover:text-gh-muted transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* List */}
        <div ref={listRef} className="overflow-y-auto max-h-64 py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gh-muted text-center py-6">
              Nenhum grupo encontrado.
            </p>
          ) : (
            filtered.map((g, i) => {
              const isActive  = g === active
              const isCursor  = i === cursor
              const label     = g === 'all' ? 'Todos' : g
              const count     = counts[g] ?? 0

              return (
                <button
                  key={g}
                  tabIndex={-1}
                  onClick={() => choose(g)}
                  onMouseEnter={() => setCursor(i)}
                  className={`w-full flex items-center justify-between gap-3
                    px-3 py-2 text-sm transition-colors duration-75 text-left
                    ${isCursor
                      ? 'bg-blue-50 dark:bg-gh-green/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gh-border/20'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Arrow indicator for cursor */}
                    <span className={`text-xs shrink-0 transition-opacity
                      ${isCursor
                        ? 'text-blue-500 dark:text-gh-green opacity-100'
                        : 'opacity-0'
                      }`}>
                      ▶
                    </span>

                    <span className={`truncate font-medium
                      ${isActive
                        ? 'text-blue-600 dark:text-gh-green'
                        : isCursor
                          ? 'text-gray-900 dark:text-gh-text'
                          : 'text-gray-700 dark:text-gh-muted'
                      }`}>
                      {label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0
                        bg-blue-100 text-blue-600 dark:bg-gh-green/20 dark:text-gh-green">
                        ativo
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-mono shrink-0
                    ${isCursor
                      ? 'text-gray-500 dark:text-gh-muted'
                      : 'text-gray-300 dark:text-gh-border'
                    }`}>
                    {count}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-3 py-2 border-t
          border-gray-100 dark:border-gh-border text-[10px] text-gray-400 dark:text-gh-border">
          {[['↑↓', 'navegar'], ['Enter', 'selecionar'], ['ESC', 'fechar']].map(([key, label]) => (
            <span key={key}>
              <kbd className="inline-flex items-center px-1 py-0.5 rounded font-mono
                bg-gray-100 text-gray-500 border border-gray-200
                dark:bg-gh-dark dark:text-gh-muted dark:border-gh-border">
                {key}
              </kbd>
              {' '}{label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
