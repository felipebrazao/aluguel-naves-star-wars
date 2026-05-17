import { useMemo, useState } from 'react'
import SpaceshipCard from '../components/SpaceshipCard'
import PageHeader from '../components/shared/PageHeader'

const ships = [
    {
        id: 'millennium-falcon',
        name: 'Millennium Falcon',
        model: 'YT-1300',
        dailyPrice: 4500,
        capacity: 6,
        status: 'DISPONIVEL' as const,
    },
    {
        id: 'x-wing-starfighter',
        name: 'X-Wing Starfighter',
        model: 'T-65B',
        dailyPrice: 3200,
        capacity: 1,
        status: 'DISPONIVEL' as const,
    },
    {
        id: 'tie-advanced',
        name: 'TIE Advanced x1',
        model: 'Experimental Interceptor',
        dailyPrice: 5100,
        capacity: 1,
        status: 'MANUTENCAO' as const,
    },
]

function Home() {
    const [query, setQuery] = useState('')
    const [onlyAvailable, setOnlyAvailable] = useState(false)

    const filteredShips = useMemo(() => {
        return ships.filter((ship) => {
            const matchesQuery = [ship.name, ship.model].some((value) =>
                value.toLowerCase().includes(query.toLowerCase()),
            )
            const matchesStatus = !onlyAvailable || ship.status === 'DISPONIVEL'

            return matchesQuery && matchesStatus
        })
    }, [onlyAvailable, query])

    return (
        <section className="space-y-8">
            <PageHeader
                isHero
                overline="Catálogo de Naves"
                title="Encontre sua próxima rota pelo hiperespaço"
                description="Navegue pelas opções disponíveis, filtre por nome ou modelo e prepare o checkout da sua missão."
            >
                <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="flex items-center gap-3 rounded-2xl border border-panel-border bg-black/30 px-4 py-3">
                        <span className="text-rebel-blue">Busca</span>
                        <input
                            className="w-full bg-transparent text-gray-100 outline-none placeholder:text-gray-500"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Millennium, X-Wing, YT-1300..."
                        />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-panel-border bg-black/30 px-4 py-3 text-sm text-gray-200">
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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredShips.map((ship) => (
                    <SpaceshipCard
                        key={ship.id}
                        id={ship.id}
                        name={ship.name}
                        model={ship.model}
                        dailyPrice={ship.dailyPrice}
                        capacity={ship.capacity}
                        status={ship.status}
                    />
                ))}
            </div>
        </section>
    )
}

export default Home