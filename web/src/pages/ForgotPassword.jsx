import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth as authApi } from '../api/client'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao enviar email')
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
          <p className="text-sm text-gray-500 dark:text-gh-muted mt-1">Recuperar acesso</p>
        </div>

        <div className="rounded-xl border shadow-sm p-6
          bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">

          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">&#128140;</div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gh-text mb-2">
                Email enviado!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gh-muted">
                Verifique sua caixa de entrada em <strong>{email}</strong> e siga as instrucoes para redefinir sua senha.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gh-text mb-2">
                Esqueceu sua senha?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gh-muted mb-5">
                Informe seu email e enviaremos um link de recuperacao.
              </p>

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
                    text-gray-500 dark:text-gh-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gh-muted mt-5">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 dark:text-gh-blue dark:hover:text-blue-300 font-medium"
          >
            &#8592; Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
