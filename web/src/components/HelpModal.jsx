import { useEffect } from 'react'

const LIST_GROUPS = [
  {
    title: 'Navegacao',
    items: [
      { key: 'j / ↓', desc: 'Proximo item' },
      { key: 'k / ↑', desc: 'Item anterior' },
      { key: 'Enter',  desc: 'Visualizar completo' },
    ],
  },
  {
    title: 'Busca e Grupos',
    items: [
      { key: '/',   desc: 'Abrir busca' },
      { key: 'g',   desc: 'Seletor de grupo' },
      { key: 'ESC', desc: 'Fechar / limpar' },
    ],
  },
  {
    title: 'Acoes',
    items: [
      { key: 'n', desc: 'Novo item' },
      { key: 'e', desc: 'Editar selecionado' },
      { key: 'd', desc: 'Deletar selecionado' },
      { key: 'c', desc: 'Copiar titulo' },
    ],
  },
  {
    title: 'Edicao (modal)',
    items: [
      { key: 'Tab',    desc: 'Avancar campo' },
      { key: '← →',   desc: 'Alternar tipo (Cmd/Task)' },
      { key: 'Ctrl+S', desc: 'Salvar' },
      { key: 'ESC',    desc: 'Cancelar' },
    ],
  },
  {
    title: 'Confirmacao',
    items: [
      { key: '← →',  desc: 'Navegar botoes' },
      { key: 'Enter', desc: 'Confirmar botao focado' },
      { key: 'ESC',   desc: 'Cancelar (sempre)' },
    ],
  },
  {
    title: 'Geral',
    items: [
      { key: '?',   desc: 'Esta ajuda' },
      { key: 'ESC', desc: 'Fechar modal' },
    ],
  },
]

const ADMIN_GROUPS = [
  {
    title: 'Navegar telas (da lista)',
    items: [
      { key: 'r+1', desc: 'Ir para Usuarios' },
      { key: 'r+2', desc: 'Ir para Roles' },
      { key: 'r+3', desc: 'Ir para Permissoes' },
    ],
  },
  {
    title: 'Dentro do painel',
    items: [
      { key: '1/2/3', desc: 'Trocar aba' },
      { key: '← →', desc: 'Navegar abas (quando focada)' },
    ],
  },
  {
    title: 'Usuarios e Roles',
    items: [
      { key: 'j / k', desc: 'Navegar linhas da tabela' },
      { key: 'e',     desc: 'Editar linha selecionada' },
      { key: 'ESC',   desc: 'Cancelar edicao' },
    ],
  },
  {
    title: 'Aba Roles (2)',
    items: [
      { key: 'n', desc: 'Focar campo nova role' },
      { key: 'r', desc: 'Sincronizar rotas' },
    ],
  },
  {
    title: 'Aba Permissoes (3)',
    items: [
      { key: '/', desc: 'Focar busca de permissao' },
      { key: 'r', desc: 'Sincronizar rotas' },
    ],
  },
]

function KbdTag({ children }) {
  return (
    <kbd className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[11px]
      font-mono bg-gray-100 text-gray-600 border border-gray-300
      dark:bg-gh-dark dark:text-gh-muted dark:border-gh-border">
      {children}
    </kbd>
  )
}

function ShortcutGrid({ groups }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-[10px] font-bold uppercase tracking-widest
            text-gray-400 dark:text-gh-border mb-2">
            {group.title}
          </p>
          <div className="space-y-1.5">
            {group.items.map((item) => (
              <div key={item.key + item.desc} className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600 dark:text-gh-muted">{item.desc}</span>
                <KbdTag>{item.key}</KbdTag>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HelpModal({ onClose, isAdmin = false }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' || e.key === '?') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-xl border shadow-2xl overflow-hidden
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border
          ${isAdmin ? 'max-w-3xl' : 'max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b
          border-gray-100 dark:border-gh-border">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">&#9889;</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-gh-text">
              Atalhos do Teclado
            </span>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gh-muted dark:hover:text-gh-text transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista */}
        <div className={isAdmin ? 'border-b border-gray-100 dark:border-gh-border' : ''}>
          <p className="px-6 pt-3 text-[10px] font-bold uppercase tracking-widest
            text-gray-400 dark:text-gh-border">
            Lista de Comandos
          </p>
          <ShortcutGrid groups={LIST_GROUPS} />
        </div>

        {/* Admin */}
        {isAdmin && (
          <div>
            <p className="px-6 pt-3 text-[10px] font-bold uppercase tracking-widest
              text-blue-500 dark:text-gh-green flex items-center gap-1.5">
              ⚙ Painel de Administracao
            </p>
            <ShortcutGrid groups={ADMIN_GROUPS} />
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-gray-100 dark:border-gh-border text-center">
          <span className="text-xs text-gray-400 dark:text-gh-muted">
            <KbdTag>ESC</KbdTag>{' '}ou{' '}<KbdTag>?</KbdTag>{' '}para fechar
          </span>
        </div>
      </div>
    </div>
  )
}
