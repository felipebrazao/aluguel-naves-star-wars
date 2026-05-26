import { useCallback, useMemo, useState } from 'react'
import SpaceshipCard from '../components/SpaceshipCard'
import PageHeader from '../components/shared/PageHeader'
import { spaceshipService } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import type { Spaceship } from '../types/api'

function Home() {
    const [query, setQuery] = useState('')
    const [onlyAvailable, setOnlyAvailable] = useState(false)

    const fetchSpaceships = useCallback(() => {
        return onlyAvailable ? spaceshipService.getAvailable() : spaceshipService.getAll()
    }, [onlyAvailable])

    const { data: spaceships, loading, error } = useFetch(fetchSpaceships)

    const filteredShips = useMemo(() => {
        return (spaceships ?? []).filter((ship: Spaceship) => {
            const matchesQuery = [ship.name, ship.model].some((value) =>
                value.toLowerCase().includes(query.toLowerCase()),
            )

            return matchesQuery
        })
    }, [query, spaceships])

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

            {loading ? <p className="text-sm text-sw-yellow">Carregando naves...</p> : null}
            {error ? <p className="text-sm text-sith-red">{error}</p> : null}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredShips.map((ship) => (
                    <SpaceshipCard
                        key={ship.id}
                        id={String(ship.id)}
                        name={ship.name}
                        model={ship.model}
                        dailyPrice={Number(ship.dailyPrice)}
                        capacity={ship.capacity}
                        status={ship.status}
                    />
                ))}
            </div>
        </section>
    )
}

export default Home