import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Catálogo' },
  { to: '/meus-alugueis', label: 'Meus Aluguéis' },
  { to: '/admin', label: 'Admin' },
]

function Layout() {
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
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  [
                    'rounded-full border px-4 py-2 transition-all duration-200',
                    isActive
                      ? 'border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.18)]'
                      : 'border-panel-border bg-black/20 text-gray-300 hover:border-rebel-blue hover:text-rebel-blue',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
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