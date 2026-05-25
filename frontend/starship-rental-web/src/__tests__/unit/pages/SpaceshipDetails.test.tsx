import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SpaceshipDetails from '../../../pages/SpaceshipDetails'

function renderSpaceshipDetails() {
    return render(
        <MemoryRouter>
            <SpaceshipDetails />
        </MemoryRouter>,
    )
}

describe('SpaceshipDetails', () => {
    describe('Render', () => {
        it('should render ship name and model in header', () => {
            renderSpaceshipDetails()
            expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
            expect(screen.getByText('T-65B')).toBeInTheDocument()
        })

        it('should render ship technical details', () => {
            renderSpaceshipDetails()
            expect(screen.getByText('Incom Corporation')).toBeInTheDocument()
            expect(screen.getByText('1 tripulante')).toBeInTheDocument()
            expect(screen.getByText('R$ 3200.00')).toBeInTheDocument()
        })

        it('should render ship status badge', () => {
            renderSpaceshipDetails()
            expect(screen.getByText('DISPONIVEL')).toBeInTheDocument()
        })

        it('should render checkout form fields', () => {
            renderSpaceshipDetails()
            expect(screen.getByLabelText(/data de início/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/data de fim/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/local de recolha/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/local de devolução/i)).toBeInTheDocument()
        })

        it('should render location options in select', () => {
            renderSpaceshipDetails()
            expect(screen.getAllByText('Coruscant Spaceport').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('Tatooine Mos Eisley').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('Naboo Royal Dock').length).toBeGreaterThanOrEqual(1)
        })

        it('should render confirm button as disabled by default', () => {
            renderSpaceshipDetails()
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
        })

        it('should show placeholder message before dates are selected', () => {
            renderSpaceshipDetails()
            expect(screen.getByText('Selecione as datas para calcular')).toBeInTheDocument()
        })

        it('should show R$ 0.00 as initial total', () => {
            renderSpaceshipDetails()
            expect(screen.getByText('R$ 0.00')).toBeInTheDocument()
        })
    })

    describe('Checkout calculation', () => {
        it('should calculate total price based on selected dates', async () => {
            const user = userEvent.setup()
            renderSpaceshipDetails()
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-04')
            expect(screen.getByText('R$ 9600.00')).toBeInTheDocument()
            expect(screen.getByText(/3 dia\(s\) de aluguel/i)).toBeInTheDocument()
        })

        it('should enable submit button when all fields are filled', async () => {
            const user = userEvent.setup()
            renderSpaceshipDetails()
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-04')
            await user.selectOptions(screen.getAllByRole('combobox')[0], 'Coruscant Spaceport')
            await user.selectOptions(screen.getAllByRole('combobox')[1], 'Tatooine Mos Eisley')
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).not.toBeDisabled()
        })

        it('should keep submit disabled when end date is before start date', async () => {
            const user = userEvent.setup()
            renderSpaceshipDetails()
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-10')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-05')
            await user.selectOptions(screen.getAllByRole('combobox')[0], 'Coruscant Spaceport')
            await user.selectOptions(screen.getAllByRole('combobox')[1], 'Tatooine Mos Eisley')
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
        })
    })
})
