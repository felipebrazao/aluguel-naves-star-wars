import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Página de Login / Autenticação
 *
 * Cobre:
 *  - Renderização dos campos
 *  - Validações client-side (e-mail vazio, formato, senha vazia)
 *  - Troca de tab Entrar ↔ Criar Conta
 *  - Login com sucesso (API mockada)
 *  - Login com falha (API mockada)
 */
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

    // ── Validações ────────────────────────────────────────────────────────────

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

    // ── Chamadas de API (mockadas) ────────────────────────────────────────────

    test('deve redirecionar para / após login bem-sucedido', async ({ page }) => {
        await page.route('**/users/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: 'jwt-valido',
                    user: { id: 1, name: 'Piloto', email: 'teste@galaxia.com', role: 'Cliente' },
                }),
            })
        })

        await page.locator('#email').fill('teste@galaxia.com')
        await page.locator('#password').fill('senha123')
        await page.locator('button[type="submit"]').click()

        await expect(page).toHaveURL('/')
    })

    test('deve exibir mensagem de erro quando o login falhar (401)', async ({ page }) => {
        await page.route('**/users/login', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Credenciais inválidas' }),
            })
        })

        await page.locator('#email').fill('teste@galaxia.com')
        await page.locator('#password').fill('senhaerrada')
        await page.locator('button[type="submit"]').click()

        await expect(page.getByText('Credenciais inválidas')).toBeVisible()
    })

    test('deve exibir erro de conexão quando a API estiver indisponível', async ({ page }) => {
        await page.route('**/users/login', async (route) => {
            await route.abort('connectionrefused')
        })

        await page.locator('#email').fill('teste@galaxia.com')
        await page.locator('#password').fill('senha123')
        await page.locator('button[type="submit"]').click()

        await expect(page.getByText(/erro de conex/i)).toBeVisible()
    })
})
