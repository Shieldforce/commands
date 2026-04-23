import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { commands as cmdApi, flattenCommands } from '../api/client'
import ThemeToggle from '../components/ThemeToggle'
import CommandModal from '../components/CommandModal'
import HelpModal from '../components/HelpModal'
import ViewModal from '../components/ViewModal'
import ConfirmModal from '../components/ConfirmModal'
import GroupPicker from '../components/GroupPicker'
import { toast } from '../components/Toast'

const TYPE_BADGE = {
  command: { label: '⬡ cmd',  cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-gh-blue/10 dark:text-gh-blue dark:border-gh-blue/30' },
  task:    { label: '◆ task', cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-gh-orange/10 dark:text-gh-orange dark:border-gh-orange/30' },
}

function TypeBadge({ type }) {
  const b = TYPE_BADGE[type] ?? TYPE_BADGE.command
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold border ${b.cls}`}>
      {b.label}
    </span>
  )
}

function CommandCard({ cmd, selected, onClick, onOpen }) {
  const ref = useRef(null)

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <div
      ref={ref}
      onClick={onClick}
      onDoubleClick={onOpen}
      className={`group px-4 py-3 cursor-pointer border-b transition-all duration-100
        border-gray-100 dark:border-gh-border
        ${selected
          ? 'bg-blue-50 border-l-2 border-l-blue-500 dark:bg-green-900/20 dark:border-l-gh-green'
          : 'hover:bg-gray-50 dark:hover:bg-gh-surface border-l-2 border-l-transparent'
        }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-xs text-gray-400 dark:text-gh-border">
          #{String(cmd.id).padStart(4, '0')}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium
          ${selected
            ? 'bg-blue-100 text-blue-800 dark:bg-gh-green/20 dark:text-gh-green'
            : 'bg-gray-100 text-gray-600 dark:bg-gh-border/50 dark:text-gh-muted'
          }`}>
          {cmd.group}
        </span>
        <TypeBadge type={cmd.type} />
      </div>

      <p className={`text-sm font-semibold leading-snug
        ${selected
          ? 'text-blue-900 dark:text-green-300'
          : 'text-gray-900 dark:text-gh-text group-hover:text-gray-900'
        }`}>
        {cmd.title}
      </p>

      {cmd.description && (
        <p className="text-xs text-gray-500 dark:text-gh-muted mt-0.5 line-clamp-2 leading-relaxed font-mono">
          {cmd.description.split('\n')[0]}
        </p>
      )}
    </div>
  )
}

export default function Commands() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [allCmds, setAllCmds]     = useState([])
  const [filtered, setFiltered]   = useState([])
  const [selected, setSelected]   = useState(0)
  const [search, setSearch]       = useState('')
  const [groupFilter, setGroup]   = useState('all')
  const [typeFilter, setType]     = useState('all')
  const [loading, setLoading]     = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [modal, setModal]         = useState(null) // {mode:'create'|'edit', cmd?}
  const [helpOpen, setHelpOpen]   = useState(false)
  const [viewing, setViewing]     = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const [groupPicker, setGroupPicker] = useState(false)
  const [routeMode, setRouteMode]     = useState(false)
  const routeTimer                    = useRef(null)
  const [saving, setSaving]       = useState(false)

  const searchRef = useRef(null)

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadCommands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await cmdApi.list()
      const flat = flattenCommands(res.data)
      setAllCmds(flat)
    } catch {
      toast('Erro ao carregar comandos', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCommands() }, [loadCommands])

  // ── Filter ────────────────────────────────────────────────────────────────

  useEffect(() => {
    let list = allCmds
    if (groupFilter !== 'all') list = list.filter((c) => c.group === groupFilter)
    if (typeFilter  !== 'all') list = list.filter((c) => c.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
    setSelected(0)
  }, [allCmds, search, groupFilter, typeFilter])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      if (inInput) {
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSaveFromEvent() }
        if (e.key === 'Escape') { setModal(null); setSearchOpen(false); setSearch('') }
        return
      }

      if (modal || helpOpen || viewing || confirm || groupPicker) return

      // Chord r+1/2/3 — modo de rota (admin)
      if (routeMode && isAdmin) {
        const routes = { '1': 'users', '2': 'roles', '3': 'permissions' }
        if (routes[e.key]) {
          e.preventDefault()
          clearTimeout(routeTimer.current)
          setRouteMode(false)
          navigate(`/admin?tab=${routes[e.key]}`)
          return
        }
        if (e.key === 'Escape') { setRouteMode(false); return }
      }

      switch (e.key) {
        case 'n': e.preventDefault(); setModal({ mode: 'create' }); break
        case 'e': e.preventDefault(); openEdit(null); break
        case 'd': e.preventDefault(); handleDelete(); break
        case 'c': e.preventDefault(); handleCopy(); break
        case '/': e.preventDefault(); openSearch(); break
        case '?': e.preventDefault(); setHelpOpen(true); break
        case 'j': case 'ArrowDown': e.preventDefault(); moveDown(); break
        case 'k': case 'ArrowUp':   e.preventDefault(); moveUp();   break
        case 'Enter': e.preventDefault(); openView(); break
        case 'g': e.preventDefault(); setGroupPicker(true); break
        case 'r':
          if (isAdmin) {
            e.preventDefault()
            setRouteMode(true)
            clearTimeout(routeTimer.current)
            routeTimer.current = setTimeout(() => setRouteMode(false), 1500)
          }
          break
        case 'Escape': setSearch(''); setSearchOpen(false); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleSaveFromEvent = () => {
    // triggered by Ctrl+S inside modal inputs — modal handles its own Ctrl+S
  }

  const moveDown = () => setSelected((s) => Math.min(s + 1, filtered.length - 1))
  const moveUp   = () => setSelected((s) => Math.max(s - 1, 0))

  const openView = () => {
    const cmd = filtered[selected]
    if (cmd) setViewing(cmd)
  }

  const openEdit = (cmd) => {
    const target = cmd ?? filtered[selected]
    if (target) setModal({ mode: 'edit', cmd: target })
  }

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const handleCopy = async () => {
    const cmd = filtered[selected]
    if (!cmd) return
    try {
      await navigator.clipboard.writeText(cmd.title)
      toast(`"${cmd.title}" copiado!`, 'success')
    } catch {
      toast('Clipboard indisponivel', 'error')
    }
  }

  const handleDelete = () => {
    const cmd = filtered[selected]
    if (cmd) setConfirm(cmd)
  }

  const doDelete = async () => {
    const cmd = confirm
    setConfirm(null)
    try {
      await cmdApi.delete(cmd.id)
      setAllCmds((prev) => prev.filter((c) => c.id !== cmd.id))
      toast(`"${cmd.title}" deletado`, 'success')
    } catch {
      toast('Erro ao deletar', 'error')
    }
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (modal.mode === 'edit') {
        await cmdApi.update(modal.cmd.id, form)
        setAllCmds((prev) =>
          prev.map((c) => (c.id === modal.cmd.id ? { ...c, ...form } : c))
        )
        toast(`"${form.title}" atualizado!`, 'success')
      } else {
        const res = await cmdApi.create(form)
        const created = typeof res.data === 'object' ? res.data : {}
        const newCmd = { id: created.id ?? Date.now(), ...form }
        setAllCmds((prev) => [...prev, newCmd])
        toast(`"${form.title}" criado!`, 'success')
      }
      setModal(null)
      await loadCommands()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Erro ao salvar'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const groups      = [...new Set(allCmds.map((c) => c.group))].sort()
  const allGroups   = ['all', ...groups]
  const tabRefs     = useRef([])

  const groupCounts = allGroups.reduce((acc, g) => {
    acc[g] = g === 'all' ? allCmds.length : allCmds.filter((c) => c.group === g).length
    return acc
  }, {})

  // Top 5 groups by count; active group always visible even if not in top 5
  const TOP = 5
  const sortedGroups  = [...groups].sort((a, b) => (groupCounts[b] ?? 0) - (groupCounts[a] ?? 0))
  const top5          = sortedGroups.slice(0, TOP)
  const activeInTop5  = groupFilter === 'all' || top5.includes(groupFilter)
  const visibleGroups = activeInTop5
    ? top5
    : [...top5.slice(0, TOP - 1), groupFilter]      // push active into last slot
  const hasMore       = groups.length > TOP || !activeInTop5
  const visibleTabs   = ['all', ...visibleGroups]

  const handleGroupKey = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (idx + 1) % allGroups.length
      setGroup(allGroups[next])
      tabRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (idx - 1 + allGroups.length) % allGroups.length
      setGroup(allGroups[prev])
      tabRefs.current[prev]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setGroup(allGroups[0])
      tabRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = allGroups.length - 1
      setGroup(allGroups[last])
      tabRefs.current[last]?.focus()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gh-dark overflow-hidden">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 h-12 border-b
        bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-yellow-500 text-lg">&#9889;</span>
          <span className="font-bold text-sm text-gray-900 dark:text-gh-text hidden sm:block">
            ShieldForce
          </span>
        </div>

        {/* Search */}
        <div className={`flex-1 max-w-sm transition-all duration-150 ${searchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gh-muted"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar... (titulo, grupo, tipo)"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border font-mono
                bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                dark:bg-gh-dark dark:border-gh-border dark:text-gh-text dark:placeholder-gh-muted
                focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-gh-green"
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setSearch(''); setSearchOpen(false); return }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  searchRef.current?.blur()
                  if (e.key === 'ArrowDown') moveDown()
                  else moveUp()
                }
                if (e.key === 'Enter') { searchRef.current?.blur() }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              title="Administração"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          )}

          {/* Docs link */}
          <Link
            to="/docs"
            title="Documentacao"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Link>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setType(e.target.value)}
            className="text-xs py-1 pl-2 pr-6 rounded-lg border
              bg-gray-50 border-gray-200 text-gray-700
              dark:bg-gh-dark dark:border-gh-border dark:text-gh-muted
              focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-gh-green"
          >
            <option value="all">Todos</option>
            <option value="command">Comandos</option>
            <option value="task">Tarefas</option>
          </select>

          <button
            onClick={() => setHelpOpen(true)}
            title="Ajuda ?"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <ThemeToggle />

          {/* User menu */}
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-gray-200 dark:border-gh-border">
            <span className="text-xs text-gray-500 dark:text-gh-muted hidden md:block max-w-[120px] truncate">
              {user?.name ?? user?.email ?? 'Usuario'}
            </span>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                dark:text-gh-muted dark:hover:text-gh-red dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Group tabs — top 5 + "···" */}
      <div
        role="tablist"
        aria-label="Filtrar por grupo"
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border"
      >
        {visibleTabs.map((g, idx) => {
          const active = groupFilter === g
          const count  = groupCounts[g] ?? 0
          return (
            <button
              key={g}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              ref={(el) => { tabRefs.current[idx] = el }}
              onClick={() => setGroup(g)}
              onKeyDown={(e) => handleGroupKey(e, idx)}
              className={`w-24 flex items-center justify-between gap-1.5 px-2.5 py-1.5
                rounded-lg text-xs font-semibold border transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                dark:focus-visible:ring-gh-green focus-visible:ring-offset-1
                dark:focus-visible:ring-offset-gh-surface
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 dark:bg-gh-green/15 dark:text-gh-green dark:border-gh-green'
                  : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 dark:text-gh-muted dark:border-gh-border dark:hover:border-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border/30'
                }`}
            >
              <span className="truncate">{g === 'all' ? 'Todos' : g}</span>
              <span className={`text-[10px] px-1 py-0.5 rounded font-mono leading-none shrink-0
                ${active
                  ? 'bg-white/25 text-white dark:bg-gh-green/20 dark:text-gh-green'
                  : 'bg-gray-100 text-gray-400 dark:bg-gh-border/60 dark:text-gh-border'
                }`}>
                {count}
              </span>
            </button>
          )
        })}

        {/* More groups button */}
        {hasMore && (
          <button
            tabIndex={-1}
            onClick={() => setGroupPicker(true)}
            title="Mais grupos (g)"
            className={`shrink-0 w-9 flex items-center justify-center py-1.5 rounded-lg text-sm
              border transition-all duration-150 focus:outline-none
              ${!activeInTop5
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-gh-green dark:bg-gh-green/10 dark:text-gh-green'
                : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 dark:border-gh-border dark:text-gh-border dark:hover:border-gh-muted dark:hover:text-gh-muted'
              }`}
          >
            ···
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1.5 text-xs
        text-gray-400 dark:text-gh-muted border-b border-gray-100 dark:border-gh-border
        bg-gray-50/50 dark:bg-gh-dark">
        <span>
          {filtered.length} {filtered.length !== allCmds.length ? `/ ${allCmds.length}` : ''} items
          {search && <span className="ml-1 text-blue-500 dark:text-gh-blue">· "{search}"</span>}
        </span>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="sm:hidden flex items-center gap-1 text-blue-600 dark:text-gh-green font-medium"
        >
          + Novo
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 dark:border-gh-green border-t-transparent
                rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gh-muted">Carregando...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-4xl mb-4">&#128269;</div>
            <p className="text-gray-500 dark:text-gh-muted text-sm">Nenhum item encontrado.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-xs text-blue-600 dark:text-gh-blue hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          filtered.map((cmd, i) => (
            <CommandCard
              key={cmd.id}
              cmd={cmd}
              selected={i === selected}
              onClick={() => setSelected(i)}
              onOpen={() => setViewing(cmd)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="shrink-0 flex items-center justify-between px-4 h-10 border-t
        bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
        <div className="hidden sm:flex items-center gap-3 text-xs flex-wrap
          text-gray-400 dark:text-gh-muted">
          {routeMode && isAdmin ? (
            /* Modo de rota ativo — destaque visual */
            <span className="flex items-center gap-2 animate-pulse">
              <kbd className="kbd bg-blue-100 text-blue-600 border-blue-300
                dark:bg-gh-green/20 dark:text-gh-green dark:border-gh-green">r</kbd>
              <span className="text-gray-600 dark:text-gh-text font-medium">+</span>
              {[['1','usuarios'],['2','roles'],['3','permissoes']].map(([k, l]) => (
                <button key={k} onClick={() => { setRouteMode(false); navigate(`/admin?tab=${['users','roles','permissions'][+k-1]}`) }}
                  className="flex items-center gap-1">
                  <kbd className="kbd bg-blue-100 text-blue-600 border-blue-300
                    dark:bg-gh-green/20 dark:text-gh-green dark:border-gh-green">{k}</kbd>
                  <span className="text-gray-700 dark:text-gh-text">{l}</span>
                </button>
              ))}
              <span className="text-gray-400 dark:text-gh-border text-[10px]">ESC cancela</span>
            </span>
          ) : (
            <>
              <span><kbd className="kbd">j/k</kbd> navegar</span>
              <span><kbd className="kbd">/</kbd> buscar</span>
              <span><kbd className="kbd">g</kbd> grupo</span>
              <span><kbd className="kbd">n</kbd> novo</span>
              <span><kbd className="kbd">e</kbd> editar</span>
              <span><kbd className="kbd">d</kbd> deletar</span>
              <span><kbd className="kbd">c</kbd> copiar</span>
              {isAdmin && <>
                <span className="text-gray-200 dark:text-gh-border select-none">|</span>
                <span><kbd className="kbd">r+1</kbd> usuarios</span>
                <span><kbd className="kbd">r+2</kbd> roles</span>
                <span><kbd className="kbd">r+3</kbd> permissoes</span>
              </>}
              <span><kbd className="kbd">?</kbd> ajuda</span>
            </>
          )}
        </div>

        <button
          onClick={() => setModal({ mode: 'create' })}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            bg-blue-600 text-white hover:bg-blue-700
            dark:bg-gh-green dark:text-gh-dark dark:hover:bg-green-400
            transition-colors duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo <kbd className="kbd ml-1">n</kbd>
        </button>
      </footer>

      {/* Modals */}
      {modal && (
        <CommandModal
          mode={modal.mode}
          initial={modal.cmd}
          groups={groups}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} isAdmin={isAdmin} />}

      {viewing && (
        <ViewModal
          cmd={viewing}
          onClose={() => setViewing(null)}
          onEdit={(cmd) => { setViewing(null); setModal({ mode: 'edit', cmd }) }}
        />
      )}

      {groupPicker && (
        <GroupPicker
          groups={groups}
          counts={groupCounts}
          active={groupFilter}
          onSelect={setGroup}
          onClose={() => setGroupPicker(false)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Deletar item"
          message={`Tem certeza que deseja deletar "${confirm.title}"?`}
          detail="Esta acao nao pode ser desfeita."
          confirmLabel="Sim, deletar"
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
