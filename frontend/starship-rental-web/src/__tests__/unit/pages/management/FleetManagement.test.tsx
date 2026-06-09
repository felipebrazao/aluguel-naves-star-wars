import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FleetManagement from '../../../../pages/management/FleetManagement'

type ApiShip = {
    id: number
    name: string
    model: string
    manufacturer: string
    capacity: number
    dailyPrice: string
    status: string
    active: boolean   // campo obrigatório — separa status físico de estado lógico
}

function buildFleetResponse(ships: ApiShip[]): Response {
    return {
        ok: true,
        status: 200,
        json: async () => ships,
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

const falconShip: ApiShip = {
    id: 1,
    name: 'Millennium Falcon',
    model: 'YT-1300',
    manufacturer: 'Corellian Engineering',
    capacity: 6,
    dailyPrice: '100000',
    status: 'manutencao',
    active: true,
}

describe('FleetManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load ships from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildFleetResponse([
                falconShip,
                { id: 2, name: 'X-Wing', model: 'T-65', manufacturer: 'Incom', capacity: 1, dailyPrice: '150000', status: 'disponivel', active: true },
            ]),
        )

        render(<FleetManagement />)

        await waitFor(() => {
            expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        })

        expect(screen.getByText('X-Wing')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar frota/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sincronizar swapi/i })).toBeInTheDocument()
    })

    it('should show desativada badge for inactive ships', async () => {
        const inactiveShip: ApiShip = { ...falconShip, active: false }
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildFleetResponse([inactiveShip]))

        render(<FleetManagement />)
        await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

        expect(screen.getByText('desativada')).toBeInTheDocument()
    })

    it('should open edit modal pre-filled with ship data', async () => {
        const user = userEvent.setup()
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildFleetResponse([falconShip]))

        render(<FleetManagement />)
        await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByDisplayValue('Millennium Falcon')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('YT-1300')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('Corellian Engineering')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('6')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('100000')).toBeInTheDocument()
    })

    it('should pre-select desativada in modal for inactive ships', async () => {
        const user = userEvent.setup()
        const inactiveShip: ApiShip = { ...falconShip, active: false }
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildFleetResponse([inactiveShip]))

        render(<FleetManagement />)
        await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const combo = screen.getByRole('combobox', { name: /status da frota/i })
        expect((combo as HTMLSelectElement).value).toBe('desativada')
    })

    describe('handleSubmit — separação de conceitos', () => {
        it('should only call PUT when neither active state nor physical status change', async () => {
            const user = userEvent.setup()
            const fetchMock = vi.spyOn(globalThis, 'fetch')

            const ship = { ...falconShip, status: 'disponivel' }
            fetchMock
                .mockResolvedValueOnce(buildFleetResponse([ship]))
                .mockResolvedValueOnce(buildOkResponse())   // PUT
                .mockResolvedValueOnce(buildFleetResponse([ship]))

            render(<FleetManagement />)
            await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

            await user.click(screen.getByRole('button', { name: /editar/i }))
            const dialog = screen.getByRole('dialog')
            await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1'),
                    expect.objectContaining({ method: 'PUT' }),
                )
            })
            expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/active'), expect.anything())
            expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/status'), expect.anything())
        })

        it('should call PUT + PATCH /status when only physical status changes', async () => {
            const user = userEvent.setup()
            const fetchMock = vi.spyOn(globalThis, 'fetch')

            // Nave ativa em manutenção → usuário muda para disponivel
            fetchMock
                .mockResolvedValueOnce(buildFleetResponse([falconShip]))   // status: 'manutencao', active: true
                .mockResolvedValueOnce(buildOkResponse())                  // PUT
                .mockResolvedValueOnce(buildOkResponse())                  // PATCH /status
                .mockResolvedValueOnce(buildFleetResponse([{ ...falconShip, status: 'disponivel' }]))

            render(<FleetManagement />)
            await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

            await user.click(screen.getByRole('button', { name: /editar/i }))
            const combo = within(screen.getByRole('dialog')).getByRole('combobox', { name: /status da frota/i })
            await user.selectOptions(combo, 'disponivel')
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar alterações/i }))

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1'),
                    expect.objectContaining({ method: 'PUT' }),
                )
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1/status'),
                    expect.objectContaining({ method: 'PATCH' }),
                )
            })
            expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/active'), expect.anything())
        })

        it('should call PUT + PATCH /active when deactivating an active ship', async () => {
            const user = userEvent.setup()
            const fetchMock = vi.spyOn(globalThis, 'fetch')

            const activeShip = { ...falconShip, status: 'disponivel', active: true }
            fetchMock
                .mockResolvedValueOnce(buildFleetResponse([activeShip]))
                .mockResolvedValueOnce(buildOkResponse())   // PUT
                .mockResolvedValueOnce(buildOkResponse())   // PATCH /active
                .mockResolvedValueOnce(buildFleetResponse([{ ...activeShip, active: false }]))

            render(<FleetManagement />)
            await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

            await user.click(screen.getByRole('button', { name: /editar/i }))
            const combo = within(screen.getByRole('dialog')).getByRole('combobox', { name: /status da frota/i })
            await user.selectOptions(combo, 'desativada')
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar alterações/i }))

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1'),
                    expect.objectContaining({ method: 'PUT' }),
                )
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1/active'),
                    expect.objectContaining({ method: 'PATCH' }),
                )
            })
            expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/status'), expect.anything())
        })

        it('should call PUT + PATCH /active + PATCH /status when reactivating with a new physical status', async () => {
            const user = userEvent.setup()
            const fetchMock = vi.spyOn(globalThis, 'fetch')

            // Nave inativa com status físico 'manutencao' → reativar como 'disponivel'
            const inactiveShip: ApiShip = { ...falconShip, status: 'manutencao', active: false }
            fetchMock
                .mockResolvedValueOnce(buildFleetResponse([inactiveShip]))
                .mockResolvedValueOnce(buildOkResponse())   // PUT
                .mockResolvedValueOnce(buildOkResponse())   // PATCH /active (reactivate)
                .mockResolvedValueOnce(buildOkResponse())   // PATCH /status  (manutencao → disponivel)
                .mockResolvedValueOnce(buildFleetResponse([{ ...inactiveShip, active: true, status: 'disponivel' }]))

            render(<FleetManagement />)
            await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

            await user.click(screen.getByRole('button', { name: /editar/i }))
            // Modal abre com 'desativada' pré-selecionado; usuário muda para 'disponivel'
            const combo = within(screen.getByRole('dialog')).getByRole('combobox', { name: /status da frota/i })
            await user.selectOptions(combo, 'disponivel')
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar alterações/i }))

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1'),
                    expect.objectContaining({ method: 'PUT' }),
                )
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1/active'),
                    expect.objectContaining({ method: 'PATCH' }),
                )
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1/status'),
                    expect.objectContaining({ method: 'PATCH' }),
                )
            })
        })

        it('should call PUT + PATCH /active when reactivating to same physical status', async () => {
            const user = userEvent.setup()
            const fetchMock = vi.spyOn(globalThis, 'fetch')

            // Nave inativa com status físico 'disponivel' → reativar como 'disponivel' (sem mudar status físico)
            const inactiveShip: ApiShip = { ...falconShip, status: 'disponivel', active: false }
            fetchMock
                .mockResolvedValueOnce(buildFleetResponse([inactiveShip]))
                .mockResolvedValueOnce(buildOkResponse())   // PUT
                .mockResolvedValueOnce(buildOkResponse())   // PATCH /active
                .mockResolvedValueOnce(buildFleetResponse([{ ...inactiveShip, active: true }]))

            render(<FleetManagement />)
            await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

            await user.click(screen.getByRole('button', { name: /editar/i }))
            // Muda de 'desativada' para 'disponivel' (mesmo status físico)
            const combo = within(screen.getByRole('dialog')).getByRole('combobox', { name: /status da frota/i })
            await user.selectOptions(combo, 'disponivel')
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar alterações/i }))

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining('/spaceships/1/active'),
                    expect.objectContaining({ method: 'PATCH' }),
                )
            })
            expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/status'), expect.anything())
        })
    })

    it('should sync SWAPI when sync button is clicked', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildFleetResponse([falconShip]))
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ mensagem: 'ok', totalNaves: 5 }), text: async () => '' } as Response)
            .mockResolvedValueOnce(buildFleetResponse([falconShip]))

        render(<FleetManagement />)
        await waitFor(() => expect(screen.getByText('Millennium Falcon')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /sincronizar swapi/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/spaceships/import'),
                expect.objectContaining({ method: 'POST' }),
            )
        })
    })
})
