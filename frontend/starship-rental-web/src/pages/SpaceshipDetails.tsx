import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../components/ui/DatePickerCustom.css'
import PageHeader from '../components/shared/PageHeader'
import AnimatedModal from '../components/ui/AnimatedModal'
import AnimatedButton from '../components/ui/AnimatedButton'
import AnimatedCard from '../components/ui/AnimatedCard'

type Spaceship = {
    id: number
    name: string
    model: string
    manufacturer: string
    capacity: number
    dailyPrice: number
    status: string
}

type Planet = {
    id: number
    name: string
}

type PaymentMethod = {
    id: number
    name: string
}

function SpaceshipDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [spaceship, setSpaceship] = useState<Spaceship | null>(null)
    const [planets, setPlanets] = useState<Planet[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [pickupPlanetId, setPickupPlanetId] = useState('')
    const [returnPlanetId, setReturnPlanetId] = useState('')
    const [paymentMethodId, setPaymentMethodId] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showSuccessExplosion, setShowSuccessExplosion] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [spaceshipRes, planetsRes, paymentMethodsRes] = await Promise.all([
                    fetch(`http://localhost:8080/spaceships/${id}`),
                    fetch('http://localhost:8080/planets?active=true'),
                    fetch('http://localhost:8080/payment-methods'),
                ])

                if (!spaceshipRes.ok) throw new Error('Erro ao carregar nave')
                if (!planetsRes.ok) throw new Error('Erro ao carregar planetas')
                if (!paymentMethodsRes.ok) throw new Error('Erro ao carregar métodos de pagamento')

                const spaceshipData = await spaceshipRes.json()
                const planetsData = await planetsRes.json()
                const paymentMethodsData = await paymentMethodsRes.json()

                console.log('Planets loaded:', planetsData)
                console.log('Payment methods loaded:', paymentMethodsData)

                setSpaceship(spaceshipData)
                setPlanets(planetsData)
                setPaymentMethods(paymentMethodsData)
            } catch (err) {
                console.error('Error loading data:', err)
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const totalDays =
        startDate && endDate
            ? Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
            : 0
    const totalPrice = spaceship ? totalDays * spaceship.dailyPrice : 0

    const isSubmitDisabled = !startDate || !endDate || !pickupPlanetId || !returnPlanetId || !paymentMethodId || totalDays <= 0 || submitting

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setShowConfirmModal(true)
    }

    const handleConfirmRental = async () => {
        setShowConfirmModal(false)
        setSubmitting(true)
        setError(null)

        try {
            const userStr = localStorage.getItem('user')
            if (!userStr) {
                throw new Error('Usuário não autenticado')
            }
            const user = JSON.parse(userStr)

            const rentalData = {
                userId: user.id,
                spaceshipId: spaceship?.id,
                pickupPlanetId: parseInt(pickupPlanetId),
                returnPlanetId: parseInt(returnPlanetId),
                paymentMethodId: parseInt(paymentMethodId),
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
            }

            const res = await fetch('http://localhost:8080/rentals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rentalData),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Erro ao criar aluguel')
            }

            setSubmitting(false)
            setShowSuccessExplosion(true)
            
            setTimeout(() => {
                navigate('/meus-alugueis')
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar aluguel')
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <PageHeader overline="Carregando" title="..." description="Carregando dados da nave." />
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-400">Carregando...</p>
                </div>
            </motion.section>
        )
    }

    if (error || !spaceship) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <PageHeader overline="Erro" title="Erro" description="Ocorreu um erro ao carregar os dados." />
                <AnimatedCard className="p-8">
                    <p className="text-red-400">{error || 'Nave não encontrada'}</p>
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
                overline={spaceship.model}
                title={spaceship.name}
                description="UC05 e UC06 - detalhes da nave e consolidação do checkout de aluguel."
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid gap-8 md:grid-cols-3"
            >
                <AnimatedCard className="md:col-span-2 p-8" hover={false}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-jedi-blue">Ficha Técnica</p>
                            <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">Visão geral da nave</h3>
                        </div>

                        <span className="rounded-full border border-jedi-green/40 bg-jedi-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-jedi-green">
                            {spaceship.status}
                        </span>
                    </div>

                    <div className="mt-8 rounded-2xl border border-panel-border/80 bg-surface-light/30 p-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">Fabricante</p>
                                <p className="mt-2 text-lg font-semibold text-gray-100">{spaceship.manufacturer}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">Capacidade</p>
                                <p className="mt-2 text-lg font-semibold text-gray-100">{spaceship.capacity} tripulante</p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">Preço da Diária</p>
                                <p className="mt-2 text-3xl font-semibold text-sw-yellow">R$ {spaceship.dailyPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>

                <AnimatedCard className="md:col-span-1 p-8" hover={false}>
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-jedi-blue">Checkout</p>
                        <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">Consola de Reserva</h3>
                        <p className="mt-4 text-sm leading-6 text-gray-300">
                            Defina as datas e as localidades para calcular o valor total do aluguel.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="startDate" className="block text-xs uppercase tracking-[0.25em] text-jedi-blue font-semibold">
                                Data de Início
                            </label>
                            <DatePicker
                                id="startDate"
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                className="w-full rounded-xl border border-panel-border bg-surface-light/30 px-4 py-3 text-gray-100 transition-all duration-200 focus:border-jedi-blue focus:outline-none focus:ring-2 focus:ring-jedi-blue/20"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecione a data"
                                minDate={new Date()}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="endDate" className="block text-xs uppercase tracking-[0.25em] text-jedi-blue font-semibold">
                                Data de Fim
                            </label>
                            <DatePicker
                                id="endDate"
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                className="w-full rounded-xl border border-panel-border bg-surface-light/30 px-4 py-3 text-gray-100 transition-all duration-200 focus:border-jedi-blue focus:outline-none focus:ring-2 focus:ring-jedi-blue/20"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecione a data"
                                minDate={startDate || new Date()}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="pickupPlanet" className="block text-xs uppercase tracking-[0.25em] text-jedi-blue font-semibold">
                                Planeta de Retirada
                            </label>
                            <select
                                id="pickupPlanet"
                                className="w-full rounded-xl border border-panel-border bg-surface-light/30 px-4 py-3 text-gray-100 transition-all duration-200 focus:border-jedi-blue focus:outline-none focus:ring-2 focus:ring-jedi-blue/20"
                                value={pickupPlanetId}
                                onChange={(event) => setPickupPlanetId(event.target.value)}
                            >
                                <option value="">Selecionar planeta</option>
                                {planets.map((planet) => (
                                    <option key={planet.id} value={String(planet.id)}>
                                        {planet.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="returnPlanet" className="block text-xs uppercase tracking-[0.25em] text-jedi-blue font-semibold">
                                Planeta de Devolução
                            </label>
                            <select
                                id="returnPlanet"
                                className="w-full rounded-xl border border-panel-border bg-surface-light/30 px-4 py-3 text-gray-100 transition-all duration-200 focus:border-jedi-blue focus:outline-none focus:ring-2 focus:ring-jedi-blue/20"
                                value={returnPlanetId}
                                onChange={(event) => setReturnPlanetId(event.target.value)}
                            >
                                <option value="">Selecionar planeta</option>
                                {planets.map((planet) => (
                                    <option key={planet.id} value={String(planet.id)}>
                                        {planet.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="paymentMethod" className="block text-xs uppercase tracking-[0.25em] text-jedi-blue font-semibold">
                                Método de Pagamento
                            </label>
                            <select
                                id="paymentMethod"
                                className="w-full rounded-xl border border-panel-border bg-surface-light/30 px-4 py-3 text-gray-100 transition-all duration-200 focus:border-jedi-blue focus:outline-none focus:ring-2 focus:ring-jedi-blue/20"
                                value={paymentMethodId}
                                onChange={(event) => setPaymentMethodId(event.target.value)}
                            >
                                <option value="">Selecionar método</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={String(method.id)}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-panel-border to-transparent" />

                        <div className="rounded-2xl border border-jedi-blue/30 bg-gradient-to-br from-jedi-blue/10 to-transparent p-6">
                            <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue font-semibold">Valor Total</p>
                            <p className="mt-3 text-4xl font-bold text-sw-yellow">R$ {totalPrice.toFixed(2)}</p>
                            <p className="mt-2 text-sm text-gray-400">{totalDays > 0 ? `${totalDays} dia(s) de aluguel` : 'Selecione as datas para calcular'}</p>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <AnimatedButton
                            type="submit"
                            variant="primary"
                            className="w-full py-4 text-lg"
                            disabled={isSubmitDisabled}
                        >
                            {submitting ? 'Processando...' : 'Confirmar aluguel'}
                        </AnimatedButton>
                    </form>
                </AnimatedCard>
            </motion.div>

            {/* Modal de Confirmação */}
            <AnimatedModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Aluguel"
            >
                <div className="py-4">
                    <p className="text-gray-300">Revise os detalhes do seu aluguel:</p>
                    <div className="mt-4 space-y-2 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Nave:</span>
                            <span className="text-gray-100 font-semibold">{spaceship?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Data de início:</span>
                            <span className="text-gray-100">{startDate?.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Data de fim:</span>
                            <span className="text-gray-100">{endDate?.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Dias:</span>
                            <span className="text-gray-100">{totalDays} dia(s)</span>
                        </div>
                        <div className="divider border-panel-border my-2" />
                        <div className="flex justify-between">
                            <span className="text-sw-yellow font-semibold">Valor Total:</span>
                            <span className="text-sw-yellow font-semibold text-lg">R$ {totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <AnimatedButton
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        Cancelar
                    </AnimatedButton>
                    <AnimatedButton
                        variant="primary"
                        className="flex-1"
                        onClick={handleConfirmRental}
                        disabled={submitting}
                    >
                        {submitting ? 'Processando...' : 'Confirmar'}
                    </AnimatedButton>
                </div>
            </AnimatedModal>

            {/* Animação de Explosão de Sucesso */}
            <AnimatePresence>
                {showSuccessExplosion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="relative"
                        >
                            {/* Círculo central */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.5, 1] }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="h-32 w-32 rounded-full bg-sw-yellow shadow-[0_0_60px_rgba(255,232,31,0.8)]" />
                            </motion.div>
                            
                            {/* Partículas explosão */}
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ 
                                        scale: [0, 2, 0],
                                        opacity: [1, 1, 0],
                                        x: Math.cos((i * 30) * Math.PI / 180) * 150,
                                        y: Math.sin((i * 30) * Math.PI / 180) * 150
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sw-yellow"
                                />
                            ))}
                            
                            {/* Segunda onda de partículas */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={`wave2-${i}`}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ 
                                        scale: [0, 1.5, 0],
                                        opacity: [1, 0.8, 0],
                                        x: Math.cos((i * 45 + 15) * Math.PI / 180) * 100,
                                        y: Math.sin((i * 45 + 15) * Math.PI / 180) * 100
                                    }}
                                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                                    className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jedi-blue"
                                />
                            ))}

                            {/* Ícone de check */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="relative z-10 flex items-center justify-center"
                            >
                                <svg className="h-20 w-20 text-space-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </motion.div>

                            {/* Texto de sucesso */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 }}
                                className="absolute top-40 text-center"
                            >
                                <p className="text-2xl font-bold text-sw-yellow">Aluguel Confirmado!</p>
                                <p className="mt-2 text-gray-300">Redirecionando...</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    )
}

export default SpaceshipDetails