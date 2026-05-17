import { NavLink, Outlet, useLocation } from 'react-router-dom'
import PilledButton from './PilledButton'

const navItems = [
  { to: '/', label: 'Catálogo' },
  { to: '/meus-alugueis', label: 'Meus Aluguéis' },
  { to: '/admin', label: 'Admin' },
]

function Layout() {
  const location = useLocation()

  const isItemActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`)

  const getNavVariant = (path: string) => {
    if (path === '/admin') return 'danger'
    if (path === '/meus-alugueis') return 'secondary'

    return 'primary'
  }

  return (
    <div className="min-h-screen bg-space-black text-gray-100">
      <header className="border-b border-panel-border bg-panel-dark/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">Star Rental</p>
            <h1 className="text-lg font-semibold text-sw-yellow">Painel de Controle Galáctico</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <PilledButton
                key={item.to}
                as={NavLink}
                to={item.to}
                variant={getNavVariant(item.to)}
                active={isItemActive(item.to)}
              >
                {item.label}
              </PilledButton>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout