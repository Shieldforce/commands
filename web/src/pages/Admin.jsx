import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { admin as adminApi } from '../api/client'
import ThemeToggle from '../components/ThemeToggle'
import ConfirmModal from '../components/ConfirmModal'
import { toast } from '../components/Toast'

// ── small helpers ──────────────────────────────────────────────────────────

function Badge({ children, color = 'gray' }) {
  const c = {
    gray:   'bg-gray-100 text-gray-600 dark:bg-gh-border/60 dark:text-gh-muted',
    blue:   'bg-blue-100 text-blue-700 dark:bg-gh-blue/10 dark:text-gh-blue',
    green:  'bg-green-100 text-green-700 dark:bg-gh-green/10 dark:text-gh-green',
    orange: 'bg-orange-100 text-orange-700 dark:bg-gh-orange/10 dark:text-gh-orange',
    red:    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-gh-red',
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${c[color]}`}>
      {children}
    </span>
  )
}

const ROLE_COLOR = { SA: 'red', admin: 'orange', User: 'blue' }

function Spinner() {
  return <div className="w-5 h-5 border-2 border-blue-500 dark:border-gh-green border-t-transparent rounded-full animate-spin mx-auto" />
}

// ── Users tab ──────────────────────────────────────────────────────────────

function UsersTab({ roles, currentUser }) {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [editingId, setEditingId]   = useState(null)
  const [editRoles, setEditRoles]   = useState([])
  const [saving, setSaving]         = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [cursor, setCursor]         = useState(0)

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (inInput) {
        if (e.key === 'Escape') { setEditingId(null); return }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); document.activeElement.closest('[data-save]')?.click(); return }
        return
      }
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, users.length - 1)) }
      if (e.key === 'k' || e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (e.key === 'e' && !editingId && users[cursor]) startEdit(users[cursor])
      if (e.key === 'Escape') setEditingId(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [users, cursor, editingId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.users.list()
      setUsers(res.data?.data ?? [])
    } catch { toast('Erro ao carregar usuários', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (user) => {
    setEditingId(user.id)
    setEditRoles(user.roles ?? [])
  }

  const toggleRole = (roleName) => {
    setEditRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    )
  }

  const saveRoles = async (user) => {
    setSaving(true)
    try {
      const ids = roles.filter((r) => editRoles.includes(r.name)).map((r) => r.id)
      await adminApi.users.update(user.id, { roles_ids: ids })
      toast(`Roles de ${user.name} atualizados`, 'success')
      setEditingId(null)
      load()
    } catch { toast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  const destroy = async (user) => {
    setConfirmDel({ type: 'user', item: user })
  }

  const doDestroy = async () => {
    const { item } = confirmDel
    setConfirmDel(null)
    try {
      await adminApi.users.destroy(item.id)
      toast(`${item.name} deletado`, 'success')
      load()
    } catch { toast('Erro ao deletar', 'error') }
  }

  if (loading) return <div className="py-12"><Spinner /></div>

  return (
    <div className="overflow-x-auto">
      {confirmDel && (
        <ConfirmModal
          title="Deletar usuario"
          message={`Deletar "${confirmDel.item.name}"?`}
          detail="Todos os dados do usuario serao removidos permanentemente."
          confirmLabel="Sim, deletar"
          onConfirm={doDestroy}
          onCancel={() => setConfirmDel(null)}
        />
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gh-border">
            {['#', 'Nome', 'Email', 'Roles', 'Desde', 'Ações'].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide
                text-gray-500 dark:text-gh-muted whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gh-border/50">
          {users.map((u, i) => (
            <tr key={u.id}
              onClick={() => setCursor(i)}
              className={`transition-colors cursor-pointer
                ${i === cursor
                  ? 'bg-blue-50 dark:bg-gh-green/5'
                  : 'hover:bg-gray-50 dark:hover:bg-gh-border/10'
                }`}>
              <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-gh-border">
                {String(u.id).padStart(4, '0')}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gh-text">
                {u.name}
                {u.id === currentUser?.id && (
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gh-muted">(você)</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gh-muted font-mono text-xs">{u.email}</td>

              {/* Roles cell */}
              <td className="px-4 py-3">
                {editingId === u.id ? (
                  <div className="flex flex-wrap gap-1">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => toggleRole(r.name)}
                        className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors
                          ${editRoles.includes(r.name)
                            ? 'bg-blue-600 text-white border-blue-600 dark:bg-gh-green dark:border-gh-green dark:text-gh-dark'
                            : 'bg-white text-gray-500 border-gray-300 dark:bg-transparent dark:text-gh-muted dark:border-gh-border'
                          }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {(u.roles ?? []).map((r) => (
                      <Badge key={r} color={ROLE_COLOR[r] ?? 'gray'}>{r}</Badge>
                    ))}
                    {(!u.roles || u.roles.length === 0) && (
                      <span className="text-xs text-gray-400 dark:text-gh-border">sem role</span>
                    )}
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-xs text-gray-400 dark:text-gh-muted whitespace-nowrap">
                {u.created_at}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {editingId === u.id ? (
                    <>
                      <button
                        onClick={() => saveRoles(u)}
                        disabled={saving}
                        className="px-2 py-1 rounded text-xs font-medium
                          bg-blue-600 text-white hover:bg-blue-700
                          dark:bg-gh-green dark:text-gh-dark dark:hover:bg-green-400"
                      >
                        {saving ? '...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded text-xs font-medium
                          bg-gray-100 text-gray-600 hover:bg-gray-200
                          dark:bg-gh-border dark:text-gh-muted"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="px-2 py-1 rounded text-xs font-medium
                          bg-gray-100 text-gray-600 hover:bg-gray-200
                          dark:bg-gh-border/50 dark:text-gh-muted dark:hover:bg-gh-border"
                      >
                        Editar roles
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => destroy(u)}
                          className="px-2 py-1 rounded text-xs font-medium
                            text-red-600 hover:bg-red-50 dark:text-gh-red dark:hover:bg-red-900/20"
                        >
                          Deletar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gh-muted text-sm">
          Nenhum usuário encontrado.
        </div>
      )}
    </div>
  )
}

// ── Roles tab ──────────────────────────────────────────────────────────────

function RolesTab({ onRolesChange }) {
  const [roles, setRoles]             = useState([])
  const [perms, setPerms]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [editingId, setEditingId]     = useState(null)
  const [editPerms, setEditPerms]     = useState([])
  const [newName, setNewName]         = useState('')
  const [creating, setCreating]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [permSearch, setPermSearch]   = useState('')
  const [confirmRole, setConfirmRole] = useState(null)
  const [cursor, setCursor]           = useState(0)
  const newNameRef                    = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (inInput) {
        if (e.key === 'Escape') { setEditingId(null); e.target.blur(); return }
        return
      }
      if (e.key === 'n') { e.preventDefault(); newNameRef.current?.focus() }
      if (e.key === 'r') { e.preventDefault(); syncPerms() }
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, roles.length - 1)) }
      if (e.key === 'k' || e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (e.key === 'e' && !editingId && roles[cursor]) startEdit(roles[cursor])
      if (e.key === 'Escape') setEditingId(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roles, cursor, editingId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, pRes] = await Promise.all([adminApi.roles.list(), adminApi.permissions.list()])
      setRoles(rRes.data?.data ?? [])
      setPerms(pRes.data?.data ?? [])
      onRolesChange?.(rRes.data?.data ?? [])
    } catch { toast('Erro ao carregar', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (role) => {
    setEditingId(role.id)
    setEditPerms(role.permissions_ids?.map(Number) ?? [])
    setPermSearch('')
  }

  const togglePerm = (id) => {
    setEditPerms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])
  }

  const saveRole = async (role) => {
    setSaving(true)
    try {
      await adminApi.roles.update(role.id, { permissions_ids: editPerms })
      toast(`Role "${role.name}" atualizada`, 'success')
      setEditingId(null)
      load()
    } catch { toast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  const createRole = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await adminApi.roles.create({ name: newName.trim(), permissions_ids: [] })
      toast(`Role "${newName}" criada`, 'success')
      setNewName('')
      load()
    } catch { toast('Erro ao criar role', 'error') }
    finally { setCreating(false) }
  }

  const destroyRole = (role) => setConfirmRole(role)

  const doDestroyRole = async () => {
    const role = confirmRole
    setConfirmRole(null)
    try {
      await adminApi.roles.destroy(role.id)
      toast(`Role "${role.name}" deletada`, 'success')
      load()
    } catch { toast('Erro ao deletar', 'error') }
  }

  const syncPerms = async () => {
    try {
      await adminApi.permissions.sync()
      toast('Permissões sincronizadas com as rotas', 'success')
      load()
    } catch { toast('Erro ao sincronizar', 'error') }
  }

  const filteredPerms = perms.filter((p) =>
    !permSearch || p.name.toLowerCase().includes(permSearch.toLowerCase())
  )

  if (loading) return <div className="py-12"><Spinner /></div>

  return (
    <div className="space-y-6">
      {confirmRole && (
        <ConfirmModal
          title="Deletar role"
          message={`Deletar a role "${confirmRole.name}"?`}
          detail="Usuarios com esta role perderao as permissoes associadas."
          confirmLabel="Sim, deletar"
          onConfirm={doDestroyRole}
          onCancel={() => setConfirmRole(null)}
        />
      )}

      {/* Create role */}
      <div className="flex items-center gap-2 p-4 rounded-lg border border-dashed
        border-gray-300 dark:border-gh-border bg-gray-50 dark:bg-gh-dark/30">
        <input
          ref={newNameRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createRole()}
          placeholder="Nome da nova role... (n)"
          className="flex-1 px-3 py-1.5 rounded-lg border text-sm font-mono
            bg-white border-gray-200 dark:bg-gh-dark dark:border-gh-border
            text-gray-900 dark:text-gh-text placeholder-gray-400 dark:placeholder-gh-muted
            focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-gh-green"
        />
        <button
          onClick={createRole}
          disabled={creating || !newName.trim()}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold
            bg-blue-600 text-white hover:bg-blue-700
            dark:bg-gh-green dark:text-gh-dark dark:hover:bg-green-400
            disabled:opacity-50 transition-colors"
        >
          {creating ? '...' : '+ Criar'}
        </button>
        <button
          onClick={syncPerms}
          title="Sincronizar permissões com php artisan route:list"
          className="px-3 py-1.5 rounded-lg text-sm font-medium
            bg-gray-100 text-gray-600 hover:bg-gray-200
            dark:bg-gh-border dark:text-gh-muted dark:hover:bg-gh-muted dark:hover:text-gh-dark
            transition-colors whitespace-nowrap"
        >
          ⟳ Sync rotas
        </button>
      </div>

      {/* Roles list */}
      <div className="space-y-3">
        {roles.map((role, i) => (
          <div key={role.id}
            onClick={() => setCursor(i)}
            className={`rounded-lg border overflow-hidden transition-all cursor-pointer
              ${i === cursor
                ? 'bg-blue-50 border-blue-200 dark:bg-gh-green/5 dark:border-gh-green/30'
                : 'bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border'
              }`}>
            <div className="flex items-center justify-between px-4 py-3
              border-b border-gray-100 dark:border-gh-border">
              <div className="flex items-center gap-2">
                <Badge color={ROLE_COLOR[role.name] ?? 'gray'}>{role.name}</Badge>
                <span className="text-xs text-gray-400 dark:text-gh-muted">
                  {(role.permissions_ids ?? []).length} permissões
                </span>
              </div>
              <div className="flex items-center gap-1">
                {editingId === role.id ? (
                  <>
                    <button
                      onClick={() => saveRole(role)}
                      disabled={saving}
                      className="px-2 py-1 rounded text-xs font-medium
                        bg-blue-600 text-white hover:bg-blue-700
                        dark:bg-gh-green dark:text-gh-dark"
                    >
                      {saving ? '...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 rounded text-xs font-medium
                        bg-gray-100 text-gray-600 dark:bg-gh-border dark:text-gh-muted"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(role)}
                      className="px-2 py-1 rounded text-xs font-medium
                        bg-gray-100 text-gray-600 hover:bg-gray-200
                        dark:bg-gh-border/50 dark:text-gh-muted dark:hover:bg-gh-border"
                    >
                      Editar permissões
                    </button>
                    {!['SA', 'User'].includes(role.name) && (
                      <button
                        onClick={() => destroyRole(role)}
                        className="px-2 py-1 rounded text-xs font-medium
                          text-red-600 hover:bg-red-50 dark:text-gh-red dark:hover:bg-red-900/20"
                      >
                        Deletar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {editingId === role.id ? (
              <div className="p-4">
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Filtrar permissões..."
                  className="w-full px-3 py-1.5 mb-3 rounded-lg border text-xs font-mono
                    bg-gray-50 border-gray-200 dark:bg-gh-dark dark:border-gh-border
                    text-gray-900 dark:text-gh-text focus:outline-none focus:ring-1
                    focus:ring-blue-500 dark:focus:ring-gh-green"
                />
                <div className="max-h-48 overflow-y-auto grid grid-cols-1 gap-0.5">
                  {filteredPerms.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gh-border/20">
                      <input
                        type="checkbox"
                        checked={editPerms.includes(Number(p.id))}
                        onChange={() => togglePerm(Number(p.id))}
                        className="accent-blue-600 dark:accent-green-400"
                      />
                      <span className="text-xs font-mono text-gray-600 dark:text-gh-muted">{p.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gh-border mt-2">
                  {editPerms.length} de {perms.length} selecionadas
                </p>
              </div>
            ) : (
              <div className="px-4 py-2 flex flex-wrap gap-1">
                {(role.permissions_descriptions ?? []).slice(0, 12).map((p) => (
                  <span key={p} className="text-xs font-mono px-1.5 py-0.5 rounded
                    bg-gray-100 text-gray-500 dark:bg-gh-border/50 dark:text-gh-muted">
                    {p}
                  </span>
                ))}
                {(role.permissions_descriptions ?? []).length > 12 && (
                  <span className="text-xs text-gray-400 dark:text-gh-border py-0.5">
                    +{(role.permissions_descriptions ?? []).length - 12} mais
                  </span>
                )}
                {(role.permissions_descriptions ?? []).length === 0 && (
                  <span className="text-xs text-gray-400 dark:text-gh-border">sem permissões</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Permissions tab ────────────────────────────────────────────────────────

function PermissionsTab() {
  const [perms, setPerms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('all')
  const searchRef             = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (inInput) return
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'r') { e.preventDefault(); syncPerms() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.permissions.list()
      setPerms(res.data?.data ?? [])
    } catch { toast('Erro ao carregar permissões', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const allRoles = [...new Set(perms.flatMap((p) => p.roles ?? []))].sort()

  const filtered = perms.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all' || (p.roles ?? []).includes(roleFilter)
    return matchSearch && matchRole
  })

  const syncPerms = async () => {
    try {
      await adminApi.permissions.sync()
      toast('Permissões sincronizadas', 'success')
      load()
    } catch { toast('Erro ao sincronizar', 'error') }
  }

  if (loading) return <div className="py-12"><Spinner /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar permissão... (/)"
          className="flex-1 min-w-48 px-3 py-1.5 rounded-lg border text-xs font-mono
            bg-white border-gray-200 dark:bg-gh-dark dark:border-gh-border
            text-gray-900 dark:text-gh-text placeholder-gray-400 dark:placeholder-gh-muted
            focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-gh-green"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
          className="px-2 py-1.5 rounded-lg border text-xs
            bg-white border-gray-200 dark:bg-gh-dark dark:border-gh-border
            text-gray-700 dark:text-gh-muted focus:outline-none"
        >
          <option value="all">Todas as roles</option>
          {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={syncPerms}
          className="px-3 py-1.5 rounded-lg text-xs font-medium
            bg-gray-100 text-gray-600 hover:bg-gray-200
            dark:bg-gh-border dark:text-gh-muted dark:hover:bg-gh-muted dark:hover:text-gh-dark
            transition-colors whitespace-nowrap"
        >
          ⟳ Sync rotas
        </button>
        <span className="text-xs text-gray-400 dark:text-gh-muted ml-auto">
          {filtered.length} / {perms.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gh-dark/50 border-b border-gray-200 dark:border-gh-border">
              {['Permissão (rota)', 'Roles que possuem'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase
                  tracking-wide text-gray-500 dark:text-gh-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gh-border/50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gh-border/10">
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">{p.name}</code>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(p.roles ?? []).map((r) => (
                      <Badge key={r} color={ROLE_COLOR[r] ?? 'gray'}>{r}</Badge>
                    ))}
                    {(!p.roles || p.roles.length === 0) && (
                      <span className="text-xs text-gray-400 dark:text-gh-border">nenhuma</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gh-muted text-sm">
            Nenhuma permissão encontrada.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Keyboard hint bar ─────────────────────────────────────────────────────

function KbdHint({ items }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 border-b text-[10px]
      border-gray-100 dark:border-gh-border bg-gray-50/60 dark:bg-gh-dark/40
      text-gray-400 dark:text-gh-border overflow-x-auto">
      {items.map(([key, label]) => (
        <span key={key} className="flex items-center gap-1 whitespace-nowrap">
          <kbd className="inline-flex items-center px-1 py-0.5 rounded font-mono
            bg-gray-100 text-gray-500 border border-gray-200
            dark:bg-gh-surface dark:text-gh-muted dark:border-gh-border">
            {key}
          </kbd>
          {label}
        </span>
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'users',       label: 'Usuarios',   icon: '👤', hint: '1' },
  { key: 'roles',       label: 'Roles',      icon: '🏷️', hint: '2' },
  { key: 'permissions', label: 'Permissoes', icon: '🔑', hint: '3' },
]

const TAB_HINTS = {
  users:       [['j/k', 'navegar'], ['e', 'editar roles'], ['ESC', 'cancelar']],
  roles:       [['n', 'nova role'], ['e', 'editar permissoes'], ['r', 'sync rotas'], ['ESC', 'cancelar']],
  permissions: [['/', 'buscar'], ['r', 'sync rotas']],
}

export default function Admin() {
  const { user, isAdmin }   = useAuth()
  const [searchParams]      = useSearchParams()
  const initialTab          = ['users','roles','permissions'].includes(searchParams.get('tab'))
                              ? searchParams.get('tab') : 'users'
  const [tab, setTab]       = useState(initialTab)
  const [roles, setRoles]   = useState([])
  const tabRefs             = useRef([])

  // Global admin keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (inInput) return

      if (e.key === '1') { e.preventDefault(); setTab('users');       tabRefs.current[0]?.focus() }
      if (e.key === '2') { e.preventDefault(); setTab('roles');       tabRefs.current[1]?.focus() }
      if (e.key === '3') { e.preventDefault(); setTab('permissions'); tabRefs.current[2]?.focus() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gh-dark">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-500 dark:text-gh-muted">Acesso restrito a administradores.</p>
          <Link to="/commands" className="mt-4 inline-block text-sm text-blue-600 dark:text-gh-blue hover:underline">
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gh-dark overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 h-12 border-b
        bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
        <Link to="/commands" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-yellow-500 text-lg">&#9889;</span>
          <span className="font-bold text-sm text-gray-900 dark:text-gh-text hidden sm:block">ShieldForce</span>
        </Link>
        <span className="text-gray-300 dark:text-gh-border">/</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gh-text">Administracao</span>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/commands" className="text-xs text-gray-500 hover:text-gray-700
            dark:text-gh-muted dark:hover:text-gh-text px-2 py-1 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gh-border transition-colors">
            ← Voltar
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Tab bar */}
      <div role="tablist" className="shrink-0 flex items-center gap-1 px-4 py-2 border-b
        bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            ref={(el) => { tabRefs.current[i] = el }}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); const n = (i+1)%TABS.length; setTab(TABS[n].key); tabRefs.current[n]?.focus() }
              if (e.key === 'ArrowLeft')  { e.preventDefault(); const n = (i-1+TABS.length)%TABS.length; setTab(TABS[n].key); tabRefs.current[n]?.focus() }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-colors focus:outline-none focus-visible:ring-2
              focus-visible:ring-blue-500 dark:focus-visible:ring-gh-green
              ${tab === t.key
                ? 'bg-blue-600 text-white dark:bg-gh-green dark:text-gh-dark'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gh-muted dark:hover:bg-gh-border'
              }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <kbd className={`ml-0.5 text-[9px] px-1 py-0.5 rounded font-mono border
              ${tab === t.key
                ? 'bg-white/20 text-white border-white/30 dark:bg-gh-dark/30 dark:text-gh-green dark:border-gh-green/30'
                : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gh-border dark:text-gh-border dark:border-gh-border'
              }`}>
              {t.hint}
            </kbd>
          </button>
        ))}
      </div>

      {/* Contextual keyboard hints */}
      <KbdHint items={[
        ...TAB_HINTS[tab],
        ['1/2/3', 'trocar aba'],
        ['←→', 'navegar abas'],
      ]} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {tab === 'users'       && <UsersTab roles={roles} currentUser={user} />}
          {tab === 'roles'       && <RolesTab onRolesChange={setRoles} />}
          {tab === 'permissions' && <PermissionsTab />}
        </div>
      </main>
    </div>
  )
}
