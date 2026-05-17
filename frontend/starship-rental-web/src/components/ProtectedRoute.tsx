import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
  readonly children: React.ReactNode
  readonly role?: 'Admin' | 'Cliente'
}

const mockSession = {
  authenticated: true,
  role: 'Admin' as 'Admin' | 'Cliente',
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  if (!mockSession.authenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && mockSession.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute