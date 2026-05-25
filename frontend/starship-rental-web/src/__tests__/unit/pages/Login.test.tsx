import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../../pages/Login'

function renderLogin() {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>,
    )
}

// The submit button (type="submit") vs the tab button (type="button", text "Entrar")
function getSubmitBtn() {
    return document.querySelector('button[type="submit"]') as HTMLElement
}

describe('Login', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('Render', () => {
        it('should render login form by default', () => {
            renderLogin()
            expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
        })

        it('should not show name and CPF fields in login mode', () => {
            renderLogin()
            expect(screen.queryByLabelText(/^nome$/i)).not.toBeInTheDocument()
            expect(screen.queryByLabelText(/cpf/i)).not.toBeInTheDocument()
        })

        it('should show name and CPF fields after switching to register', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(screen.getByRole('button', { name: /criar conta/i }))
            expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
        })

        it('should change submit button label to Criar Conta when register tab is active', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(screen.getByRole('button', { name: /criar conta/i }))
            expect(getSubmitBtn()).toHaveTextContent('Criar Conta')
        })
    })

    describe('Validation', () => {
        it('should show error when email is empty on submit', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(getSubmitBtn())
            expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument()
        })

        it('should show error when email format is invalid', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.type(screen.getByLabelText(/e-mail/i), 'email-invalido')
            await user.click(getSubmitBtn())
            expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
        })

        it('should show error when password is empty', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.click(getSubmitBtn())
            expect(await screen.findByText('Senha é obrigatória')).toBeInTheDocument()
        })

        it('should show error when name is empty on register', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(screen.getByRole('button', { name: /criar conta/i }))
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.type(screen.getByLabelText(/senha/i), 'senha123')
            await user.click(getSubmitBtn())
            expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument()
        })

        it('should show error when CPF is empty on register', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(screen.getByRole('button', { name: /criar conta/i }))
            await user.type(screen.getByLabelText(/^nome$/i), 'Luke Skywalker')
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.type(screen.getByLabelText(/senha/i), 'senha123')
            await user.click(getSubmitBtn())
            expect(await screen.findByText('CPF é obrigatório')).toBeInTheDocument()
        })

        it('should clear error when a new valid submit is attempted', async () => {
            const user = userEvent.setup()
            renderLogin()
            await user.click(getSubmitBtn())
            expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument()
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.click(getSubmitBtn())
            await waitFor(() => {
                expect(screen.queryByText('E-mail é obrigatório')).not.toBeInTheDocument()
            })
        })
    })

    describe('Fetch', () => {
        it('should call fetch with login credentials on submit', async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ token: 'token-123', user: { id: 1, name: 'Luke', email: 'pilot@test.com', role: 'Cliente' } }),
            })
            vi.stubGlobal('fetch', fetchMock)
            vi.stubGlobal('location', { replace: vi.fn(), href: '/' })

            const user = userEvent.setup()
            renderLogin()
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.type(screen.getByLabelText(/senha/i), 'senha123')
            await user.click(getSubmitBtn())

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    'http://localhost:8080/users/login',
                    expect.objectContaining({ method: 'POST' }),
                )
            })
        })

        it('should show error message when fetch returns error response', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                text: async () => JSON.stringify({ message: 'Credenciais inválidas' }),
            }))

            const user = userEvent.setup()
            renderLogin()
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.type(screen.getByLabelText(/senha/i), 'senha-errada')
            await user.click(getSubmitBtn())

            expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument()
        })

        it('should show connection error when fetch throws', async () => {
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))

            const user = userEvent.setup()
            renderLogin()
            await user.type(screen.getByLabelText(/e-mail/i), 'pilot@test.com')
            await user.type(screen.getByLabelText(/senha/i), 'senha123')
            await user.click(getSubmitBtn())

            expect(await screen.findByText('Failed to fetch')).toBeInTheDocument()
        })
    })
})
