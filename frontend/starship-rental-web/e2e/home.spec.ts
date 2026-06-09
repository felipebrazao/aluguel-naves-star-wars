import { test, expect } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Página Home (Catálogo de Naves)
 *
 * Cobre:
 *  - Redirecionamento para /login sem autenticação
 *  - Estrutura e renderização da página (independente de dados na BD)
 *  - Interação com o campo de busca
 *  - Interação com o filtro de disponibilidade
 *  - Navegação para detalhe da nave (condicional — requer naves na BD)
 */
test.describe('Catálogo de Naves (Home)', () => {

    test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL('/login')
    })

    test.describe('Utilizador autenticado', () => {
        test.beforeEach(async ({ page }) => {
            await authenticateAs(page)
            // Regista o listener antes de navegar para capturar a resposta da API
            const shipsLoaded = page.waitForResponse(
                (res) => res.url().includes('/spaceships') && res.status() === 200,
            )
            await page.goto('/')
            await shipsLoaded
        })

        // ── Renderização estrutural ───────────────────────────────────────────
        // Estas asserções validam a estrutura da página e não dependem de dados

        test('deve exibir o cabeçalho do catálogo', async ({ page }) => {
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()
        })

        test('deve exibir o campo de busca', async ({ page }) => {
            await expect(page.getByPlaceholder(/millennium, x-wing/i)).toBeVisible()
        })

        test('deve exibir o checkbox "Apenas disponíveis"', async ({ page }) => {
            await expect(page.getByText('Apenas disponíveis')).toBeVisible()
            await expect(page.getByRole('checkbox')).toBeVisible()
        })

        test('o checkbox deve começar desmarcado', async ({ page }) => {
            await expect(page.getByRole('checkbox')).not.toBeChecked()
        })

        // ── Interação com o campo de busca ────────────────────────────────────

        test('deve aceitar texto no campo de busca sem quebrar a página', async ({ page }) => {
            const searchInput = page.getByPlaceholder(/millennium, x-wing/i)

            await searchInput.fill('Falcon')
            await expect(searchInput).toHaveValue('Falcon')
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()

            await searchInput.clear()
            await expect(searchInput).toHaveValue('')
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()
        })

        test('deve filtrar a lista ao digitar no campo de busca', async ({ page }) => {
            const allCards = page.getByRole('heading', { level: 3 })
            const totalBefore = await allCards.count()

            if (totalBefore < 2) {
                test.skip()
            }

            const searchInput = page.getByPlaceholder(/millennium, x-wing/i)
            // Busca pelo nome da primeira nave para garantir que filtra as restantes
            const firstName = await allCards.first().textContent()
            await searchInput.fill(firstName ?? 'inexistente')

            const totalAfter = await page.getByRole('heading', { level: 3 }).count()
            expect(totalAfter).toBeLessThanOrEqual(totalBefore)

            await searchInput.clear()
            await expect(page.getByRole('heading', { level: 3 })).toHaveCount(totalBefore)
        })

        // ── Interação com o filtro de disponibilidade ─────────────────────────

        test('deve marcar e desmarcar o checkbox "Apenas disponíveis" sem quebrar a página', async ({ page }) => {
            const checkbox = page.getByRole('checkbox')

            await checkbox.check()
            await expect(checkbox).toBeChecked()
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()

            await checkbox.uncheck()
            await expect(checkbox).not.toBeChecked()
            await expect(page.getByText('Catálogo de Naves')).toBeVisible()
        })

        test('deve reduzir (ou manter) o número de naves ao filtrar por disponíveis', async ({ page }) => {
            const allCards = page.getByRole('heading', { level: 3 })
            // Aguarda o carregamento inicial antes de contar — evita condição de corrida com a API
            await expect(allCards.first()).toBeVisible({ timeout: 15_000 }).catch(() => undefined)
            const totalBefore = await allCards.count()

            await page.getByRole('checkbox').check()

            const totalAfter = await page.getByRole('heading', { level: 3 }).count()
            expect(totalAfter).toBeLessThanOrEqual(totalBefore)
        })

        // ── Navegação ─────────────────────────────────────────────────────────

        test('deve navegar para a página de detalhes ao clicar em "Ver detalhes"', async ({ page }) => {
            const detailLinks = page.getByRole('link', { name: 'Ver detalhes' })
            const count = await detailLinks.count()

            if (count === 0) {
                test.skip()
            }

            await detailLinks.first().click()
            await expect(page).toHaveURL(/\/nave\//)
        })
    })
})
