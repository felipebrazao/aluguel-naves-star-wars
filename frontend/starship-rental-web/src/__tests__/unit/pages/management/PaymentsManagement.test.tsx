import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentsManagement from '../../../../pages/management/PaymentsManagement'

type ApiPayment = {
    id: number
    rentalId: number
    status: string
    amount: string
    paymentMethod: string
    paidAt: string | null
    createdAt: string
}

function buildPaymentsResponse(payments: ApiPayment[]): Response {
    return { ok: true, status: 200, json: async () => payments } as Response
}

function buildMethodsResponse(): Response {
    return {
        ok: true,
        status: 200,
        json: async () => [{ id: 1, name: 'Créditos Galácticos' }],
    } as Response
}

function buildOkPaymentResponse(payment: ApiPayment): Response {
    return { ok: true, status: 200, json: async () => payment, text: async () => '' } as Response
}

const pendingPayment: ApiPayment = {
    id: 10,
    rentalId: 42,
    status: 'pendente',
    amount: '4500',
    paymentMethod: 'Créditos Galácticos',
    paidAt: null,
    createdAt: '2026-06-01T12:00:00',
}

const approvedPayment: ApiPayment = {
    id: 11,
    rentalId: 43,
    status: 'aprovado',
    amount: '9600',
    paymentMethod: 'Créditos Galácticos',
    paidAt: '2026-06-02T10:30:00',
    createdAt: '2026-06-01T12:00:00',
}

describe('PaymentsManagement', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token')
        vi.restoreAllMocks()
    })

    it('should load payments from api and render table', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(buildPaymentsResponse([pendingPayment, approvedPayment]))
            .mockResolvedValueOnce(buildMethodsResponse())

        render(<PaymentsManagement />)

        await waitFor(() => expect(screen.getByText('#42')).toBeInTheDocument())

        expect(screen.getByText('#43')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
    })

    it('should format amount with formatCredits', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(buildPaymentsResponse([pendingPayment]))
            .mockResolvedValueOnce(buildMethodsResponse())

        render(<PaymentsManagement />)

        await waitFor(() => expect(screen.getByText('R$ 4.500,00')).toBeInTheDocument())
    })

    it('should show Processar button only for pending payments', async () => {
        vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(buildPaymentsResponse([pendingPayment, approvedPayment]))
            .mockResolvedValueOnce(buildMethodsResponse())

        render(<PaymentsManagement />)

        await waitFor(() => expect(screen.getByText('#42')).toBeInTheDocument())

        expect(screen.getByRole('button', { name: /processar/i })).toBeInTheDocument()
        // approved payment has no Processar button, only a dash
        expect(screen.getAllByRole('button', { name: /processar/i })).toHaveLength(1)
    })

    it('should approve payment via PATCH /pay', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildPaymentsResponse([pendingPayment]))
            .mockResolvedValueOnce(buildMethodsResponse())
            .mockResolvedValueOnce(buildOkPaymentResponse({ ...pendingPayment, status: 'aprovado' }))   // PATCH /pay
            .mockResolvedValueOnce(buildPaymentsResponse([{ ...pendingPayment, status: 'aprovado' }]))  // reload
            .mockResolvedValueOnce(buildMethodsResponse())

        render(<PaymentsManagement />)
        await waitFor(() => expect(screen.getByText('#42')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /processar/i }))
        const dialog = screen.getByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: /aprovar pagamento/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/payments/10/pay'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })

    it('should cancel payment via PATCH /cancel', async () => {
        const user = userEvent.setup()
        const fetchMock = vi.spyOn(globalThis, 'fetch')

        fetchMock
            .mockResolvedValueOnce(buildPaymentsResponse([pendingPayment]))
            .mockResolvedValueOnce(buildMethodsResponse())
            .mockResolvedValueOnce(buildOkPaymentResponse({ ...pendingPayment, status: 'cancelado' }))  // PATCH /cancel
            .mockResolvedValueOnce(buildPaymentsResponse([{ ...pendingPayment, status: 'cancelado' }])) // reload
            .mockResolvedValueOnce(buildMethodsResponse())

        render(<PaymentsManagement />)
        await waitFor(() => expect(screen.getByText('#42')).toBeInTheDocument())

        await user.click(screen.getByRole('button', { name: /processar/i }))
        const dialog = screen.getByRole('dialog')
        await user.click(within(dialog).getByRole('button', { name: /cancelar pagamento/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/payments/10/cancel'),
                expect.objectContaining({ method: 'PATCH' }),
            )
        })
    })
})
