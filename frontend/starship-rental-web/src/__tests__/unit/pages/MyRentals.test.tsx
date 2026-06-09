import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MyRentals from '../../../pages/MyRentals'

type FetchResponse = {
    ok: boolean
    status?: number
    json?: () => Promise<unknown>
}

const fakeUser = {
    id: 1,
    name: 'Teste',
    email: 'teste@test.com',
    role: 'USER',
}

const fakeRentals = [
    {
        id: 1,
        spaceshipName: 'Millennium Falcon',
        status: 'ativa',
        totalPrice: 9600,
        startDate: '2026-05-17T00:00:00.000Z',
        endDate: '2026-05-20T00:00:00.000Z',
        pickupPlanetName: 'Coruscant',
        returnPlanetName: 'Tatooine',
    },
    {
        id: 2,
        spaceshipName: 'X-Wing Starfighter',
        status: 'concluida',
        totalPrice: 5400,
        startDate: '2026-05-12T00:00:00.000Z',
        endDate: '2026-05-14T00:00:00.000Z',
        pickupPlanetName: 'Naboo',
        returnPlanetName: 'Alderaan',
    },
]

const cancelledRentals = [
    {
        ...fakeRentals[0],
        status: 'cancelada',
    },
    fakeRentals[1],
]

function renderMyRentals() {
    return render(<MyRentals />)
}

function mockFetch(response: Promise<FetchResponse>) {
    globalThis.fetch = vi.fn().mockReturnValue(response) as typeof fetch
}

describe('MyRentals', () => {
    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify(fakeUser))
        globalThis.fetch = vi.fn() as typeof fetch
        vi.stubGlobal('confirm', vi.fn(() => true))
        vi.stubGlobal('alert', vi.fn())
    })

    afterEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
    })

    it('should show loading indicator while fetch is pending', () => {
        mockFetch(new Promise(() => undefined))

        renderMyRentals()

        expect(screen.getAllByText('Carregando...').length).toBeGreaterThan(0)
    })

    it('should show error message when fetch fails', async () => {
        mockFetch(Promise.resolve({ ok: false, status: 500 }))

        renderMyRentals()

        expect(await screen.findByText('Erro ao carregar aluguéis')).toBeInTheDocument()
        expect(screen.getByText('Erro ao carregar dados.')).toBeInTheDocument()
    })

    it('should render page header', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => fakeRentals,
            }),
        )

        renderMyRentals()

        expect(await screen.findByText('Meus Aluguéis')).toBeInTheDocument()
        expect(screen.getByText('Cliente')).toBeInTheDocument()
    })

    it('should render table column headers', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => fakeRentals,
            }),
        )

        renderMyRentals()

        await screen.findByText('Millennium Falcon')
        expect(screen.getByText('Nave')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Início')).toBeInTheDocument()
        expect(screen.getByText('Fim')).toBeInTheDocument()
        expect(screen.getByText('Valor')).toBeInTheDocument()
    })

    it('should render rental ship names', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => fakeRentals,
            }),
        )

        renderMyRentals()

        await screen.findByText('Millennium Falcon')
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
    })

    it('should render rental statuses', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => fakeRentals,
            }),
        )

        renderMyRentals()

        await screen.findByText('Millennium Falcon')
        expect(screen.getByText('ativa')).toBeInTheDocument()
        expect(screen.getByText('concluida')).toBeInTheDocument()
    })

    it('should render rental dates', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => fakeRentals,
            }),
        )

        renderMyRentals()

        await screen.findByText('Millennium Falcon')
        const expectedStartA = new Date(fakeRentals[0].startDate).toLocaleDateString('pt-BR')
        const expectedEndA = new Date(fakeRentals[0].endDate).toLocaleDateString('pt-BR')
        const expectedStartB = new Date(fakeRentals[1].startDate).toLocaleDateString('pt-BR')
        const expectedEndB = new Date(fakeRentals[1].endDate).toLocaleDateString('pt-BR')

        expect(screen.getByText(expectedStartA)).toBeInTheDocument()
        expect(screen.getByText(expectedEndA)).toBeInTheDocument()
        expect(screen.getByText(expectedStartB)).toBeInTheDocument()
        expect(screen.getByText(expectedEndB)).toBeInTheDocument()
    })

    it('should show empty state when no rentals are returned', async () => {
        mockFetch(
            Promise.resolve({
                ok: true,
                json: async () => [],
            }),
        )

        renderMyRentals()

        expect(await screen.findByText('Nenhum aluguel encontrado.')).toBeInTheDocument()
    })

    it('should cancel active rental and refresh the table', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => fakeRentals,
            })
            .mockResolvedValueOnce({
                ok: true,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => cancelledRentals,
            })

        globalThis.fetch = fetchMock as typeof fetch

        const user = userEvent.setup()
        renderMyRentals()

        expect(await screen.findByText('Millennium Falcon')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Cancelar' }))

        await waitFor(() => {
            expect(screen.getByText('cancelada')).toBeInTheDocument()
        })

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            'http://localhost:8081/rentals/user/1',
            expect.objectContaining({ headers: expect.any(Object) }),
        )
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            'http://localhost:8081/rentals/1/cancel',
            expect.objectContaining({ method: 'PATCH' }),
        )
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            'http://localhost:8081/rentals/user/1',
            expect.objectContaining({ headers: expect.any(Object) }),
        )
    })
})
