import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import { apiFetch } from '../../services/api'
import { formatCredits } from '../../utils/formatters'
import type { PaymentResponseDTO, PaymentMethod } from '../../types/entities'

type PaymentStatus = 'pendente' | 'aprovado' | 'cancelado'

type PaymentRow = {
    id: number
    rentalId: number
    status: PaymentStatus
    amount: string
    paymentMethod: string
    paidAt: string | null
    createdAt: string
}

const paymentStatusStyles: Record<PaymentStatus, string> = {
    pendente: 'border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow',
    aprovado: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    cancelado: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
}

type PaymentStatusBadgeProps = {
    readonly status: PaymentStatus
}

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${paymentStatusStyles[status]}`}>
            {status}
        </span>
    )
}

function normalizePaymentStatus(raw: string): PaymentStatus {
    const s = raw.toLowerCase()
    if (s === 'aprovado' || s === 'cancelado') return s
    return 'pendente'
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function mapPaymentToRow(p: PaymentResponseDTO): PaymentRow {
    return {
        id: p.id,
        rentalId: p.rentalId,
        status: normalizePaymentStatus(p.status),
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
    }
}

type ProcessButtonProps = {
    readonly payment: PaymentRow
    readonly onProcess: (payment: PaymentRow) => void
}

function ProcessButton({ payment, onProcess }: ProcessButtonProps) {
    if (payment.status !== 'pendente') {
        return <span className="text-xs text-gray-600">—</span>
    }
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onProcess(payment)}>
            Processar
        </PilledButton>
    )
}

function createPaymentColumns(onProcess: (p: PaymentRow) => void): DataTableColumn<PaymentRow>[] {
    return [
        { header: 'ID Aluguel', accessor: (p) => <span className="font-mono text-jedi-blue">#{p.rentalId}</span> },
        { header: 'Valor', accessor: (p) => <span className="font-semibold text-sw-yellow">R$ {formatCredits(p.amount)}</span> },
        { header: 'Método', accessor: 'paymentMethod' },
        { header: 'Status', accessor: (p) => <PaymentStatusBadge status={p.status} /> },
        { header: 'Data Pagamento', accessor: (p) => <span className="text-xs text-gray-400">{formatDateTime(p.paidAt)}</span> },
        {
            header: 'Ações',
            accessor: (p) => <ProcessButton payment={p} onProcess={onProcess} />,
        },
    ]
}

function PaymentsManagement() {
    const [payments, setPayments] = useState<PaymentRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedMethodId, setSelectedMethodId] = useState<number>(1)
    const [isProcessing, setIsProcessing] = useState(false)

    const loadPayments = async () => {
        try {
            setLoading(true)
            setError(null)
            const [paymentsRes, methodsRes] = await Promise.all([
                apiFetch('/payments'),
                apiFetch('/payment-methods'),
            ])
            if (!paymentsRes.ok) throw new Error('Erro ao carregar pagamentos')
            const data: PaymentResponseDTO[] = await paymentsRes.json()
            setPayments(data.map(mapPaymentToRow))

            if (methodsRes.ok) {
                const methods: PaymentMethod[] = await methodsRes.json()
                setPaymentMethods(methods)
                if (methods.length > 0) setSelectedMethodId(methods[0].id)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPayments()
    }, [])

    const handleOpenModal = (payment: PaymentRow) => {
        setSelectedPayment(payment)
        // try to pre-select the current payment method
        const match = paymentMethods.find((m) => m.name === payment.paymentMethod)
        setSelectedMethodId(match?.id ?? paymentMethods[0]?.id ?? 1)
        setIsModalOpen(true)
    }

    const paymentColumns = createPaymentColumns(handleOpenModal)

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedPayment(null)
    }

    const handleApprove = async () => {
        if (!selectedPayment) return
        try {
            setIsProcessing(true)
            const res = await apiFetch(`/payments/${selectedPayment.id}/pay`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethodId: selectedMethodId }),
            })
            if (!res.ok) throw new Error((await res.text()) || 'Erro ao aprovar pagamento')
            await loadPayments()
            handleCloseModal()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao aprovar pagamento')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancel = async () => {
        if (!selectedPayment) return
        try {
            setIsProcessing(true)
            const res = await apiFetch(`/payments/${selectedPayment.id}/cancel`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error((await res.text()) || 'Erro ao cancelar pagamento')
            await loadPayments()
            handleCloseModal()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao cancelar pagamento')
        } finally {
            setIsProcessing(false)
        }
    }

    const modalTitle = selectedPayment
        ? `Processar Pagamento — Aluguel #${selectedPayment.rentalId}`
        : 'Processar Pagamento'

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Administração"
                title="Gestão de Pagamentos"
                description="Visualização e processamento de todos os pagamentos da plataforma."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadPayments}>
                        Atualizar
                    </PilledButton>
                }
            />

            {loading && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Carregando pagamentos...</p>
                </AnimatedCard>
            )}

            {!loading && error && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            )}

            {!loading && !error && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <DataTable columns={paymentColumns} data={payments} rowKey="id" />
                </motion.div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle}>
                <div className="space-y-6">
                    {selectedPayment && (
                        <div className="rounded-2xl border border-panel-border bg-surface-light/30 p-4 space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-xs uppercase tracking-widest">Valor</span>
                                <span className="font-semibold text-sw-yellow">R$ {formatCredits(selectedPayment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-xs uppercase tracking-widest">Método Atual</span>
                                <span>{selectedPayment.paymentMethod}</span>
                            </div>
                        </div>
                    )}

                    <div className="form-control">
                        <label htmlFor="paymentMethod" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Método de Pagamento</span>
                        </label>
                        <select
                            id="paymentMethod"
                            className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                            value={selectedMethodId}
                            onChange={(e) => setSelectedMethodId(Number(e.target.value))}
                        >
                            {paymentMethods.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={handleCloseModal}
                        >
                            Fechar
                        </button>
                        <button
                            type="button"
                            disabled={isProcessing}
                            className="rounded-full border border-sith-red/40 bg-sith-red/10 px-5 py-3 text-sm font-semibold text-sith-red transition-colors hover:bg-sith-red hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={handleCancel}
                        >
                            {isProcessing ? 'A processar...' : 'Cancelar Pagamento'}
                        </button>
                        <PilledButton variant="primary" className="w-full sm:w-auto" disabled={isProcessing} onClick={handleApprove}>
                            {isProcessing ? 'A processar...' : 'Aprovar Pagamento'}
                        </PilledButton>
                    </div>
                </div>
            </Modal>
        </motion.section>
    )
}

export default PaymentsManagement
