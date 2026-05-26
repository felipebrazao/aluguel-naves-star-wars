import { test, expect } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Página de Detalhes da Nave + Checkout
 *
 * Cobre:
 *  - Exibição das informações da nave
 *  - Formulário de checkout (campos, status disabled/enabled)
 *  - Cálculo do total ao selecionar datas
 *  - Validação: data de fim anterior à de início mantém o botão desabilitado
 */
test.describe('Detalhes da Nave', () => {
    test.beforeEach(async ({ page }) => {
        await authenticateAs(page)
        // A rota usa o id da nave; usamos x-wing-starfighter que está no componente
        await page.goto('/nave/x-wing-starfighter')
    })

    // ── Renderização ──────────────────────────────────────────────────────────

    test('deve exibir o nome e o modelo da nave no cabeçalho', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /x-wing starfighter/i })).toBeVisible()
        await expect(page.getByText('T-65B')).toBeVisible()
    })

    test('deve exibir o fabricante e a capacidade', async ({ page }) => {
        await expect(page.getByText('Incom Corporation')).toBeVisible()
        await expect(page.getByText('1')).toBeVisible()
    })

    test('deve exibir o preço diário formatado', async ({ page }) => {
        await expect(page.getByText(/R\$\s*3200/)).toBeVisible()
    })

    test('deve exibir o badge de status da nave', async ({ page }) => {
        await expect(page.getByText('DISPONIVEL')).toBeVisible()
    })

    // ── Formulário de checkout ────────────────────────────────────────────────

    test('deve exibir os campos de data, retirada e devolução', async ({ page }) => {
        await expect(page.locator('#startDate')).toBeVisible()
        await expect(page.locator('#endDate')).toBeVisible()
        await expect(page.locator('#pickupLocation')).toBeVisible()
        await expect(page.locator('#dropoffLocation')).toBeVisible()
    })

    test('deve ter o botão de confirmação desabilitado por padrão', async ({ page }) => {
        await expect(page.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
    })

    test('deve exibir total R$ 0.00 antes de selecionar datas', async ({ page }) => {
        await expect(page.getByText(/R\$\s*0\.00/)).toBeVisible()
    })

    // ── Cálculo de preço ──────────────────────────────────────────────────────

    test('deve calcular o total ao preencher datas válidas', async ({ page }) => {
        // 5 dias × 3200 = 16000 → exibido como R$ 16000.00
        await page.locator('#startDate').fill('2026-06-01')
        await page.locator('#endDate').fill('2026-06-06')

        await expect(page.getByText(/16000/)).toBeVisible()
    })

    test('deve habilitar o botão ao preencher todos os campos', async ({ page }) => {
        await page.locator('#startDate').fill('2026-06-01')
        await page.locator('#endDate').fill('2026-06-06')
        await page.locator('#pickupLocation').selectOption('Coruscant Spaceport')
        await page.locator('#dropoffLocation').selectOption('Tatooine Mos Eisley')

        await expect(page.getByRole('button', { name: /confirmar aluguel/i })).toBeEnabled()
    })

    test('deve manter o botão desabilitado quando data fim for anterior à data início', async ({ page }) => {
        await page.locator('#startDate').fill('2026-06-10')
        await page.locator('#endDate').fill('2026-06-05')
        await page.locator('#pickupLocation').selectOption('Coruscant Spaceport')
        await page.locator('#dropoffLocation').selectOption('Tatooine Mos Eisley')

        await expect(page.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
    })

    // ── Opções de localização ─────────────────────────────────────────────────

    test('deve listar as opções de localização nos selects', async ({ page }) => {
        await expect(page.locator('#pickupLocation').locator('option', { hasText: 'Coruscant Spaceport' })).toHaveCount(1)
        await expect(page.locator('#pickupLocation').locator('option', { hasText: 'Tatooine Mos Eisley' })).toHaveCount(1)
        await expect(page.locator('#pickupLocation').locator('option', { hasText: 'Naboo Royal Dock' })).toHaveCount(1)
    })
})
