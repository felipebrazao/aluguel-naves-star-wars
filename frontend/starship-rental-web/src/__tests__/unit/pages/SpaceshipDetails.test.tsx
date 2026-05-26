import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SpaceshipDetails from '../../../pages/SpaceshipDetails'

function renderSpaceshipDetails() {
    return render(
        <MemoryRouter initialEntries={['/nave/1']}>
            <Routes>
                <Route path="/nave/:id" element={<SpaceshipDetails />} />
            </Routes>
        </MemoryRouter>,
    )
}

type FetchResponse = {
    ok: boolean
    status?: number
    json?: () => Promise<unknown>
    text?: () => Promise<string>
}

const spaceshipFake = {
    id: 1,
    name: 'X-Wing Starfighter',
    model: 'T-65B',
    manufacturer: 'Incom Corporation',
    capacity: 1,
    dailyPrice: 3200,
    status: 'DISPONIVEL',
}

const planetsFake = [
    { id: 1, name: 'Coruscant Spaceport' },
    { id: 2, name: 'Tatooine Mos Eisley' },
]

const paymentMethodsFake = [
    { id: 1, name: 'Créditos Galácticos' },
]

function mockFetchByUrl(options?: { spaceshipOk?: boolean }) {
    const spaceshipOk = options?.spaceshipOk ?? true

    globalThis.fetch = vi.fn().mockImplementation((input: string | URL) => {
        const url = String(input)

        if (url.includes('/spaceships/1')) {
            if (!spaceshipOk) {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({}),
                    text: () => Promise.resolve('Erro ao carregar nave'),
                } as FetchResponse)
            }

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(spaceshipFake),
            } as FetchResponse)
        }

        if (url.includes('/planets')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(planetsFake),
            } as FetchResponse)
        }

        if (url.includes('/payment-methods')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(paymentMethodsFake),
            } as FetchResponse)
        }

        if (url.includes('/rentals')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ id: 10 }),
                text: () => Promise.resolve(''),
            } as FetchResponse)
        }

        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
        } as FetchResponse)
    })
}

describe('SpaceshipDetails', () => {
    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Teste', email: 'teste@test.com', role: 'USER' }))
        globalThis.fetch = vi.fn() as typeof fetch
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Render', () => {
        it('should show loading indicator on mount', () => {
            globalThis.fetch = vi.fn().mockImplementation((input: string | URL) => {
                const url = String(input)

                if (url.includes('/spaceships/1')) {
                    return new Promise(() => undefined)
                }

                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(url.includes('/planets') ? planetsFake : paymentMethodsFake),
                } as FetchResponse)
            }) as typeof fetch

            renderSpaceshipDetails()

            expect(screen.getByText('Carregando...')).toBeInTheDocument()
        })

        it('should render ship name, model and price after data loads', async () => {
            mockFetchByUrl()

            renderSpaceshipDetails()

            expect(await screen.findByText('X-Wing Starfighter')).toBeInTheDocument()
            expect(screen.getByText('Incom Corporation')).toBeInTheDocument()
            expect(screen.getByText('1 tripulante')).toBeInTheDocument()
            expect(screen.getByText('R$ 3200.00')).toBeInTheDocument()
        })

        it('should show error when spaceship load fails', async () => {
            mockFetchByUrl({ spaceshipOk: false })

            renderSpaceshipDetails()

            expect(await screen.findByText('Erro ao carregar nave')).toBeInTheDocument()
            expect(screen.getByText('Erro')).toBeInTheDocument()
        })

        it('should render checkout form fields', () => {
            mockFetchByUrl()

            renderSpaceshipDetails()
            expect(screen.getByLabelText(/data de início/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/data de fim/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/planeta de retirada/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/planeta de devolução/i)).toBeInTheDocument()
        })

        it('should render location options in select', () => {
            mockFetchByUrl()

            renderSpaceshipDetails()
            expect(screen.getAllByText('Coruscant Spaceport').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('Tatooine Mos Eisley').length).toBeGreaterThanOrEqual(1)
        })

        it('should render confirm button as disabled by default', () => {
            mockFetchByUrl()

            renderSpaceshipDetails()
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
        })

        it('should show placeholder message before dates are selected', () => {
            mockFetchByUrl()

            renderSpaceshipDetails()
            expect(screen.getByText('Selecione as datas para calcular')).toBeInTheDocument()
        })

        it('should show R$ 0.00 as initial total', () => {
            mockFetchByUrl()

            renderSpaceshipDetails()
            expect(screen.getByText('R$ 0.00')).toBeInTheDocument()
        })
    })

    describe('Checkout calculation', () => {
        it('should calculate total price based on selected dates', async () => {
            mockFetchByUrl()

            const user = userEvent.setup()
            renderSpaceshipDetails()
            await screen.findByText('X-Wing Starfighter')
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-04')
            expect(screen.getByText('R$ 9600.00')).toBeInTheDocument()
            expect(screen.getByText(/3 dia\(s\) de aluguel/i)).toBeInTheDocument()
        })

        it('should enable submit button when all fields are filled', async () => {
            mockFetchByUrl()

            const user = userEvent.setup()
            renderSpaceshipDetails()
            await screen.findByText('X-Wing Starfighter')
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-04')
            await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
            await user.selectOptions(screen.getAllByRole('combobox')[1], '2')
            await user.selectOptions(screen.getAllByRole('combobox')[2], '1')
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).not.toBeDisabled()
        })

        it('should keep submit disabled when end date is before start date', async () => {
            mockFetchByUrl()

            const user = userEvent.setup()
            renderSpaceshipDetails()
            await screen.findByText('X-Wing Starfighter')
            await user.type(screen.getByLabelText(/data de início/i), '2026-06-10')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-05')
            await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
            await user.selectOptions(screen.getAllByRole('combobox')[1], '2')
            await user.selectOptions(screen.getAllByRole('combobox')[2], '1')
            expect(screen.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
        })

        it('should open confirmation modal when form is submitted', async () => {
            mockFetchByUrl()

            const user = userEvent.setup()
            renderSpaceshipDetails()
            await screen.findByText('X-Wing Starfighter')

            await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
            await user.type(screen.getByLabelText(/data de fim/i), '2026-06-04')
            await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
            await user.selectOptions(screen.getAllByRole('combobox')[1], '2')
            await user.selectOptions(screen.getAllByRole('combobox')[2], '1')
            await user.click(screen.getByRole('button', { name: /confirmar aluguel/i }))

            expect(screen.getByText('Confirmar Aluguel')).toBeInTheDocument()
            expect(screen.getByText(/revise os detalhes do seu aluguel/i)).toBeInTheDocument()
        })
    })
})
