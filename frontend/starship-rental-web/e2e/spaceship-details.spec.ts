import { test, expect, type Page } from '@playwright/test'
import { authenticateAs } from './helpers'

/**
 * Testes E2E — Página de Detalhes da Nave + Checkout
 *
 * Cobre:
 *  - Exibição das informações da nave (estrutural — independente de dados fixos)
 *  - Formulário de checkout (campos, status disabled/enabled)
 *  - Cálculo do total ao selecionar datas
 *  - Validação: data de fim anterior à data de início mantém o botão desabilitado
 */

// Datas futuras em formato dd/MM/yyyy (dateFormat do react-datepicker)
const DATE_START = '01/07/2030'
const DATE_END = '06/07/2030' // 5 dias depois

/**
 * Preenche um campo de DatePicker digitando a data carácter a carácter.
 * react-datepicker actualiza o estado interno ao reconhecer o valor completo.
 */
async function fillDatePicker(page: Page, selector: string, value: string): Promise<void> {
    await page.locator(selector).click({ clickCount: 3 }) // selecciona texto existente
    await page.keyboard.type(value, { delay: 30 })
    await page.keyboard.press('Escape') // fecha o calendário sem cancelar a data
}

test.describe('Detalhes da Nave', () => {
    test.beforeEach(async ({ page }) => {
        await authenticateAs(page)

        // Regista o listener antes de navegar para capturar a resposta
        const shipsLoaded = page.waitForResponse(
            (res) => res.url().includes('/spaceships') && res.status() === 200,
        )
        await page.goto('/')
        await shipsLoaded

        // Clica no primeiro "Ver detalhes" disponível
        const firstLink = page.getByRole('link', { name: 'Ver detalhes' }).first()
        const linkCount = await page.getByRole('link', { name: 'Ver detalhes' }).count()
        if (linkCount === 0) {
            // Sem naves no catálogo — todos os testes serão ignorados
            test.skip()
        }

        await firstLink.click()
        await page.waitForURL(/\/nave\/\d+/)

        // Aguarda o carregamento dos dados da nave
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 10_000 })
    })

    // ── Renderização ──────────────────────────────────────────────────────────

    test('deve exibir o cabeçalho da nave', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
    })

    test('deve exibir as informações da ficha técnica', async ({ page }) => {
        await expect(page.getByText(/fabricante/i)).toBeVisible()
        await expect(page.getByText(/capacidade/i)).toBeVisible()
    })

    test('deve exibir o preço diário formatado', async ({ page }) => {
        // Preço diário mínimo é R$ 100,00 (PISO do backend)
        await expect(page.getByText(/R\$\s*[\d.]+,\d{2}/).first()).toBeVisible()
    })

    test('deve exibir o badge de status da nave', async ({ page }) => {
        // O badge renderiza o status em minúsculas no DOM (CSS uppercase é visual)
        await expect(
            page.locator('span').filter({
                hasText: /^(disponivel|manutencao|desativada|alugada)$/,
            }).first(),
        ).toBeVisible()
    })

    // ── Formulário de checkout ────────────────────────────────────────────────

    test('deve exibir os campos de data, planeta e método de pagamento', async ({ page }) => {
        await expect(page.locator('#startDate')).toBeVisible()
        await expect(page.locator('#endDate')).toBeVisible()
        await expect(page.locator('#pickupPlanet')).toBeVisible()
        await expect(page.locator('#returnPlanet')).toBeVisible()
        await expect(page.locator('#paymentMethod')).toBeVisible()
    })

    test('deve ter o botão de confirmação desabilitado por padrão', async ({ page }) => {
        await expect(page.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
    })

    test('deve exibir total R$ 0,00 antes de selecionar datas', async ({ page }) => {
        await expect(page.getByText('R$ 0,00')).toBeVisible()
    })

    // ── Cálculo de preço ──────────────────────────────────────────────────────

    test('deve calcular o total ao preencher datas válidas', async ({ page }) => {
        await fillDatePicker(page, '#startDate', DATE_START)
        await fillDatePicker(page, '#endDate', DATE_END)

        // O total deve deixar de ser R$ 0,00 e mostrar um valor positivo
        await expect(page.getByText('R$ 0,00')).not.toBeVisible({ timeout: 5_000 })
        await expect(page.getByText(/R\$\s*[\d.]+,\d{2}/).first()).toBeVisible()
    })

    test('deve habilitar o botão ao preencher todos os campos obrigatórios', async ({ page }) => {
        await fillDatePicker(page, '#startDate', DATE_START)
        await fillDatePicker(page, '#endDate', DATE_END)

        // Aguarda que as opções de planeta sejam carregadas pela API
        await page.locator('#pickupPlanet option:nth-child(2)').waitFor({ state: 'attached', timeout: 10_000 })

        await page.locator('#pickupPlanet').selectOption({ index: 1 })
        await page.locator('#returnPlanet').selectOption({ index: 1 })

        // Aguarda as opções de método de pagamento
        await page.locator('#paymentMethod option:nth-child(2)').waitFor({ state: 'attached', timeout: 10_000 })
        await page.locator('#paymentMethod').selectOption({ index: 1 })

        await expect(
            page.getByRole('button', { name: /confirmar aluguel/i }),
        ).toBeEnabled({ timeout: 10_000 })
    })

    test('deve manter o botão desabilitado quando data fim for anterior à data início', async ({ page }) => {
        // Define endDate antes de startDate para contornar a restrição minDate do DatePicker
        await fillDatePicker(page, '#endDate', '01/07/2030')
        await fillDatePicker(page, '#startDate', '15/07/2030') // depois da endDate → totalDays < 0

        await page.locator('#pickupPlanet option:nth-child(2)').waitFor({ state: 'attached', timeout: 10_000 })
        await page.locator('#pickupPlanet').selectOption({ index: 1 })
        await page.locator('#returnPlanet').selectOption({ index: 1 })

        await page.locator('#paymentMethod option:nth-child(2)').waitFor({ state: 'attached', timeout: 10_000 })
        await page.locator('#paymentMethod').selectOption({ index: 1 })

        await expect(page.getByRole('button', { name: /confirmar aluguel/i })).toBeDisabled()
    })
})
