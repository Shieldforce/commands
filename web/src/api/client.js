import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Parses the formatted string "[0001] : (title) = [description] {type}"
function parseCommandString(str, group) {
  const s = str.trim()
  const typeMatch = s.match(/\{(command|task)\}$/)
  if (!typeMatch) return null
  const type = typeMatch[1]
  const withoutType = s.slice(0, s.lastIndexOf(` {${type}}`))
  const sepIdx = withoutType.indexOf(') = [')
  if (sepIdx === -1) return null
  const description = withoutType.slice(sepIdx + 5, -1)
  const beforeDesc = withoutType.slice(0, sepIdx)
  const idMatch = beforeDesc.match(/^\[(\d+)\] : \(/)
  if (!idMatch) return null
  const title = beforeDesc.slice(idMatch[0].length)
  return { id: parseInt(idMatch[1], 10), title, description, group, type }
}

export function flattenCommands(data) {
  if (!data || typeof data !== 'object') return []
  const result = []
  for (const [group, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue
    for (const item of items) {
      const parsed = parseCommandString(item, group)
      if (parsed) result.push(parsed)
    }
  }
  return result
}

export const auth = {
  login: (email, password) =>
    api.post('/login', { email, password, client: 'front' }),
  register: (name, email, password, password_confirmation) =>
    api.post('/register', { name, email, password, password_confirmation, client: 'front' }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/resetPasswordSend', { email }),
  resetPassword: (email, token, password, password_confirmation) =>
    api.post('/resetPassword', { email, token, password, password_confirmation }),
  verify: () => api.get('/auth/verifyToken'),
}

export const commands = {
  list: (group = 'all') => api.get(`/command/${group}/1`),
  create: (data) => api.post('/command', data),
  update: (id, data) => api.put(`/command/${id}`, data),
  delete: (id) => api.delete(`/command/${id}`),
}

export const admin = {
  users: {
    list: (params = {}) => api.get('/user', { params }),
    update: (id, data) => api.put(`/user/${id}`, data),
    destroy: (id) => api.delete(`/user/${id}`),
  },
  roles: {
    list: () => api.get('/role'),
    create: (data) => api.post('/role', data),
    update: (id, data) => api.put(`/role/${id}`, data),
    destroy: (id) => api.delete(`/role/${id}`),
  },
  permissions: {
    list: () => api.get('/permission'),
    sync: () => api.get('/auth/setupRoutes'),
  },
}

export default api
