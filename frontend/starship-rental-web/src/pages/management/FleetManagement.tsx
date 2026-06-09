import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import { apiFetch } from '../../services/api'
import type { SpaceshipResponseDTO } from '../../types/entities'

type FleetStatus = 'disponivel' | 'manutencao' | 'desativada' | 'alugada'
type EditableFleetStatus = 'disponivel' | 'manutencao' | 'desativada'

type FleetShip = {
    id: number
    name: string
    model: string
    status: FleetStatus
}

const fleetStatusStyles: Record<FleetStatus, string> = {
    disponivel: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    manutencao: 'border-windu-purple/40 bg-windu-purple/10 text-windu-purple',
    desativada: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
    alugada: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
}

type FleetStatusBadgeProps = {
    readonly status: FleetStatus
}

function FleetStatusBadge({ status }: FleetStatusBadgeProps) {
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${fleetStatusStyles[status]}`}>
            {status}
        </span>
    )
}

type ManageStatusButtonProps = {
    readonly ship: FleetShip
    readonly onManage: (ship: FleetShip) => void
}

function ManageStatusButton({ ship, onManage }: ManageStatusButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onManage(ship)}>
            Gerir Status
        </PilledButton>
    )
}

const renderFleetStatusCell: DataTableColumn<FleetShip>['accessor'] = (ship) => <FleetStatusBadge status={ship.status} />

function createManageStatusAccessor(onManage: (ship: FleetShip) => void): DataTableColumn<FleetShip>['accessor'] {
    return (ship) => <ManageStatusButton ship={ship} onManage={onManage} />
}

function createFleetColumns(onManage: (ship: FleetShip) => void): DataTableColumn<FleetShip>[] {
    return [
        { header: 'Nome da Nave', accessor: 'name' },
        { header: 'Modelo', accessor: 'model' },
        {
            header: 'Status da Frota',
            accessor: renderFleetStatusCell,
        },
        {
            header: 'Ações',
            accessor: createManageStatusAccessor(onManage),
        },
    ]
}

function normalizeFleetStatus(rawStatus: string): FleetStatus {
    const normalized = rawStatus.toLowerCase()
    if (normalized === 'manutencao' || normalized === 'desativada' || normalized === 'alugada') {
        return normalized
    }
    return 'disponivel'
}

function FleetManagement() {
    const [fleetShips, setFleetShips] = useState<FleetShip[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedShip, setSelectedShip] = useState<FleetShip | null>(null)
    const [newStatus, setNewStatus] = useState<EditableFleetStatus>('manutencao')
    const [estimatedCost, setEstimatedCost] = useState('')
    const [repairDescription, setRepairDescription] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const loadFleet = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiFetch('/spaceships')
            if (!response.ok) {
                throw new Error('Erro ao carregar frota')
            }

            const data: SpaceshipResponseDTO[] = await response.json()
            const mapped = data.map((ship) => ({
                id: ship.id,
                name: ship.name,
                model: ship.model,
                status: normalizeFleetStatus(ship.status),
            }))

            setFleetShips(mapped)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar frota')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFleet()
    }, [])

    const handleOpenStatusModal = (ship: FleetShip) => {
        setSelectedShip(ship)
        setNewStatus(ship.status === 'alugada' ? 'manutencao' : ship.status)
        setEstimatedCost('')
        setRepairDescription('')
        setIsStatusModalOpen(true)
    }

    const fleetColumns = useMemo(() => createFleetColumns(handleOpenStatusModal), [])

    const handleCloseModal = () => {
        setIsStatusModalOpen(false)
        setSelectedShip(null)
        setNewStatus('disponivel')
        setEstimatedCost('')
        setRepairDescription('')
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedShip) {
            return
        }

        try {
            setIsSaving(true)
            const response = await apiFetch(`/spaceships/${selectedShip.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                const responseText = await response.text()
                throw new Error(responseText || 'Erro ao atualizar status da nave')
            }

            await loadFleet()
            handleCloseModal()
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Erro ao atualizar status da nave')
        } finally {
            setIsSaving(false)
        }
    }

    const statusModalTitle = selectedShip ? `Gerir Status - ${selectedShip.name}` : 'Gerir Status'
    const tableContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <DataTable columns={fleetColumns} data={fleetShips} rowKey="id" />
        </motion.div>
    )

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Operações"
                title="Gestão de Frota"
                description="Catálogo físico de naves e controle operacional da frota."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadFleet}>
                        Atualizar Frota
                    </PilledButton>
                }
            />

            {loading && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Carregando frota...</p>
                </AnimatedCard>
            )}

            {!loading && error && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            )}

            {!loading && !error && tableContent}

            <Modal
                isOpen={isStatusModalOpen}
                onClose={handleCloseModal}
                title={statusModalTitle}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label htmlFor="newStatus" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">Novo Status</span>
                        </label>
                        <select
                            id="newStatus"
                            className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                            value={newStatus}
                            onChange={(event) => setNewStatus(event.target.value as EditableFleetStatus)}
                        >
                            <option value="disponivel">DISPONIVEL</option>
                            <option value="manutencao">MANUTENCAO</option>
                            <option value="desativada">DESATIVADA</option>
                        </select>
                    </div>

                    {newStatus === 'manutencao' ? (
                        <div className="space-y-5 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                            <div className="form-control">
                                <label htmlFor="estimatedCost" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">Custo Estimado</span>
                                </label>
                                <input
                                    id="estimatedCost"
                                    type="number"
                                    min="0"
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={estimatedCost}
                                    onChange={(event) => setEstimatedCost(event.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="repairDescription" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">Descrição do Reparo</span>
                                </label>
                                <textarea
                                    id="repairDescription"
                                    className="textarea textarea-bordered min-h-28 w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={repairDescription}
                                    onChange={(event) => setRepairDescription(event.target.value)}
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

export default FleetManagement
