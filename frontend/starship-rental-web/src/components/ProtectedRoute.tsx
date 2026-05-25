import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
  readonly children: React.ReactNode
  readonly role?: 'Admin' | 'Cliente'
}

function normalizeRole(role?: string | null) {
  if (!role) return null
  const r = role.toString().toLowerCase()
  if (r === 'admin') return 'Admin'
  if (r === 'cliente') return 'Cliente'
  return null
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  const userRole = storedUser ? normalizeRole(JSON.parse(storedUser).role) : null

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute