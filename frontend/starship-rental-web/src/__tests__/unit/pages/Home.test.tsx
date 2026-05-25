import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../../../pages/Home'

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>,
    )
}

describe('Home', () => {
    it('should render page header', () => {
        renderHome()
        expect(screen.getByText('Catálogo de Naves')).toBeInTheDocument()
        expect(screen.getByText('Encontre sua próxima rota pelo hiperespaço')).toBeInTheDocument()
    })

    it('should render all ships initially', () => {
        renderHome()
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
        expect(screen.getByText('TIE Advanced x1')).toBeInTheDocument()
    })

    it('should render search input', () => {
        renderHome()
        expect(screen.getByPlaceholderText(/millennium, x-wing/i)).toBeInTheDocument()
    })

    it('should render availability checkbox', () => {
        renderHome()
        expect(screen.getByRole('checkbox')).toBeInTheDocument()
        expect(screen.getByText('Apenas disponíveis')).toBeInTheDocument()
    })

    it('should filter ships by name query', async () => {
        const user = userEvent.setup()
        renderHome()
        await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'X-Wing')
        expect(screen.queryByText('Millennium Falcon')).not.toBeInTheDocument()
        expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
    })

    it('should filter ships by model query', async () => {
        const user = userEvent.setup()
        renderHome()
        await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'YT-1300')
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.queryByText('X-Wing Starfighter')).not.toBeInTheDocument()
    })

    it('should show only available ships when checkbox is checked', async () => {
        const user = userEvent.setup()
        renderHome()
        await user.click(screen.getByRole('checkbox'))
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
        expect(screen.queryByText('TIE Advanced x1')).not.toBeInTheDocument()
    })

    it('should show all ships again after unchecking the checkbox', async () => {
        const user = userEvent.setup()
        renderHome()
        await user.click(screen.getByRole('checkbox'))
        await user.click(screen.getByRole('checkbox'))
        expect(screen.getByText('TIE Advanced x1')).toBeInTheDocument()
    })

    it('should show no ships when search has no match', async () => {
        const user = userEvent.setup()
        renderHome()
        await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'Nave Inexistente')
        expect(screen.queryByText('Millennium Falcon')).not.toBeInTheDocument()
        expect(screen.queryByText('X-Wing Starfighter')).not.toBeInTheDocument()
        expect(screen.queryByText('TIE Advanced x1')).not.toBeInTheDocument()
    })
})
