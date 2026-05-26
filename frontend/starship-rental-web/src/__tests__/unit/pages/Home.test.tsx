import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../../../pages/Home'

type FetchResponse = {
    ok: boolean
    status?: number
    json?: () => Promise<unknown>
}

const fakeShips = [
    {
        id: 1,
        name: 'Millennium Falcon',
        model: 'YT-1300',
        dailyPrice: 3200,
        capacity: 6,
        status: 'disponivel',
    },
    {
        id: 2,
        name: 'X-Wing Starfighter',
        model: 'T-65B',
        dailyPrice: 2800,
        capacity: 1,
        status: 'disponivel',
    },
    {
        id: 3,
        name: 'TIE Advanced x1',
        model: 'Twin Ion Engine Advanced',
        dailyPrice: 4100,
        capacity: 1,
        status: 'indisponivel',
    },
]

function mockHomeFetch(response: Promise<FetchResponse>) {
    globalThis.fetch = vi.fn().mockReturnValue(response) as typeof fetch
}

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>,
    )
}

describe('Home', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        globalThis.fetch = vi.fn() as typeof fetch
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Loading state', () => {
        it('should show loading indicator while fetch is pending', () => {
            mockHomeFetch(new Promise(() => undefined))

            renderHome()

            expect(screen.getByText('Carregando...')).toBeInTheDocument()
        })
    })

    describe('Error state', () => {
        it('should show error message when fetch fails', async () => {
            mockHomeFetch(Promise.resolve({ ok: false, status: 500 }))

            renderHome()

            expect(await screen.findByText('Erro ao carregar naves')).toBeInTheDocument()
            expect(screen.getByText('Erro')).toBeInTheDocument()
        })
    })

    describe('Success state', () => {
        it('should render page header', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            renderHome()

            expect(await screen.findByText('Catálogo de Naves')).toBeInTheDocument()
            expect(screen.getByText('Encontre sua próxima rota pelo hiperespaço')).toBeInTheDocument()
        })

        it('should render all ships initially', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            renderHome()

            expect(await screen.findByText('Millennium Falcon')).toBeInTheDocument()
            expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
            expect(screen.getByText('TIE Advanced x1')).toBeInTheDocument()
        })

        it('should render search input', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            renderHome()

            expect(await screen.findByPlaceholderText(/millennium, x-wing/i)).toBeInTheDocument()
        })

        it('should render availability checkbox', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            renderHome()

            expect(await screen.findByRole('checkbox')).toBeInTheDocument()
            expect(screen.getByText('Apenas disponíveis')).toBeInTheDocument()
        })

        it('should filter ships by name query', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            const user = userEvent.setup()
            renderHome()
            await screen.findByText('Millennium Falcon')

            await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'X-Wing')

            await waitFor(() => {
                expect(screen.queryByText('Millennium Falcon')).not.toBeInTheDocument()
                expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
            })
        })

        it('should filter ships by model query', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            const user = userEvent.setup()
            renderHome()
            await screen.findByText('Millennium Falcon')

            await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'YT-1300')

            await waitFor(() => {
                expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
                expect(screen.queryByText('X-Wing Starfighter')).not.toBeInTheDocument()
            })
        })

        it('should show only available ships when checkbox is checked', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            const user = userEvent.setup()
            renderHome()
            await screen.findByText('Millennium Falcon')

            await user.click(screen.getByRole('checkbox'))

            await waitFor(() => {
                expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
                expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
                expect(screen.queryByText('TIE Advanced x1')).not.toBeInTheDocument()
            })
        })

        it('should show all ships again after unchecking the checkbox', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            const user = userEvent.setup()
            renderHome()
            await screen.findByText('Millennium Falcon')

            await user.click(screen.getByRole('checkbox'))
            await user.click(screen.getByRole('checkbox'))

            expect(screen.getByText('TIE Advanced x1')).toBeInTheDocument()
        })

        it('should show no ships when search has no match', async () => {
            mockHomeFetch(
                Promise.resolve({
                    ok: true,
                    json: async () => fakeShips,
                }),
            )

            const user = userEvent.setup()
            renderHome()
            await screen.findByText('Millennium Falcon')

            await user.type(screen.getByPlaceholderText(/millennium, x-wing/i), 'Nave Inexistente')

            await waitFor(() => {
                expect(screen.queryByText('Millennium Falcon')).not.toBeInTheDocument()
                expect(screen.queryByText('X-Wing Starfighter')).not.toBeInTheDocument()
                expect(screen.queryByText('TIE Advanced x1')).not.toBeInTheDocument()
            })
        })
    })
})
