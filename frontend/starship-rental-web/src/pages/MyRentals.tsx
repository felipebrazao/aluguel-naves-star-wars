import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../components/shared/DataTable'
import OutlineButton from '../components/shared/OutlineButton'
import AnimatedCard from '../components/ui/AnimatedCard'

type Rental = {
    id: number
    spaceshipName: string
    status: string
    totalPrice: number
    startDate: string
    endDate: string
    pickupPlanetName: string
    returnPlanetName: string
}

function MyRentals() {
    const [rentals, setRentals] = useState<Rental[]>([])
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
                const user = JSON.parse(userStr)

                const res = await fetch(`http://localhost:8080/rentals/user/${user.id}`)
                if (!res.ok) throw new Error('Erro ao carregar aluguéis')

                const data = await res.json()
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
            const res = await fetch(`http://localhost:8080/rentals/${rentalId}/cancel`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error('Erro ao cancelar aluguel')

            // Refresh rentals
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const user = JSON.parse(userStr)
                const rentalsRes = await fetch(`http://localhost:8080/rentals/user/${user.id}`)
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
            const res = await fetch(`http://localhost:8080/rentals/${rentalId}/conclude`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error('Erro ao concluir aluguel')

            // Refresh rentals
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const user = JSON.parse(userStr)
                const rentalsRes = await fetch(`http://localhost:8080/rentals/user/${user.id}`)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR')
    }

    const rentalColumns: DataTableColumn<Rental>[] = [
        { header: 'Nave', accessor: 'spaceshipName' },
        {
            header: 'Status',
            accessor: (rental) => (
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        rental.status === 'ativa'
                            ? 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue'
                            : rental.status === 'concluida'
                            ? 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green'
                            : 'border-jedi-red/40 bg-jedi-red/10 text-jedi-red'
                    }`}
                >
                    {rental.status}
                </span>
            ),
        },
        { header: 'Início', accessor: (rental) => formatDate(rental.startDate) },
        { header: 'Fim', accessor: (rental) => formatDate(rental.endDate) },
        {
            header: 'Valor',
            accessor: (rental) => <span className="font-semibold text-sw-yellow">R$ {rental.totalPrice.toFixed(2)}</span>,
        },
        {
            header: 'Ações',
            accessor: (rental) =>
                rental.status === 'ativa' ? (
                    <div className="flex gap-2">
                        <OutlineButton
                            variant="default"
                            size="sm"
                            onClick={() => handleConclude(rental.id)}
                            disabled={actionLoading === rental.id}
                        >
                            {actionLoading === rental.id ? '...' : 'Concluir'}
                        </OutlineButton>
                        <OutlineButton
                            variant="error"
                            size="sm"
                            onClick={() => handleCancel(rental.id)}
                            disabled={actionLoading === rental.id}
                        >
                            {actionLoading === rental.id ? '...' : 'Cancelar'}
                        </OutlineButton>
                    </div>
                ) : null,
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