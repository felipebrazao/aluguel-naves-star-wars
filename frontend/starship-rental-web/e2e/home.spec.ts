import { test, expect } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Página Home (Catálogo de Naves)
 *
 * Cobre:
 *  - Redirecionamento para /login sem autenticação
 *  - Exibição do catálogo de naves
 *  - Filtro por nome / modelo
 *  - Filtro por disponibilidade
 *  - Navegação para detalhe da nave
 */
test.describe('Catálogo de Naves (Home)', () => {

    test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL('/login')
    })

    test.describe('Usuário autenticado', () => {
        test.beforeEach(async ({ page }) => {
            await authenticateAs(page)
            await page.goto('/')
        })

        // ── Renderização ──────────────────────────────────────────────────────

        test('deve exibir o cabeçalho do catálogo', async ({ page }) => {
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()
        })

        test('deve exibir as três naves do catálogo', async ({ page }) => {
            await expect(page.getByText('Millennium Falcon')).toBeVisible()
            await expect(page.getByText('X-Wing Starfighter')).toBeVisible()
            await expect(page.getByText('TIE Advanced x1')).toBeVisible()
        })

        test('deve exibir o campo de busca', async ({ page }) => {
            await expect(page.getByPlaceholder(/millennium, x-wing/i)).toBeVisible()
        })

        test('deve exibir o checkbox "Apenas disponíveis"', async ({ page }) => {
            await expect(page.getByText('Apenas disponíveis')).toBeVisible()
        })

        // ── Filtro por nome ───────────────────────────────────────────────────

        test('deve filtrar naves ao digitar no campo de busca', async ({ page }) => {
            await page.getByPlaceholder(/millennium, x-wing/i).fill('Falcon')

            await expect(page.getByText('Millennium Falcon')).toBeVisible()
            await expect(page.getByText('X-Wing Starfighter')).not.toBeVisible()
            await expect(page.getByText('TIE Advanced x1')).not.toBeVisible()
        })

        test('deve filtrar pelo modelo da nave', async ({ page }) => {
            await page.getByPlaceholder(/millennium, x-wing/i).fill('T-65B')

            await expect(page.getByText('X-Wing Starfighter')).toBeVisible()
            await expect(page.getByText('Millennium Falcon')).not.toBeVisible()
        })

        test('deve mostrar todas as naves ao limpar o campo de busca', async ({ page }) => {
            await page.getByPlaceholder(/millennium, x-wing/i).fill('Falcon')
            await page.getByPlaceholder(/millennium, x-wing/i).clear()

            await expect(page.getByText('Millennium Falcon')).toBeVisible()
            await expect(page.getByText('X-Wing Starfighter')).toBeVisible()
            await expect(page.getByText('TIE Advanced x1')).toBeVisible()
        })

        // ── Filtro por disponibilidade ────────────────────────────────────────

        test('deve exibir somente naves disponíveis ao marcar o checkbox', async ({ page }) => {
            await page.getByRole('checkbox').check()

            await expect(page.getByText('Millennium Falcon')).toBeVisible()
            await expect(page.getByText('X-Wing Starfighter')).toBeVisible()
            // TIE Advanced x1 está MANUTENCAO
            await expect(page.getByText('TIE Advanced x1')).not.toBeVisible()
        })

        test('deve voltar a mostrar todas as naves ao desmarcar o checkbox', async ({ page }) => {
            await page.getByRole('checkbox').check()
            await page.getByRole('checkbox').uncheck()

            await expect(page.getByText('TIE Advanced x1')).toBeVisible()
        })

        // ── Navegação ─────────────────────────────────────────────────────────

        test('deve navegar para a página de detalhes ao clicar na nave', async ({ page }) => {
            await page.getByText('X-Wing Starfighter').click()
            await expect(page).toHaveURL(/\/nave\//)
        })
    })
})
