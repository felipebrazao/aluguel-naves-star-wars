import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'

type RentalStatus = 'ATIVO' | 'EM_USO' | 'FINALIZADO' | 'CANCELADO'

type Rental = {
    id: string
    customerName: string
    spaceship: string
    status: RentalStatus
    date: string
    total: number
}

const rentals: Rental[] = [
    {
        id: 'admin-rental-001',
        customerName: 'Luke Skywalker',
        spaceship: 'X-Wing Starfighter',
        status: 'ATIVO',
        date: '17/05/2026',
        total: 3200,
    },
    {
        id: 'admin-rental-002',
        customerName: 'Han Solo',
        spaceship: 'Millennium Falcon',
        status: 'EM_USO',
        date: '16/05/2026',
        total: 4500,
    },
    {
        id: 'admin-rental-003',
        customerName: 'Leia Organa',
        spaceship: 'TIE Advanced x1',
        status: 'FINALIZADO',
        date: '12/05/2026',
        total: 5100,
    },
    {
        id: 'admin-rental-004',
        customerName: 'Lando Calrissian',
        spaceship: 'Imperial Shuttle',
        status: 'CANCELADO',
        date: '10/05/2026',
        total: 3900,
    },
]

const statusStyles: Record<RentalStatus, string> = {
    ATIVO: 'border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow',
    EM_USO: 'border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue',
    FINALIZADO: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    CANCELADO: 'border-empire-red/40 bg-empire-red/10 text-empire-red',
}

const rentalColumns: DataTableColumn<Rental>[] = [
    { header: 'Cliente', accessor: 'customerName' },
    { header: 'Nave', accessor: 'spaceship' },
    {
        header: 'Status',
        accessor: (rental) => (
            <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[rental.status]}`}
            >
                {rental.status}
            </span>
        ),
    },
    { header: 'Data', accessor: 'date' },
    {
        header: 'Total',
        accessor: (rental) => <span className="font-semibold text-sw-yellow">Créditos {rental.total.toLocaleString('pt-BR')}</span>,
    },
]

function AdminDashboard() {
    return (
        <section className="space-y-8">
            <PageHeader
                overline="Admin"
                title="Dashboard Geral"
                description="Visão consolidada de todos os aluguéis do sistema."
            />

            <DataTable columns={rentalColumns} data={rentals} rowKey="id" />
        </section>
    )
}

export default AdminDashboard