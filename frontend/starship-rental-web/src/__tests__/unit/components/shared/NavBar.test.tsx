import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../../../../components/shared/NavBar'

function renderNavBar(initialPath = '/') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <NavBar />
        </MemoryRouter>,
    )
}

describe('NavBar', () => {
    it('should render brand title', () => {
        renderNavBar()
        expect(screen.getByText('Star Rental')).toBeInTheDocument()
        expect(screen.getByText('Painel de Controle Galáctico')).toBeInTheDocument()
    })

    it('should render all navigation items', () => {
        renderNavBar()
        expect(screen.getAllByText('Catálogo').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Meus Aluguéis').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Operações').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Gestão').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Utilizadores').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Pagamentos').length).toBeGreaterThanOrEqual(1)
    })

    it('should render R2-D2 logo image', () => {
        renderNavBar()
        expect(screen.getByAltText('R2-D2')).toBeInTheDocument()
    })

    it('should render mobile menu button', () => {
        renderNavBar()
        expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument()
    })

    it('should toggle mobile menu when button is clicked', async () => {
        const user = userEvent.setup()
        renderNavBar()
        const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
        await user.click(menuButton)
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close mobile menu when clicked again', async () => {
        const user = userEvent.setup()
        renderNavBar()
        const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
        await user.click(menuButton)
        await user.click(menuButton)
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })
})
