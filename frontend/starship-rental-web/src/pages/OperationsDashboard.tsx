import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'
import AnimatedCard from '../components/ui/AnimatedCard'
import { apiFetch } from '../services/api'
import type { RentalResponseDTO } from '../types/entities'

type DashboardRental = {
    id: number
    customerName: string
    spaceship: string
    status: string
    date: string
    total: number
}

const statusStyles: Record<string, string> = {
    ativa: 'border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow',
    em_uso: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
    concluida: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    cancelada: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
}

const renderDashboardStatusCell: DataTableColumn<DashboardRental>['accessor'] = (rental) => {
    const badgeClass = statusStyles[rental.status] ?? 'border-panel-border bg-surface-light/30 text-gray-300'
    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeClass}`}
        >
            {rental.status}
        </span>
    )
}

const renderDashboardTotalCell: DataTableColumn<DashboardRental>['accessor'] = (rental) => (
    <span className="font-semibold text-sw-yellow">Créditos {rental.total.toLocaleString('pt-BR')}</span>
)

const rentalColumns: DataTableColumn<DashboardRental>[] = [
    { header: 'Cliente', accessor: 'customerName' },
    { header: 'Nave', accessor: 'spaceship' },
    {
        header: 'Status',
        accessor: renderDashboardStatusCell,
    },
    { header: 'Data', accessor: 'date' },
    {
        header: 'Total',
        accessor: renderDashboardTotalCell,
    },
]

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR')
}

function OperationsDashboard() {
    const [rentals, setRentals] = useState<DashboardRental[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadRentals = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await apiFetch('/rentals')
                if (!response.ok) {
                    throw new Error('Erro ao carregar aluguéis do dashboard')
                }

                const data: RentalResponseDTO[] = await response.json()
                const mapped = data.map((rental) => ({
                    id: rental.id,
                    customerName: rental.userName,
                    spaceship: rental.spaceshipName,
                    status: rental.status.toLowerCase(),
                    date: formatDate(rental.createdAt),
                    total: rental.totalPrice,
                }))

                setRentals(mapped)
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dashboard')
            } finally {
                setLoading(false)
            }
        }

        loadRentals()
    }, [])

    const tableContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <DataTable columns={rentalColumns} data={rentals} rowKey="id" />
        </motion.div>
    )

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Operações"
                title="Dashboard Geral"
                description="Visão consolidada de todos os aluguéis do sistema."
            />

            {loading && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Carregando aluguéis...</p>
                </AnimatedCard>
            )}

            {!loading && error && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            )}

            {!loading && !error && tableContent}
        </motion.section>
    )
}

export default OperationsDashboard
