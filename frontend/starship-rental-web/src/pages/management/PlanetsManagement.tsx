import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import { apiFetch } from '../../services/api'
import type { PlanetResponseDTO } from '../../types/entities'

type PlanetStatus = 'ativo' | 'bloqueado'

type PlanetRow = {
    id: number
    name: string
    sector: string
    status: PlanetStatus
}

const planetStatusStyles: Record<PlanetStatus, string> = {
    ativo: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    bloqueado: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
}

type PlanetStatusBadgeProps = {
    readonly status: PlanetStatus
}

function PlanetStatusBadge({ status }: PlanetStatusBadgeProps) {
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${planetStatusStyles[status]}`}>
            {status}
        </span>
    )
}

type ManagePlanetButtonProps = {
    readonly planet: PlanetRow
    readonly onManage: (planet: PlanetRow) => void
}

function ManagePlanetButton({ planet, onManage }: ManagePlanetButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onManage(planet)}>
            Gerir Planeta
        </PilledButton>
    )
}

const renderPlanetStatusCell: DataTableColumn<PlanetRow>['accessor'] = (planet) => <PlanetStatusBadge status={planet.status} />

function createManagePlanetAccessor(onManage: (planet: PlanetRow) => void): DataTableColumn<PlanetRow>['accessor'] {
    return (planet) => <ManagePlanetButton planet={planet} onManage={onManage} />
}

function createPlanetColumns(onManage: (planet: PlanetRow) => void): DataTableColumn<PlanetRow>[] {
    return [
        { header: 'Nome do Planeta', accessor: 'name' },
        { header: 'Setor', accessor: 'sector' },
        {
            header: 'Status Operacional',
            accessor: renderPlanetStatusCell,
        },
        {
            header: 'Ações',
            accessor: createManagePlanetAccessor(onManage),
        },
    ]
}

function mapPlanetToRow(planet: PlanetResponseDTO): PlanetRow {
    return {
        id: planet.id,
        name: planet.name,
        sector: planet.terrain ?? planet.climate ?? 'Setor não informado',
        status: planet.active ? 'ativo' : 'bloqueado',
    }
}

function PlanetsManagement() {
    const [planets, setPlanets] = useState<PlanetRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPlanetModalOpen, setIsPlanetModalOpen] = useState(false)
    const [selectedPlanet, setSelectedPlanet] = useState<PlanetRow | null>(null)
    const [newStatus, setNewStatus] = useState<PlanetStatus>('ativo')
    const [travelAdvisory, setTravelAdvisory] = useState('')
    const [restrictionReason, setRestrictionReason] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const loadPlanets = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiFetch('/planets')
            if (!response.ok) {
                throw new Error('Erro ao carregar planetas')
            }

            const data: PlanetResponseDTO[] = await response.json()
            setPlanets(data.map(mapPlanetToRow))
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar planetas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPlanets()
    }, [])

    const handleOpenPlanetModal = (planet: PlanetRow) => {
        setSelectedPlanet(planet)
        setNewStatus(planet.status)
        setTravelAdvisory('')
        setRestrictionReason('')
        setIsPlanetModalOpen(true)
    }

    const planetColumns = useMemo(() => createPlanetColumns(handleOpenPlanetModal), [])

    const handleCloseModal = () => {
        setIsPlanetModalOpen(false)
        setSelectedPlanet(null)
        setNewStatus('ativo')
        setTravelAdvisory('')
        setRestrictionReason('')
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedPlanet) {
            return
        }

        try {
            setIsSaving(true)
            const shouldToggle = selectedPlanet.status !== newStatus
            if (shouldToggle) {
                const response = await apiFetch(`/planets/${selectedPlanet.id}/active`, {
                    method: 'PATCH',
                })

                if (!response.ok) {
                    const responseText = await response.text()
                    throw new Error(responseText || 'Erro ao atualizar planeta')
                }
            }

            await loadPlanets()
            handleCloseModal()
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Erro ao atualizar planeta')
        } finally {
            setIsSaving(false)
        }
    }

    const planetModalTitle = selectedPlanet ? `Gerir Planeta - ${selectedPlanet.name}` : 'Gerir Planeta'

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Operações"
                title="Gestão de Planetas"
                description="Cadastro de destinos, disponibilidade operacional e restrições de acesso por planeta."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadPlanets}>
                        Atualizar Planetas
                    </PilledButton>
                }
            />

            {loading ? (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Carregando planetas...</p>
                </AnimatedCard>
            ) : error ? (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <DataTable columns={planetColumns} data={planets} rowKey="id" />
                </motion.div>
            )}

            <Modal
                isOpen={isPlanetModalOpen}
                onClose={handleCloseModal}
                title={planetModalTitle}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label htmlFor="planetStatus" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Novo Status</span>
                        </label>
                        <select
                            id="planetStatus"
                            className="select select-bordered w-full bg-black/30 text-gray-100"
                            value={newStatus}
                            onChange={(event) => setNewStatus(event.target.value as PlanetStatus)}
                        >
                            <option value="ativo">ATIVO</option>
                            <option value="bloqueado">BLOQUEADO</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label htmlFor="travelAdvisory" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Aviso de Viagem</span>
                        </label>
                        <input
                            id="travelAdvisory"
                            type="text"
                            className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                            value={travelAdvisory}
                            onChange={(event) => setTravelAdvisory(event.target.value)}
                            placeholder="Informe orientações operacionais"
                        />
                    </div>

                    {newStatus === 'bloqueado' ? (
                        <div className="space-y-5 rounded-2xl border border-panel-border bg-black/30 p-4">
                            <div className="form-control">
                                <label htmlFor="restrictionReason" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Motivo da Restrição</span>
                                </label>
                                <textarea
                                    id="restrictionReason"
                                    className="textarea textarea-bordered min-h-28 w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                                    value={restrictionReason}
                                    onChange={(event) => setRestrictionReason(event.target.value)}
                                    placeholder="Descreva riscos, bloqueios ou exigências para acesso"
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>

                        <PilledButton variant="primary" type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Guardar Alterações'}
                        </PilledButton>
                    </div>
                </form>
            </Modal>
        </motion.section>
    )
}

export default PlanetsManagement
