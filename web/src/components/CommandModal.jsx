import { useEffect, useRef, useState } from 'react'
import RichEditor from './RichEditor'
import { useFocusTrap } from '../hooks/useFocusTrap'

const TYPE_OPTIONS = [
  { value: 'command', label: 'Comando', icon: '⬡', color: 'text-blue-500 dark:text-gh-blue' },
  { value: 'task',    label: 'Tarefa',  icon: '◆', color: 'text-orange-500 dark:text-gh-orange' },
]

export default function CommandModal({ mode = 'create', initial = null, groups = [], onSave, onClose, loading = false }) {
  const [form, setForm] = useState({
    group:       initial?.group       ?? '',
    title:       initial?.title       ?? '',
    type:        initial?.type        ?? 'command',
    description: initial?.description ?? '',
  })
  const [newGroup, setNewGroup] = useState(false)
  const modalRef   = useRef(null)
  const groupRef   = useRef(null)
  const titleRef   = useRef(null)
  const descRef    = useRef(null)
  const typeRefs   = useRef({})
  useFocusTrap(modalRef)

  const handleTypeKey = (e, currentValue) => {
    const values = TYPE_OPTIONS.map((o) => o.value)
    const idx    = values.indexOf(currentValue)
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      next = values[(idx + 1) % values.length]
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      next = values[(idx - 1 + values.length) % values.length]
    }
    if (next) {
      setForm((f) => ({ ...f, type: next }))
      typeRefs.current[next]?.focus()
    }
  }

  const isEdit = mode === 'edit'

  // Foca o campo de grupo ao abrir e ao alternar para "novo grupo"
  useEffect(() => {
    setTimeout(() => groupRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (newGroup) setTimeout(() => groupRef.current?.focus(), 30)
  }, [newGroup])

  // Ctrl+S global
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSubmit() }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // Lê o valor atual do input de grupo via ref (evita closure stale)
  const handleSubmit = () => {
    const group = groupRef.current?.value?.trim() ?? form.group.trim()
    if (!group || !form.title.trim() || !form.description.trim()) return
    onSave({ ...form, group })
  }

  const knownGroups = [...new Set(groups)].sort()
  const isTask = form.type === 'task'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-xl border shadow-2xl flex flex-col max-h-[90vh]
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gh-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isEdit ? '✏️' : '➕'}</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-gh-text">
              {isEdit
                ? `Editar #${String(initial?.id ?? '').padStart(4, '0')}`
                : 'Novo Comando / Tarefa'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gh-muted dark:hover:text-gh-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Group */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gh-muted mb-1.5">
              Grupo
            </label>
            {knownGroups.length > 0 && !newGroup ? (
              <div className="flex gap-2">
                <select
                  ref={groupRef}
                  value={form.group}
                  onChange={set('group')}
                  className="input-field flex-1"
                >
                  <option value="">Selecione um grupo...</option>
                  {knownGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setNewGroup(true); setForm((f) => ({ ...f, group: '' })) }}
                  className="px-3 py-2 text-xs rounded-lg border border-dashed
                    border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700
                    dark:border-gh-border dark:text-gh-muted dark:hover:border-gh-muted dark:hover:text-gh-text
                    transition-colors whitespace-nowrap"
                >
                  + Novo
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={groupRef}
                  type="text"
                  value={form.group}
                  onChange={set('group')}
                  placeholder="nome-do-grupo"
                  className="input-field flex-1"
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSubmit() }
                    if (e.key === 'Enter') titleRef.current?.focus()
                  }}
                />
                {knownGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNewGroup(false)}
                    className="px-3 py-2 text-xs rounded-lg border border-gray-300 text-gray-500
                      hover:border-gray-400 dark:border-gh-border dark:text-gh-muted dark:hover:border-gh-muted
                      transition-colors whitespace-nowrap"
                  >
                    Existente
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gh-muted mb-1.5">
              Titulo
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="titulo do comando ou tarefa"
              className="input-field"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gh-muted mb-1.5">
              Tipo
            </label>
            <div role="radiogroup" aria-label="Tipo do item" className="flex gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const active = form.type === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    ref={(el) => { typeRefs.current[opt.value] = el }}
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    onKeyDown={(e) => handleTypeKey(e, opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border
                      text-sm font-medium transition-all duration-150 focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                      dark:focus-visible:ring-gh-green dark:focus-visible:ring-offset-gh-surface
                      ${active
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-gh-green dark:bg-gh-green/10 dark:text-gh-green'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gh-border dark:text-gh-muted dark:hover:border-gh-muted'
                      }`}
                  >
                    <span className={opt.color}>{opt.icon}</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gh-muted mb-1.5">
              Descricao
            </label>
            <RichEditor
              value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              placeholder={isTask
                ? 'Escreva sua tarefa — use a barra de ferramentas para formatar, inserir imagens, vídeos e links...'
                : 'docker run -d --name meu-container nginx:latest'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gh-border shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gh-muted">
            <kbd className="kbd">Ctrl+S</kbd>
            <span>salvar</span>
            <span className="mx-1">·</span>
            <kbd className="kbd">ESC</kbd>
            <span>cancelar</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.group.trim() || !form.title.trim() || !form.description.trim()}
              className="btn-primary"
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
