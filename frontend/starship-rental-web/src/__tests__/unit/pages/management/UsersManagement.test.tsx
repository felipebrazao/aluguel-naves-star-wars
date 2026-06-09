import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UsersManagement from '../../../../pages/management/UsersManagement'

type ApiUser = {
    id: number
    name: string
    email: string
    cpf: string
    role: string
    active: boolean
    swapiId: number | null
    createdAt: string
}

function buildUsersResponse(users: ApiUser[]): Response {
    return { ok: true, status: 200, json: async () => users } as Response
}

function buildOkResponse(): Response {
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' } as Response
}

const lukeUser: ApiUser = {
    id: 1,
    name: 'Luke Skywalker',
    email: 'luke@jedi.com',
    cpf: '12345678901',
    role: 'CLIENTE',
    active: true,
    swapiId: 1,
    createdAt: '2026-01-01T00:00:00',
}

describe('UsersManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load users from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            buildUsersResponse([
                lukeUser,
                { ...lukeUser, id: 2, name: 'Leia Organa', email: 'leia@rebellion.com', role: 'ADMIN', active: false },
            ]),
        )

        render(<UsersManagement />)

        await waitFor(() => expect(screen.getByText('Luke Skywalker')).toBeInTheDocument())

        expect(screen.getByText('Leia Organa')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sincronizar swapi/i })).toBeInTheDocument()
    })

    it('should open edit modal pre-filled with user data', async () => {
        const user = userEvent.setup()
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(buildUsersResponse([lukeUser]))

        render(<UsersManagement />)
        await waitFor(() => expect(screen.getByText('Luke Skywalker')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByDisplayValue('Luke Skywalker')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('luke@jedi.com')).toBeInTheDocument()
        expect(within(dialog).getByDisplayValue('12345678901')).toBeInTheDocument()
    })

    it('should submit PUT and PATCH when data and active status change', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildUsersResponse([lukeUser]))
            .mockResolvedValueOnce(buildOkResponse())   // PUT
            .mockResolvedValueOnce(buildOkResponse())   // PATCH active
            .mockResolvedValueOnce(buildUsersResponse([{ ...lukeUser, active: false }]))

        render(<UsersManagement />)
        await waitFor(() => expect(screen.getByText('Luke Skywalker')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))

        const dialog = screen.getByRole('dialog')
        await user.type(within(dialog).getByLabelText(/nova senha/i), 'newpassword123')
        await user.selectOptions(within(dialog).getByRole('combobox', { name: /status/i }), 'false')

        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/users/1'),
                expect.objectContaining({ method: 'PUT' }),
            )
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/users/1/active'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })

    it('should submit PUT only when active status is unchanged', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildUsersResponse([lukeUser]))
            .mockResolvedValueOnce(buildOkResponse())   // PUT only
            .mockResolvedValueOnce(buildUsersResponse([lukeUser]))

        render(<UsersManagement />)
        await waitFor(() => expect(screen.getByText('Luke Skywalker')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /editar/i }))
        const dialog = screen.getByRole('dialog')
        await user.type(within(dialog).getByLabelText(/nova senha/i), 'password123')

        await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/users/1'),
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
            .mockResolvedValueOnce(buildUsersResponse([lukeUser]))
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ mensagem: 'ok', totalUsuarios: 10 }), text: async () => '' } as Response)
            .mockResolvedValueOnce(buildUsersResponse([lukeUser]))

        render(<UsersManagement />)
        await waitFor(() => expect(screen.getByText('Luke Skywalker')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /sincronizar swapi/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/users/import'),
                expect.objectContaining({ method: 'POST' }),
            )
        })
    })
})
