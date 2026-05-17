import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'

type RentalStatus = 'ATIVO' | 'FINALIZADO'

type Rental = {
    id: string
    spaceship: string
    status: RentalStatus
    price: number
    date: string
}

const rentals: Rental[] = [
    {
        id: 'rental-001',
        spaceship: 'Millennium Falcon',
        status: 'ATIVO',
        price: 4500,
        date: '17/05/2026',
    },
    {
        id: 'rental-002',
        spaceship: 'X-Wing Starfighter',
        status: 'FINALIZADO',
        price: 3200,
        date: '12/05/2026',
    },
]

const rentalColumns: DataTableColumn<Rental>[] = [
    { header: 'Nave', accessor: 'spaceship' },
    {
        header: 'Status',
        accessor: (rental) => (
            <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${rental.status === 'ATIVO'
                    ? 'border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue'
                    : 'border-empire-red/40 bg-empire-red/10 text-empire-red'
                    }`}
            >
                {rental.status}
            </span>
        ),
    },
    { header: 'Data', accessor: 'date' },
    {
        header: 'Valor',
        accessor: (rental) => <span className="font-semibold text-sw-yellow">R$ {rental.price.toFixed(2)}</span>,
    },
]

function MyRentals() {
    return (
        <section className="space-y-8">
            <PageHeader
                overline="Cliente"
                title="Meus Aluguéis"
                description="Acompanhe o histórico das suas locações e o status de cada missão."
            />

            <DataTable columns={rentalColumns} data={rentals} rowKey="id" />
        </section>
    )
}

export default MyRentals