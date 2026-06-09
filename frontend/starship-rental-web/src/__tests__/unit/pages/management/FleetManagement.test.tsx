import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FleetManagement from '../../../../pages/management/FleetManagement'

type ApiShip = {
    id: number
    name: string
    model: string
    status: string
}

function buildFleetResponse(ships: ApiShip[]): Response {
    return {
        ok: true,
        status: 200,
        json: async () => ships,
    } as Response
}

describe('FleetManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load ships from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildFleetResponse([
                { id: 1, name: 'Millennium Falcon', model: 'YT-1300', status: 'disponivel' },
                { id: 2, name: 'X-Wing', model: 'T-65', status: 'manutencao' },
            ]),
        )

        render(<FleetManagement />)

        await waitFor(() => {
            expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        })

        expect(screen.getByText('X-Wing')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar frota/i })).toBeInTheDocument()
    })

    it('should allow selecting disponivel and submit status update', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(
                buildFleetResponse([
                    { id: 1, name: 'Millennium Falcon', model: 'YT-1300', status: 'manutencao' },
                ]),
            )
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) } as Response)
            .mockResolvedValueOnce(
                buildFleetResponse([
                    { id: 1, name: 'Millennium Falcon', model: 'YT-1300', status: 'disponivel' },
                ]),
            )

        render(<FleetManagement />)

        await waitFor(() => {
            expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /gerir status/i }))
        const combo = screen.getByRole('combobox', { name: /novo status/i })
        await user.selectOptions(combo, 'disponivel')

        const dialog = screen.getByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/spaceships/1/status'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })
})
