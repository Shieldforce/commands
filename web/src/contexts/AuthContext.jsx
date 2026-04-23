import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sf_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    auth.verify()
      .then((res) => {
        const u = res.data?.data ?? res.data
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem('sf_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email, password) => {
    const res = await auth.login(email, password)
    const payload = res.data?.data ?? res.data
    const t = payload?.token ?? payload?.access_token
    const u = payload?.user ?? payload
    localStorage.setItem('sf_token', t)
    setToken(t)
    setUser(u)
    return res
  }

  const logout = async () => {
    try { await auth.logout() } catch { /* ignore */ }
    localStorage.removeItem('sf_token')
    setToken(null)
    setUser(null)
  }

  const hasRole = (name) => {
    if (!user?.roles) return false
    const roles = Array.isArray(user.roles) ? user.roles : Object.values(user.roles)
    return roles.includes(name)
  }

  const isAdmin = hasRole('SA') || hasRole('admin')

  const hasPermission = (name) => {
    if (isAdmin) return true
    if (!user?.permissions) return false
    return user.permissions.includes(name)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
