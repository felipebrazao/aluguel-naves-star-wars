import { test, expect } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Painel de Gestão (Fleet + Planets)
 *
 * Cobre:
 *  - Tabs Frota / Planetas
 *  - Tabela de naves com status
 *  - Modal "Gerir Status" (abrir, cancelar, campos de MANUTENCAO, submeter)
 *  - Modal "Gerir Planeta" (abrir, cancelar, campos de RESTRITO/BLOQUEADO, submeter)
 */
test.describe('Painel de Gestão', () => {
    test.beforeEach(async ({ page }) => {
        await authenticateAs(page, 'Admin')
        await page.goto('/painel/gestao')
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
        await expect(page.getByText('Millennium Falcon')).toBeVisible()
        await expect(page.getByText('X-Wing Starfighter')).toBeVisible()
        await expect(page.getByText('TIE Advanced x1')).toBeVisible()
    })

    test('deve exibir badges de status nas naves', async ({ page }) => {
        await expect(page.getByText('DISPONIVEL')).toBeVisible()
        await expect(page.getByText('MANUTENCAO')).toBeVisible()
        await expect(page.getByText('DESATIVADA')).toBeVisible()
    })

    // ── Modal Gerir Status ────────────────────────────────────────────────────

    test('deve abrir o modal ao clicar em "Gerir Status"', async ({ page }) => {
        await page.getByRole('button', { name: /gerir status/i }).first().click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/gerir status - millennium falcon/i)).toBeVisible()
    })

    test('deve fechar o modal ao clicar em "Cancelar"', async ({ page }) => {
        await page.getByRole('button', { name: /gerir status/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /cancelar/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('deve exibir campos extras ao selecionar MANUTENCAO', async ({ page }) => {
        await page.getByRole('button', { name: /gerir status/i }).first().click()
        await page.getByRole('dialog').getByRole('combobox').selectOption('MANUTENCAO')
        await expect(page.getByLabel(/custo estimado/i)).toBeVisible()
        await expect(page.getByLabel(/descrição do reparo/i)).toBeVisible()
    })

    test('deve fechar o modal ao submeter o formulário', async ({ page }) => {
        await page.getByRole('button', { name: /gerir status/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /guardar alterações/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    // ── Tabela de Planetas ────────────────────────────────────────────────────

    test('deve listar os planetas na tab Planetas', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await expect(page.getByText('Coruscant')).toBeVisible()
        await expect(page.getByText('Tatooine')).toBeVisible()
        await expect(page.getByText('Mustafar')).toBeVisible()
    })

    // ── Modal Gerir Planeta ───────────────────────────────────────────────────

    test('deve abrir o modal ao clicar em "Gerir Planeta"', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await page.getByRole('button', { name: /gerir planeta/i }).first().click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/gerir planeta - coruscant/i)).toBeVisible()
    })

    test('deve exibir campo de restrição ao selecionar RESTRITO', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await page.getByRole('button', { name: /gerir planeta/i }).first().click()
        await page.getByRole('dialog').getByRole('combobox').selectOption('RESTRITO')
        await expect(page.getByLabel(/motivo da restrição/i)).toBeVisible()
    })

    test('deve fechar o modal de planeta ao submeter', async ({ page }) => {
        await page.getByRole('tab', { name: /planetas/i }).click()
        await page.getByRole('button', { name: /gerir planeta/i }).first().click()
        await page.getByRole('dialog').getByRole('button', { name: /guardar alterações/i }).click()
        await expect(page.getByRole('dialog')).not.toBeVisible()
    })
})
