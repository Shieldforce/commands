import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth as authApi } from '../api/client'
import ThemeToggle from '../components/ThemeToggle'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError('As senhas nao coincidem')
      return
    }
    setLoading(true)
    try {
      await authApi.register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        const msgs = Object.values(data.errors).flat()
        setError(msgs.join(' · '))
      } else {
        setError(data?.message ?? 'Erro ao criar conta')
      }
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
            bg-blue-600 dark:bg-gh-green shadow-lg">
            <span className="text-2xl">&#9889;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gh-text">ShieldForce</h1>
          <p className="text-sm text-gray-500 dark:text-gh-muted mt-1">Criar nova conta</p>
        </div>

        <div className="rounded-xl border shadow-sm p-6
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gh-text mb-5">
            Criar conta
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
                text-gray-500 dark:text-gh-muted mb-1.5">Nome</label>
              <input
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Seu nome"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide
                text-gray-500 dark:text-gh-muted mb-1.5">Email</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wide
                text-gray-500 dark:text-gh-muted mb-1.5">Senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide
                text-gray-500 dark:text-gh-muted mb-1.5">Confirmar senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-2.5"
            >
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gh-muted mt-5">
          Ja tem conta?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 dark:text-gh-blue dark:hover:text-blue-300 font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
