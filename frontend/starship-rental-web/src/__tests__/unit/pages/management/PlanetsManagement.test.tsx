import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlanetsManagement from '../../../../pages/management/PlanetsManagement'

type ApiPlanet = {
    id: number
    name: string
    terrain: string | null
    climate: string | null
    active: boolean
}

function buildPlanetsResponse(planets: ApiPlanet[]): Response {
    return {
        ok: true,
        status: 200,
        json: async () => planets,
    } as Response
}

describe('PlanetsManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load planets from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildPlanetsResponse([
                { id: 1, name: 'Coruscant', terrain: 'urbano', climate: 'temperado', active: true },
                { id: 2, name: 'Mustafar', terrain: 'vulcânico', climate: 'quente', active: false },
            ]),
        )

        render(<PlanetsManagement />)

        await waitFor(() => {
            expect(screen.getByText('Coruscant')).toBeInTheDocument()
        })

        expect(screen.getByText('Mustafar')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar planetas/i })).toBeInTheDocument()
    })

    it('should toggle planet active status when changed in modal', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(
                buildPlanetsResponse([
                    { id: 1, name: 'Coruscant', terrain: 'urbano', climate: 'temperado', active: true },
                ]),
            )
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) } as Response)
            .mockResolvedValueOnce(
                buildPlanetsResponse([
                    { id: 1, name: 'Coruscant', terrain: 'urbano', climate: 'temperado', active: false },
                ]),
            )

        render(<PlanetsManagement />)

        await waitFor(() => {
            expect(screen.getByText('Coruscant')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /gerir planeta/i }))
        await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'bloqueado')

        const dialog = screen.getByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/planets/1/active'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })
})
