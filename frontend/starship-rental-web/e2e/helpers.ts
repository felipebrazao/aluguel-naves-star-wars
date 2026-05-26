import { test, expect } from '@playwright/test'

/**
 * Helper: simula um usuário autenticado definindo localStorage antes da navegação.
 */
async function authenticateAs(
    page: Parameters<Parameters<typeof test>[1]>[0]['page'],
    role: 'Cliente' | 'Admin' = 'Cliente',
) {
    await page.addInitScript(([r]) => {
        localStorage.setItem('token', 'fake-jwt-token')
        localStorage.setItem(
            'user',
            JSON.stringify({ id: 1, name: 'Piloto Teste', email: 'piloto@galaxia.com', role: r }),
        )
    }, [role] as [string])
}

export { authenticateAs }
