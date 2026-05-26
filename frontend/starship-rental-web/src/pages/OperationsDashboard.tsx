import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'
import { useFetch } from '../hooks/useFetch'
import { rentalService } from '../services/api'
import type { Rental } from '../types/api'

type DashboardRental = Rental & {
    customerName: string
}

const statusStyles: Record<string, string> = {
    ativa: 'border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow',
    em_uso: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
    concluida: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    cancelada: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
}

const rentalColumns: DataTableColumn<DashboardRental>[] = [
    { header: 'Cliente', accessor: 'customerName' },
    { header: 'Nave', accessor: 'spaceshipName' },
    {
        header: 'Status',
        accessor: (rental) => (
            <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[rental.status] ?? 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue'}`}
            >
                {rental.status}
            </span>
        ),
    },
    { header: 'Data', accessor: 'createdAt' },
    {
        header: 'Total',
        accessor: (rental) => <span className="font-semibold text-sw-yellow">Créditos {Number(rental.totalPrice).toLocaleString('pt-BR')}</span>,
    },
]

function OperationsDashboard() {
    const { data: rentals, loading, error } = useFetch(rentalService.findAll)

    const dashboardRentals: DashboardRental[] = (rentals ?? []).map((rental) => ({
        ...rental,
        // Pendente: endpoint no backend
        customerName: '—',
    }))

    return (
        <section className="space-y-8">
            <PageHeader
                overline="Operações"
                title="Dashboard Geral"
                description="Visão consolidada de todos os aluguéis do sistema."
            />

            {loading ? <p className="text-sw-yellow">Carregando dashboard...</p> : null}
            {error ? <p className="text-sith-red">{error}</p> : null}

            <DataTable columns={rentalColumns} data={dashboardRentals} rowKey="id" />
        </section>
    )
}

export default OperationsDashboard
