import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'
import { useFetch } from '../hooks/useFetch'
import { rentalService } from '../services/api'
import type { Rental } from '../types/api'

type MyRentalsProps = {
    readonly userId: number
}

const rentalColumns: DataTableColumn<Rental>[] = [
    { header: 'Nave', accessor: 'spaceshipName' },
    {
        header: 'Status',
        accessor: (rental) => (
            <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${rental.status === 'ativa'
                    ? 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue'
                    : 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green'
                    }`}
            >
                {rental.status}
            </span>
        ),
    },
    { header: 'Retirada Real', accessor: (rental) => rental.actualPickupDate ?? '—' },
    { header: 'Devolução Real', accessor: (rental) => rental.actualReturnDate ?? '—' },
    {
        header: 'Valor',
        accessor: (rental) => <span className="font-semibold text-sw-yellow">R$ {Number(rental.totalPrice).toFixed(2)}</span>,
    },
]

function MyRentals({ userId }: MyRentalsProps) {
    const { data: rentals, loading, error } = useFetch(() => rentalService.getByUser(userId))

    return (
        <section className="space-y-8">
            <PageHeader
                overline="Cliente"
                title="Meus Aluguéis"
                description="Acompanhe o histórico das suas locações e o status de cada missão."
            />

            {loading ? <p className="text-sw-yellow">Carregando aluguéis...</p> : null}
            {error ? <p className="text-sith-red">{error}</p> : null}

            <DataTable columns={rentalColumns} data={rentals ?? []} rowKey="id" />
        </section>
    )
}

export default MyRentals