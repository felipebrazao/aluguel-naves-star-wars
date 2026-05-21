import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
  readonly children: React.ReactNode
}

const mockSession = {
  authenticated: true,
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!mockSession.authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute