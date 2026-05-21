import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

function Layout() {
  return (
    <div className="min-h-screen bg-space-black text-gray-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-panel-border bg-panel-dark/95 backdrop-blur-sm">
        <NavBar />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout