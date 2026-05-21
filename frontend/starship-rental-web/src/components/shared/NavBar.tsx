import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PilledButton from './PilledButton'

const navItems = [
    { to: '/', label: 'Catálogo' },
    { to: '/meus-alugueis', label: 'Meus Aluguéis' },
    { to: '/painel', label: 'Operações' },
    { to: '/painel/gestao', label: 'Gestão' },
]

const activeButtonClasses =
    '!border-sw-yellow !bg-sw-yellow !text-space-black !shadow-[0_0_18px_rgba(255,232,31,0.45)]'

const buttonBaseClasses = 'min-w-[140px] justify-center px-4 py-2 text-sm'

function NavBar() {
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const activeNavPath =
        navItems
            .filter(({ to }) =>
                to === '/'
                    ? location.pathname === '/'
                    : location.pathname === to || location.pathname.startsWith(`${to}/`),
            )
            .sort((a, b) => b.to.length - a.to.length)[0]?.to ?? null

    const isItemActive = (path: string) => path === activeNavPath

    const renderNavItems = () =>
        navItems.map((item) => {
            const active = isItemActive(item.to)

            return (
                <li key={item.to}>
                    <PilledButton
                        as={NavLink}
                        to={item.to}
                        variant="primary"
                        active={active}
                        className={`${buttonBaseClasses} ${active ? activeButtonClasses : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {item.label}
                    </PilledButton>
                </li>
            )
        })

    return (
        <nav className="navbar rounded-box border border-panel-border/70 bg-panel-dark/95 shadow-base-300/20 shadow-sm backdrop-blur-sm">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/r2d2_128.png" alt="R2-D2" className="h-12 w-12 shrink-0 object-contain" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">Star Rental</p>
                            <h1 className="text-lg font-semibold text-sw-yellow">Painel de Controle Galáctico</h1>
                        </div>
                    </div>

                    <div className="inline-flex w-fit items-center gap-3">
                        <ul className="hidden list-none flex-nowrap items-center gap-2 p-0 text-base md:flex">{renderNavItems()}</ul>

                        <button
                            type="button"
                            className="btn btn-outline btn-secondary btn-sm btn-square md:hidden"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            aria-controls="logo-navbar-collapse"
                            aria-label="Toggle navigation"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="text-xs font-semibold leading-none">{isMenuOpen ? 'X' : 'MENU'}</span>
                        </button>
                    </div>
                </div>

                <div id="logo-navbar-collapse" className={`${isMenuOpen ? 'mt-3' : 'hidden'} max-md:w-full md:hidden`}>
                    <ul className="flex list-none flex-col gap-2 p-0 text-base">{renderNavItems()}</ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar