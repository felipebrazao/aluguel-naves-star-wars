import { test, expect } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Painel de Gestão (Fleet + Planets)
 *
 * Cobre:
 *  - Tabs Frota / Planetas
 *  - Tabela de naves com badges de status
 *  - Modal "Editar Nave" (abrir, cancelar, campos de MANUTENCAO, submeter)
 *  - Modal "Editar Planeta" (abrir, campos de BLOQUEADO, submeter)
 */
test.describe('Painel de Gestão', () => {
    test.beforeEach(async ({ page }) => {
        await authenticateAs(page, 'Admin')

        // Regista os listeners antes de navegar para capturar as respostas
        const fleetLoaded = page.waitForResponse(
            (res) => res.url().includes('/spaceships') && res.status() === 200,
        )
        const planetsLoaded = page.waitForResponse(
            (res) => res.url().includes('/planets') && res.status() === 200,
        )

        await page.goto('/painel/gestao')
        await Promise.all([fleetLoaded, planetsLoaded])
    })

    // ── Tabs ──────────────────────────────────────────────────────────────────

    test('deve exibir as tabs Frota e Planetas', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /frota/i })).toBeVisible()
        await expect(page.getByRole('tab', { name: /planetas/i })).toBeVisible()
    })

    test('deve exibir a tab Frota ativa por padrão', async ({ page }) => {
        await expect(page.getByText('Gestão de Frota')).toBeVisible()
    })

    test('deve alternar para a tab Planetas ao clicar', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await expect(page.getByText('Gestão de Planetas')).toBeVisible()
    })

    // ── Tabela de Frota ───────────────────────────────────────────────────────

    test('deve listar as naves da frota', async ({ page }) => {
        // Verifica que a tabela tem pelo menos uma linha — não depende de nomes fixos
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0)
    })

    test('deve exibir badges de status nas naves', async ({ page }) => {
        // Verifica que existe pelo menos um badge de status renderizado na tabela
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        await expect(
            page.locator('table tbody td span').first(),
        ).toBeVisible()
    })

    // ── Modal Editar Nave ─────────────────────────────────────────────────────

    test('deve abrir o modal ao clicar em "Editar" na frota', async ({ page }) => {
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/editar nave/i)).toBeVisible()
    })

    test('deve fechar o modal ao clicar em "Cancelar"', async ({ page }) => {
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /cancelar/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('deve exibir campos extras ao selecionar MANUTENCAO', async ({ page }) => {
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await page.getByRole('dialog').getByRole('combobox').selectOption('manutencao')
        await expect(page.getByLabel(/custo estimado/i)).toBeVisible()
        await expect(page.getByLabel(/descrição do reparo/i)).toBeVisible()
    })

    test('deve fechar o modal ao submeter o formulário da nave', async ({ page }) => {
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /guardar alterações/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    })

    // ── Tabela de Planetas ────────────────────────────────────────────────────

    test('deve listar os planetas na tab Planetas', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        // getByRole filtra apenas elementos visíveis — confirma que há planetas na tab activa
        await expect(page.getByRole('button', { name: /editar/i }).first()).toBeVisible({ timeout: 10_000 })
        expect(await page.getByRole('button', { name: /editar/i }).count()).toBeGreaterThan(0)
    })

    // ── Modal Editar Planeta ──────────────────────────────────────────────────

    test('deve abrir o modal ao clicar em "Editar" nos planetas', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await expect(page.getByRole('button', { name: /editar/i }).first()).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/editar planeta/i)).toBeVisible()
    })

    test('deve exibir campo de restrição ao selecionar BLOQUEADO', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await expect(page.getByRole('button', { name: /editar/i }).first()).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await page.getByRole('dialog').getByRole('combobox').selectOption('bloqueado')
        await expect(page.getByLabel(/motivo da restrição/i)).toBeVisible()
    })

    test('deve fechar o modal de planeta ao submeter', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await expect(page.getByRole('button', { name: /editar/i }).first()).toBeVisible({ timeout: 10_000 })
        await page.getByRole('button', { name: /editar/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /guardar alterações/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    })
})
