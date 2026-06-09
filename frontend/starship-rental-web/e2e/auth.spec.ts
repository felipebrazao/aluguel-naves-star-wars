import { test, expect } from '@playwright/test'

/**
 * Gera um e-mail único para evitar colisões de UNIQUE no PostgreSQL.
 */
function uniqueEmail(): string {
    return `e2e_${Date.now()}_${Math.floor(Math.random() * 9_999)}@test.com`
}

/**
 * Gera um CPF de 11 dígitos matematicamente válido (algoritmo oficial).
 */
function generateValidCpf(): string {
    const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))

    const sum1 = digits.reduce((acc, d, i) => acc + d * (10 - i), 0)
    const r1 = (sum1 * 10) % 11
    const d1 = r1 >= 10 ? 0 : r1

    const digits10 = [...digits, d1]
    const sum2 = digits10.reduce((acc, d, i) => acc + d * (11 - i), 0)
    const r2 = (sum2 * 10) % 11
    const d2 = r2 >= 10 ? 0 : r2

    return [...digits, d1, d2].join('')
}

test.describe('Autenticação', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
    })

    // ── Renderização ──────────────────────────────────────────────────────────

    test('deve exibir campos de e-mail e senha', async ({ page }) => {
        await expect(page.locator('#email')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
    })

    test('deve exibir o título "Star Rental Access"', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /star rental access/i })).toBeVisible()
    })

    // ── Validações client-side ────────────────────────────────────────────────

    test('deve mostrar erro quando o e-mail estiver vazio', async ({ page }) => {
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('E-mail é obrigatório')).toBeVisible()
    })

    test('deve mostrar erro quando o formato do e-mail for inválido', async ({ page }) => {
        await page.locator('#email').fill('email-invalido')
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('E-mail inválido')).toBeVisible()
    })

    test('deve mostrar erro quando a senha estiver vazia', async ({ page }) => {
        await page.locator('#email').fill('teste@galaxia.com')
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('Senha é obrigatória')).toBeVisible()
    })

    // ── Troca de tab ──────────────────────────────────────────────────────────

    test('deve exibir campos de nome e CPF ao trocar para "Criar Conta"', async ({ page }) => {
        await page.getByRole('button', { name: 'Criar Conta' }).click()
        await expect(page.locator('#name')).toBeVisible()
        await expect(page.locator('#cpf')).toBeVisible()
    })

    test('deve exibir "Criar Conta" no botão submit ao entrar no modo de cadastro', async ({ page }) => {
        await page.getByRole('button', { name: 'Criar Conta' }).click()
        await expect(page.locator('button[type="submit"]')).toHaveText('Criar Conta')
    })

    test('deve esconder campos de nome e CPF ao voltar para "Entrar"', async ({ page }) => {
        await page.getByRole('button', { name: 'Criar Conta' }).click()
        await page.getByRole('button', { name: 'Entrar' }).click()
        await expect(page.locator('#name')).not.toBeVisible()
        await expect(page.locator('#cpf')).not.toBeVisible()
    })

    // ── Fluxo real de autenticação ────────────────────────────────────────────

    test('deve registar novo utilizador e redirecionar para / após login', async ({ page }) => {
        const email = uniqueEmail()
        const cpf = generateValidCpf()

        await page.getByRole('button', { name: 'Criar Conta' }).click()

        await page.locator('#name').fill('Piloto E2E')
        await page.locator('#cpf').fill(cpf)
        await page.locator('#email').fill(email)
        await page.locator('#password').fill('Senha@123')

        await page.locator('button[type="submit"]').click()

        await expect(page).toHaveURL('/', { timeout: 15_000 })
    })

    test('deve exibir mensagem de erro quando as credenciais forem incorretas', async ({ page }) => {
        await page.locator('#email').fill('naoeexiste_e2e@galaxia.com')
        await page.locator('#password').fill('senhaErrada999!')
        await page.locator('button[type="submit"]').click()

        // Valida que a API devolveu uma mensagem de erro (qualquer que seja o texto)
        await expect(page.locator('p.text-red-400')).toBeVisible({ timeout: 10_000 })
        // Garante que permanecemos na página de login
        await expect(page).toHaveURL('/login')
    })
})
