import type { Page } from '@playwright/test'

const API_BASE = 'http://localhost:8081'

const e2eTestEmail = process.env['E2E_TEST_EMAIL'] ?? 'e2e_testuser@star-rental.test'
const e2eTestSecret = process.env['E2E_TEST_PASSWORD'] ?? 'E2eTest@123'

const TEST_USER = {
    name: 'Piloto E2E',
    email: e2eTestEmail,
    cpf: '99999999901',
    password: e2eTestSecret,
    roleId: 2,
}

/**
 * Garante que o utilizador de teste existe no banco, depois faz login real via API
 * e injeta o token/user no localStorage do origin http://localhost:5173.
 *
 * O parâmetro `role` é mantido por compatibilidade mas o papel efectivo é o do
 * utilizador criado na BD (roleId 2 = Cliente).
 */
async function authenticateAs(
    page: Page,
): Promise<void> {
    // Navega para o frontend para que o localStorage fique no origin correcto
    await page.goto('/login')

    // Tenta registar o utilizador de teste; ignora erros (pode já existir)
    await page.evaluate(
        async ({ user, api }) => {
            await fetch(`${api}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            }).catch(() => undefined)
        },
        { user: TEST_USER, api: API_BASE },
    )

    // Login real via API
    const session = await page.evaluate(
        async ({ email, password, api }) => {
            const res = await fetch(`${api}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            if (!res.ok) return null
            return res.json() as Promise<{ token: string; user: unknown }>
        },
        { email: TEST_USER.email, password: TEST_USER.password, api: API_BASE },
    )

    if (!session) {
        throw new Error(
            `authenticateAs: falha ao autenticar o utilizador de teste — `
            + `verifique se o backend está a correr em ${API_BASE}`,
        )
    }

    // Persiste a sessão no localStorage do origin localhost:5173
    await page.evaluate(
        ({ token, user }) => {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
        },
        session,
    )
}

export { authenticateAs }
