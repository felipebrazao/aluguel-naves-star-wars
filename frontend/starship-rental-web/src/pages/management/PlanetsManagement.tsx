import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import AnimatedButton from '../../components/ui/AnimatedButton'
import { apiFetch } from '../../services/api'
import type { PlanetResponseDTO } from '../../types/entities'

type PlanetStatus = 'ativo' | 'bloqueado'

type PlanetRow = {
    id: number
    name: string
    sector: string
    diameter: number | null
    climate: string | null
    terrain: string | null
    population: number | null
    status: PlanetStatus
}

const planetStatusStyles: Record<PlanetStatus, string> = {
    ativo: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    bloqueado: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
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

type EditPlanetButtonProps = {
    readonly planet: PlanetRow
    readonly onEdit: (planet: PlanetRow) => void
}

function EditPlanetButton({ planet, onEdit }: EditPlanetButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onEdit(planet)}>
            Editar
        </PilledButton>
    )
}

const renderPlanetStatusCell: DataTableColumn<PlanetRow>['accessor'] = (planet) => <PlanetStatusBadge status={planet.status} />

function createEditPlanetAccessor(onEdit: (planet: PlanetRow) => void): DataTableColumn<PlanetRow>['accessor'] {
    return (planet) => <EditPlanetButton planet={planet} onEdit={onEdit} />
}

function createPlanetColumns(onEdit: (planet: PlanetRow) => void): DataTableColumn<PlanetRow>[] {
    return [
        { header: 'Nome do Planeta', accessor: 'name' },
        { header: 'Setor', accessor: 'sector' },
        {
            header: 'Status Operacional',
            accessor: renderPlanetStatusCell,
        },
        {
            header: 'Ações',
            accessor: createEditPlanetAccessor(onEdit),
        },
    ]
}

function mapPlanetToRow(planet: PlanetResponseDTO): PlanetRow {
    return {
        id: planet.id,
        name: planet.name,
        sector: planet.terrain ?? planet.climate ?? 'Setor não informado',
        diameter: planet.diameter ?? null,
        climate: planet.climate ?? null,
        terrain: planet.terrain ?? null,
        population: planet.population ?? null,
        status: planet.active ? 'ativo' : 'bloqueado',
    }
}

function PlanetsManagement() {
    const [planets, setPlanets] = useState<PlanetRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPlanetModalOpen, setIsPlanetModalOpen] = useState(false)
    const [selectedPlanet, setSelectedPlanet] = useState<PlanetRow | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    // Edit fields
    const [editName, setEditName] = useState('')
    const [editDiameter, setEditDiameter] = useState('')
    const [editClimate, setEditClimate] = useState('')
    const [editPopulation, setEditPopulation] = useState('')

    // Status section
    const [newStatus, setNewStatus] = useState<PlanetStatus>('ativo')
    const [restrictionReason, setRestrictionReason] = useState('')

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

    const handleSyncSwapi = async () => {
        try {
            setIsSyncing(true)
            setError(null)
            const response = await apiFetch('/planets/import', { method: 'POST' })
            if (!response.ok) {
                throw new Error('Erro ao sincronizar planetas com SWAPI')
            }
            await loadPlanets()
        } catch (syncError) {
            setError(syncError instanceof Error ? syncError.message : 'Erro ao sincronizar planetas com SWAPI')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleOpenPlanetModal = (planet: PlanetRow) => {
        setSelectedPlanet(planet)
        setEditName(planet.name)
        setEditDiameter(planet.diameter !== null ? String(planet.diameter) : '')
        setEditClimate(planet.climate ?? '')
        setEditPopulation(planet.population !== null ? String(planet.population) : '')
        setNewStatus(planet.status)
        setRestrictionReason('')
        setIsPlanetModalOpen(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const planetColumns = useMemo(() => createPlanetColumns(handleOpenPlanetModal), [])

    const handleCloseModal = () => {
        setIsPlanetModalOpen(false)
        setSelectedPlanet(null)
        setEditName('')
        setEditDiameter('')
        setEditClimate('')
        setEditPopulation('')
        setNewStatus('ativo')
        setRestrictionReason('')
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedPlanet) return

        try {
            setIsSaving(true)

            const putResponse = await apiFetch(`/planets/${selectedPlanet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    diameter: editDiameter ? Number(editDiameter) : null,
                    climate: editClimate || null,
                    terrain: selectedPlanet.terrain,
                    population: editPopulation ? Number(editPopulation) : null,
                }),
            })

            if (!putResponse.ok) {
                const text = await putResponse.text()
                throw new Error(text || 'Erro ao atualizar planeta')
            }

            if (selectedPlanet.status !== newStatus) {
                const patchResponse = await apiFetch(`/planets/${selectedPlanet.id}/active`, {
                    method: 'PATCH',
                })

                if (!patchResponse.ok) {
                    const text = await patchResponse.text()
                    throw new Error(text || 'Erro ao atualizar status do planeta')
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

    const planetModalTitle = selectedPlanet ? `Editar Planeta — ${selectedPlanet.name}` : 'Editar Planeta'

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
                    <div className="flex gap-2">
                        <AnimatedButton
                            variant="ghost-white"
                            className="px-4 py-2 text-sm"
                            onClick={handleSyncSwapi}
                            disabled={isSyncing}
                        >
                            {isSyncing ? 'A sincronizar...' : 'Sincronizar SWAPI'}
                        </AnimatedButton>
                        <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadPlanets}>
                            Atualizar Planetas
                        </PilledButton>
                    </div>
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
                    {/* Edit section */}
                    <div className="space-y-4 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Dados do Planeta</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="form-control sm:col-span-2">
                                <label htmlFor="editPlanetName" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Nome</span>
                                </label>
                                <input
                                    id="editPlanetName"
                                    type="text"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editDiameter" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Diâmetro (km)</span>
                                </label>
                                <input
                                    id="editDiameter"
                                    type="number"
                                    min="0"
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editDiameter}
                                    onChange={(e) => setEditDiameter(e.target.value)}
                                    placeholder="Ex: 12756"
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editClimate" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Clima</span>
                                </label>
                                <input
                                    id="editClimate"
                                    type="text"
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editClimate}
                                    onChange={(e) => setEditClimate(e.target.value)}
                                    placeholder="Ex: temperado"
                                />
                            </div>

                            <div className="form-control sm:col-span-2">
                                <label htmlFor="editPopulation" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">População</span>
                                </label>
                                <input
                                    id="editPopulation"
                                    type="number"
                                    min="0"
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editPopulation}
                                    onChange={(e) => setEditPopulation(e.target.value)}
                                    placeholder="Ex: 1000000000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status section */}
                    <div className="form-control">
                        <label htmlFor="planetStatus" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Status Operacional</span>
                        </label>
                        <select
                            id="planetStatus"
                            className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                            value={newStatus}
                            onChange={(event) => setNewStatus(event.target.value as PlanetStatus)}
                        >
                            <option value="ativo">ATIVO</option>
                            <option value="bloqueado">BLOQUEADO</option>
                        </select>
                    </div>

                    {newStatus === 'bloqueado' ? (
                        <div className="space-y-5 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                            <div className="form-control">
                                <label htmlFor="restrictionReason" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Motivo da Restrição</span>
                                </label>
                                <textarea
                                    id="restrictionReason"
                                    className="textarea textarea-bordered min-h-28 w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
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
