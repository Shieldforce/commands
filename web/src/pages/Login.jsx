import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/commands')
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.error ?? 'Credenciais invalidas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4
      bg-gray-50 dark:bg-gh-dark">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
            bg-blue-600 dark:bg-gh-green shadow-lg">
            <span className="text-2xl">&#9889;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gh-text">ShieldForce</h1>
          <p className="text-sm text-gray-500 dark:text-gh-muted mt-1">Gerencie seus comandos e tarefas</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border shadow-sm p-6
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gh-text mb-5">
            Entrar na conta
          </h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-sm
              bg-red-50 text-red-700 border border-red-200
              dark:bg-red-900/20 dark:text-gh-red dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide
                text-gray-500 dark:text-gh-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="voce@exemplo.com"
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide
                  text-gray-500 dark:text-gh-muted">
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-gh-blue dark:hover:text-blue-300"
                >
                  Esqueceu?
                </Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-2.5"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gh-muted mt-5">
          Nao tem conta?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 dark:text-gh-blue dark:hover:text-blue-300 font-medium"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
