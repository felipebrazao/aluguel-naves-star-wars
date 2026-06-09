import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'
import OutlineButton from '../components/shared/OutlineButton'
import AnimatedCard from '../components/ui/AnimatedCard'
import { apiFetch } from '../services/api'
import type { AuthUser, RentalResponseDTO } from '../types/entities'

const STATUS_BADGE_CLASS_MAP: Record<string, string> = {
    ativa: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
    concluida: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    cancelada: 'border-jedi-red/40 bg-jedi-red/10 text-jedi-red',
}

function formatRentalDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR')
}

const renderRentalStatusCell: DataTableColumn<RentalResponseDTO>['accessor'] = (rental) => {
    const normalizedStatus = rental.status.toLowerCase()
    const statusClass = STATUS_BADGE_CLASS_MAP[normalizedStatus] ?? STATUS_BADGE_CLASS_MAP.cancelada

    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass}`}>
            {normalizedStatus}
        </span>
    )
}

const renderRentalStartDateCell: DataTableColumn<RentalResponseDTO>['accessor'] = (rental) => formatRentalDate(rental.startDate)

const renderRentalEndDateCell: DataTableColumn<RentalResponseDTO>['accessor'] = (rental) => formatRentalDate(rental.endDate)

const renderRentalPriceCell: DataTableColumn<RentalResponseDTO>['accessor'] = (rental) => (
    <span className="font-semibold text-sw-yellow">R$ {rental.totalPrice.toFixed(2)}</span>
)

function createRentalActionsAccessor(
    actionLoading: number | null,
    onConclude: (id: number) => void,
    onCancel: (id: number) => void,
): DataTableColumn<RentalResponseDTO>['accessor'] {
    return (rental) =>
        rental.status.toLowerCase() === 'ativa' ? (
            <div className="flex gap-2">
                <OutlineButton
                    variant="default"
                    size="sm"
                    onClick={() => onConclude(rental.id)}
                    disabled={actionLoading === rental.id}
                >
                    {actionLoading === rental.id ? '...' : 'Concluir'}
                </OutlineButton>
                <OutlineButton
                    variant="error"
                    size="sm"
                    onClick={() => onCancel(rental.id)}
                    disabled={actionLoading === rental.id}
                >
                    {actionLoading === rental.id ? '...' : 'Cancelar'}
                </OutlineButton>
            </div>
        ) : null
}

function MyRentals() {
    const [rentals, setRentals] = useState<RentalResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                setLoading(true)
                const userStr = localStorage.getItem('user')
                if (!userStr) {
                    throw new Error('Usuário não autenticado')
                }
                const user: AuthUser = JSON.parse(userStr)

                const res = await apiFetch(`/rentals/user/${user.id}`)
                if (!res.ok) throw new Error('Erro ao carregar aluguéis')

                const data: RentalResponseDTO[] = await res.json()
                setRentals(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar aluguéis')
            } finally {
                setLoading(false)
            }
        }

        fetchRentals()
    }, [])

    const handleCancel = async (rentalId: number) => {
        if (!confirm('Tem certeza que deseja cancelar este aluguel?')) return

        setActionLoading(rentalId)
        try {
            const res = await apiFetch(`/rentals/${rentalId}/cancel`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error('Erro ao cancelar aluguel')

            // Refresh rentals
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const user: AuthUser = JSON.parse(userStr)
                const rentalsRes = await apiFetch(`/rentals/user/${user.id}`)
                if (rentalsRes.ok) {
                    setRentals(await rentalsRes.json())
                }
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao cancelar aluguel')
        } finally {
            setActionLoading(null)
        }
    }

    const handleConclude = async (rentalId: number) => {
        if (!confirm('Tem certeza que deseja concluir este aluguel?')) return

        setActionLoading(rentalId)
        try {
            const res = await apiFetch(`/rentals/${rentalId}/conclude`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error('Erro ao concluir aluguel')

            // Refresh rentals
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const user: AuthUser = JSON.parse(userStr)
                const rentalsRes = await apiFetch(`/rentals/user/${user.id}`)
                if (rentalsRes.ok) {
                    setRentals(await rentalsRes.json())
                }
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao concluir aluguel')
        } finally {
            setActionLoading(null)
        }
    }

    const rentalColumns: DataTableColumn<RentalResponseDTO>[] = [
        { header: 'Nave', accessor: 'spaceshipName' },
        {
            header: 'Status',
            accessor: renderRentalStatusCell,
        },
        { header: 'Início', accessor: renderRentalStartDateCell },
        { header: 'Fim', accessor: renderRentalEndDateCell },
        {
            header: 'Valor',
            accessor: renderRentalPriceCell,
        },
        {
            header: 'Ações',
            accessor: createRentalActionsAccessor(actionLoading, handleConclude, handleCancel),
        },
    ]

    if (loading) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <PageHeader overline="Cliente" title="Meus Aluguéis" description="Carregando..." />
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-400">Carregando...</p>
                </div>
            </motion.section>
        )
    }

    if (error) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <PageHeader overline="Cliente" title="Meus Aluguéis" description="Erro ao carregar dados." />
                <AnimatedCard className="p-8">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            </motion.section>
        )
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Cliente"
                title="Meus Aluguéis"
                description="Acompanhe o histórico das suas locações e o status de cada missão."
            />

            {rentals.length === 0 ? (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Nenhum aluguel encontrado.</p>
                </AnimatedCard>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <DataTable columns={rentalColumns} data={rentals} rowKey="id" />
                </motion.div>
            )}
        </motion.section>
    )
}

export default MyRentals