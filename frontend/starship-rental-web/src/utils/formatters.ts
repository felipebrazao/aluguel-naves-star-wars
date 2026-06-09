const ptBRCurrency = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

/**
 * Formata um valor monetário (BigDecimal vindo como string da API, ou number
 * calculado localmente) para exibição em pt-BR com 2 casas decimais.
 *
 * Exemplos:
 *   formatCredits('3200')    → '3.200,00'
 *   formatCredits('3200.50') → '3.200,50'
 *   formatCredits(9600)      → '9.600,00'
 *   formatCredits(null)      → '0,00'
 */
export function formatCredits(value: string | number | null | undefined): string {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? ptBRCurrency.format(numeric) : ptBRCurrency.format(0)
}
