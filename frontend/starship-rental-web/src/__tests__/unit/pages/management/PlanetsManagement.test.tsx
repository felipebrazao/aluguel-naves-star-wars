import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlanetsManagement from '../../../../pages/management/PlanetsManagement'

type ApiPlanet = {
    id: number
    name: string
    terrain: string | null
    climate: string | null
    diameter: number | null
    population: number | null
    active: boolean
}

function buildPlanetsResponse(planets: ApiPlanet[]): Response {
    return {
        ok: true,
        status: 200,
        json: async () => planets,
    } as Response
}

function buildOkResponse(): Response {
    return {
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '',
    } as Response
}

const coruscantPlanet: ApiPlanet = {
    id: 1,
    name: 'Coruscant',
    terrain: 'urbano',
    climate: 'temperado',
    diameter: 12240,
    population: 1000000000000,
    active: true,
}

describe('PlanetsManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load planets from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildPlanetsResponse([
                coruscantPlanet,
                { id: 2, name: 'Mustafar', terrain: 'vulcânico', climate: 'quente', diameter: 4200, population: 20000, active: false },
            ]),
        )

        render(<PlanetsManagement />)

        await waitFor(() => {
            expect(screen.getByText('Coruscant')).toBeInTheDocument()
        })

        expect(screen.getByText('Mustafar')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar planetas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sincronizar swapi/i })).toBeInTheDocument()
    })

    it('should open edit modal pre-filled with planet data', async () => {
        const user = userEvent.setup()
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildPlanetsResponse([coruscantPlanet]))

        render(<PlanetsManagement />)
        await waitFor(() => expect(screen.getByText('Coruscant')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByDisplayValue('Coruscant')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('12240')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('temperado')).toBeInTheDocument()
    })

    it('should submit PUT and PATCH when data and status both change', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildPlanetsResponse([coruscantPlanet]))
            .mockResolvedValueOnce(buildOkResponse())   // PUT
            .mockResolvedValueOnce(buildOkResponse())   // PATCH
            .mockResolvedValueOnce(buildPlanetsResponse([{ ...coruscantPlanet, active: false }]))

        render(<PlanetsManagement />)
        await waitFor(() => expect(screen.getByText('Coruscant')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const dialog = screen.getByRole('dialog')
        await user.selectOptions(within(dialog).getByRole('combobox', { name: /status operacional/i }), 'bloqueado')

        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/planets/1'),
                expect.objectContaining({ method: 'PUT' }),
            )
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/planets/1/active'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })

    it('should submit PUT only when status is unchanged', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildPlanetsResponse([coruscantPlanet]))
            .mockResolvedValueOnce(buildOkResponse())   // PUT only
            .mockResolvedValueOnce(buildPlanetsResponse([coruscantPlanet]))

        render(<PlanetsManagement />)
        await waitFor(() => expect(screen.getByText('Coruscant')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))
        const dialog = screen.getByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/planets/1'),
                expect.objectContaining({ method: 'PUT' }),
            )
            expect(fetchMock).not.toHaveBeenCalledWith(
                expect.stringContaining('/active'),
                expect.anything(),
            )
        })
    })

    it('should sync SWAPI when sync button is clicked', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildPlanetsResponse([coruscantPlanet]))
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ mensagem: 'ok', totalPlanetas: 60 }), text: async () => '' } as Response)
            .mockResolvedValueOnce(buildPlanetsResponse([coruscantPlanet]))

        render(<PlanetsManagement />)
        await waitFor(() => expect(screen.getByText('Coruscant')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /sincronizar swapi/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/planets/import'),
                expect.objectContaining({ method: 'POST' }),
            )
        })
    })
})
