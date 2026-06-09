import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SpaceshipCard from '../components/SpaceshipCard'
import PageHeader from '../components/shared/PageHeader'
import { apiFetch } from '../services/api'
import type { SpaceshipResponseDTO } from '../types/entities'

function Home() {
    const [ships, setShips] = useState<SpaceshipResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [onlyAvailable, setOnlyAvailable] = useState(false)

    useEffect(() => {
        const fetchShips = async () => {
            try {
                setLoading(true)
                const res = await apiFetch('/spaceships?active=true')
                if (!res.ok) throw new Error('Erro ao carregar naves')
                const data: SpaceshipResponseDTO[] = await res.json()
                setShips(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar naves')
            } finally {
                setLoading(false)
            }
        }

        fetchShips()
    }, [])

    const filteredShips = useMemo(() => {
        return ships.filter((ship) => {
            const matchesQuery = [ship.name, ship.model].some((value) =>
                value.toLowerCase().includes(query.toLowerCase()),
            )
            const matchesStatus = !onlyAvailable || ship.status.toLowerCase() === 'disponivel'

            return matchesQuery && matchesStatus
        })
    }, [onlyAvailable, query, ships])

    if (loading) {
        return (
            <section className="space-y-8">
                <PageHeader
                    isHero
                    overline="Catálogo de Naves"
                    title="Encontre sua próxima rota pelo hiperespaço"
                    description="Carregando naves..."
                />
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-400">Carregando...</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="space-y-8">
                <PageHeader
                    isHero
                    overline="Catálogo de Naves"
                    title="Erro"
                    description="Ocorreu um erro ao carregar as naves."
                />
                <div className="rounded-3xl border border-panel-border bg-panel-dark p-8">
                    <p className="text-red-400">{error}</p>
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-8">
            <PageHeader
                isHero
                overline="Catálogo de Naves"
                title="Encontre sua próxima rota pelo hiperespaço"
                description="Navegue pelas opções disponíveis, filtre por nome ou modelo e prepare o checkout da sua missão."
            >
                <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="flex items-center gap-3 rounded-2xl border border-panel-border bg-surface-light/30 px-4 py-3">
                        <span className="text-jedi-blue">Busca</span>
                        <input
                            className="w-full bg-transparent text-gray-100 outline-none placeholder:text-gray-500"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Millennium, X-Wing, YT-1300..."
                        />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-panel-border bg-surface-light/30 px-4 py-3 text-sm text-gray-200">
                        <span>Apenas disponíveis</span>
                        <input
                            type="checkbox"
                            checked={onlyAvailable}
                            onChange={(event) => setOnlyAvailable(event.target.checked)}
                            className="h-4 w-4 accent-sw-yellow"
                        />
                    </label>
                </div>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
                {filteredShips.map((ship, index) => (
                    <motion.div
                        key={ship.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <SpaceshipCard
                            id={ship.id}
                            name={ship.name}
                            model={ship.model}
                            dailyPrice={ship.dailyPrice}
                            capacity={ship.capacity}
                            status={ship.status}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    )
}

export default Home