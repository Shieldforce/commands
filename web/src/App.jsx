import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastContainer } from './components/Toast'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Commands from './pages/Commands'
import Docs from './pages/Docs'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gh-dark">
        <div className="w-6 h-6 border-2 border-blue-500 dark:border-gh-green border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/commands" replace />
  return children
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  return token ? <Navigate to="/commands" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/commands" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/commands" element={<PrivateRoute><Commands /></PrivateRoute>} />
            <Route path="/docs"     element={<PrivateRoute><Docs /></PrivateRoute>} />
            <Route path="/admin"    element={<AdminRoute><Admin /></AdminRoute>} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
