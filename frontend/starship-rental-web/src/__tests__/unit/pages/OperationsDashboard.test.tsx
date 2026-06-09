import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OperationsDashboard from '../../../pages/OperationsDashboard'

type FetchLikeResponse = {
    ok: boolean
    status: number
    json: () => Promise<unknown>
}

function buildJsonResponse(data: unknown): FetchLikeResponse {
    return {
        ok: true,
        status: 200,
        json: async () => data,
    }
}

describe('OperationsDashboard', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should render rentals from api with customer names', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildJsonResponse([
                {
                    id: 1,
                    userId: 10,
                    userName: 'Leia Organa',
                    spaceshipId: 100,
                    spaceshipName: 'Tantive IV',
                    status: 'ativa',
                    pickupPlanetId: 1,
                    pickupPlanetName: 'Alderaan',
                    returnPlanetId: 2,
                    returnPlanetName: 'Coruscant',
                    startDate: '2026-05-01T10:00:00',
                    endDate: '2026-05-03T10:00:00',
                    actualPickupDate: null,
                    actualReturnDate: null,
                    totalPrice: 4500,
                    createdAt: '2026-05-01T09:00:00',
                },
            ]) as unknown as Response,
        )

        render(<OperationsDashboard />)

        expect(screen.getByText('Dashboard Geral')).toBeInTheDocument()
        expect(screen.getByText('Carregando aluguéis...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('Leia Organa')).toBeInTheDocument()
        })

        expect(screen.getByText('Tantive IV')).toBeInTheDocument()
        expect(screen.getByText('ativa')).toBeInTheDocument()
        expect(screen.getByText(/créditos 4\.500/i)).toBeInTheDocument()
    })

    it('should render api error state', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({}),
        } as Response)

        render(<OperationsDashboard />)

        await waitFor(() => {
            expect(screen.getByText('Erro ao carregar aluguéis do dashboard')).toBeInTheDocument()
        })
    })
})
