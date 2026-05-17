import { useState } from 'react'
import PageHeader from '../components/shared/PageHeader'
import PilledButton from '../components/shared/PilledButton'

const spaceship = {
    id: 'x-wing-starfighter',
    name: 'X-Wing Starfighter',
    model: 'T-65B',
    manufacturer: 'Incom Corporation',
    capacity: 1,
    dailyPrice: 3200,
    status: 'DISPONIVEL' as const,
}

const locations = ['Coruscant Spaceport', 'Tatooine Mos Eisley', 'Naboo Royal Dock']

function SpaceshipDetails() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [pickupLocation, setPickupLocation] = useState('')
    const [dropoffLocation, setDropoffLocation] = useState('')

    const totalDays =
        startDate && endDate
            ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
            : 0
    const totalPrice = totalDays * spaceship.dailyPrice

    const isSubmitDisabled = !startDate || !endDate || !pickupLocation || !dropoffLocation || totalDays <= 0

    return (
        <section className="space-y-8">
            <PageHeader
                overline={spaceship.model}
                title={spaceship.name}
                description="UC05 e UC06 - detalhes da nave e consolidação do checkout de aluguel."
            />

            <div className="grid gap-8 md:grid-cols-3">
                <article className="md:col-span-2 rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">Ficha Técnica</p>
                            <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">Visão geral da nave</h3>
                        </div>

                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                            {spaceship.status}
                        </span>
                    </div>

                    <div className="mt-8 rounded-2xl border border-panel-border/80 bg-black/30 p-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Fabricante</p>
                                <p className="mt-2 text-lg font-semibold text-gray-100">{spaceship.manufacturer}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Capacidade</p>
                                <p className="mt-2 text-lg font-semibold text-gray-100">{spaceship.capacity} tripulante</p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Preço da Diária</p>
                                <p className="mt-2 text-3xl font-semibold text-sw-yellow">R$ {spaceship.dailyPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="md:col-span-1 rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">Checkout</p>
                        <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">Consola de Reserva</h3>
                        <p className="mt-4 text-sm leading-6 text-gray-300">
                            Defina as datas e as localidades para calcular o valor total do aluguel.
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
                        <div className="form-control">
                            <label htmlFor="startDate" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Data de Início</span>
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="endDate" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Data de Fim</span>
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="pickupLocation" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Local de Recolha</span>
                            </label>
                            <select
                                id="pickupLocation"
                                className="select select-bordered w-full bg-black/30 text-gray-100"
                                value={pickupLocation}
                                onChange={(event) => setPickupLocation(event.target.value)}
                            >
                                <option value="">Selecionar local</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label htmlFor="dropoffLocation" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Local de Devolução</span>
                            </label>
                            <select
                                id="dropoffLocation"
                                className="select select-bordered w-full bg-black/30 text-gray-100"
                                value={dropoffLocation}
                                onChange={(event) => setDropoffLocation(event.target.value)}
                            >
                                <option value="">Selecionar local</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="divider border-panel-border text-gray-500" />

                        <div className="rounded-2xl border border-panel-border bg-black/30 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Valor Total</p>
                            <p className="mt-2 text-3xl font-semibold text-sw-yellow">R$ {totalPrice.toFixed(2)}</p>
                            <p className="mt-2 text-sm text-gray-400">{totalDays > 0 ? `${totalDays} dia(s) de aluguel` : 'Selecione as datas para calcular'}</p>
                        </div>

                        <PilledButton variant="primary" className="w-full" disabled={isSubmitDisabled}>
                            Confirmar aluguel
                        </PilledButton>
                    </form>
                </article>
            </div>
        </section>
    )
}

export default SpaceshipDetails