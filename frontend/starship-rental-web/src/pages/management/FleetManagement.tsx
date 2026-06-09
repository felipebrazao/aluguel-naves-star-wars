import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import AnimatedButton from '../../components/ui/AnimatedButton'
import { apiFetch } from '../../services/api'
import type { SpaceshipResponseDTO } from '../../types/entities'

// Status físico operacional, conforme enums do backend.
// 'desativada' NÃO é um status físico — é controlado pelo campo active (PATCH /active).
type PhysicalFleetStatus = 'disponivel' | 'manutencao' | 'alugada'
type FleetStatus = PhysicalFleetStatus | 'desativada'
type EditableFleetStatus = 'disponivel' | 'manutencao' | 'desativada'

type FleetShip = {
    id: number
    name: string
    model: string
    manufacturer: string
    capacity: number
    dailyPrice: string
    status: PhysicalFleetStatus  // status físico vindo do backend (nunca 'desativada')
    active: boolean              // flag lógica de ativação; false = exibe como 'desativada'
}

const fleetStatusStyles: Record<FleetStatus, string> = {
    disponivel: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    manutencao: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
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

// Badge da tabela: se a nave não estiver ativa, exibe 'desativada' independentemente do status físico.
function renderDisplayStatus(ship: FleetShip): FleetStatus {
    return ship.active ? ship.status : 'desativada'
}

type EditShipButtonProps = {
    readonly ship: FleetShip
    readonly onEdit: (ship: FleetShip) => void
}

function EditShipButton({ ship, onEdit }: EditShipButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onEdit(ship)}>
            Editar
        </PilledButton>
    )
}

const renderFleetStatusCell: DataTableColumn<FleetShip>['accessor'] = (ship) => (
    <FleetStatusBadge status={renderDisplayStatus(ship)} />
)

function createEditShipAccessor(onEdit: (ship: FleetShip) => void): DataTableColumn<FleetShip>['accessor'] {
    return (ship) => <EditShipButton ship={ship} onEdit={onEdit} />
}

function createFleetColumns(onEdit: (ship: FleetShip) => void): DataTableColumn<FleetShip>[] {
    return [
        { header: 'Nome da Nave', accessor: 'name' },
        { header: 'Modelo', accessor: 'model' },
        { header: 'Status da Frota', accessor: renderFleetStatusCell },
        { header: 'Ações', accessor: createEditShipAccessor(onEdit) },
    ]
}

function normalizePhysicalStatus(rawStatus: string): PhysicalFleetStatus {
    const s = rawStatus.toLowerCase()
    if (s === 'manutencao' || s === 'alugada') return s
    return 'disponivel'
}

function FleetManagement() {
    const [fleetShips, setFleetShips] = useState<FleetShip[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedShip, setSelectedShip] = useState<FleetShip | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    // Edit fields
    const [editName, setEditName] = useState('')
    const [editModel, setEditModel] = useState('')
    const [editManufacturer, setEditManufacturer] = useState('')
    const [editCapacity, setEditCapacity] = useState('')
    const [editDailyPrice, setEditDailyPrice] = useState('')

    // Status section
    const [newStatus, setNewStatus] = useState<EditableFleetStatus>('manutencao')
    const [estimatedCost, setEstimatedCost] = useState('')
    const [repairDescription, setRepairDescription] = useState('')

    const loadFleet = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiFetch('/spaceships')
            if (!response.ok) {
                throw new Error('Erro ao carregar frota')
            }

            const data: SpaceshipResponseDTO[] = await response.json()
            const mapped: FleetShip[] = data.map((ship) => ({
                id: ship.id,
                name: ship.name,
                model: ship.model,
                manufacturer: ship.manufacturer ?? '',
                capacity: ship.capacity,
                dailyPrice: ship.dailyPrice,
                status: normalizePhysicalStatus(ship.status),
                active: ship.active,
            }))

            setFleetShips(mapped)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar frota')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadFleet()
    }, [])

    const handleSyncSwapi = async () => {
        try {
            setIsSyncing(true)
            setError(null)
            const response = await apiFetch('/spaceships/import', { method: 'POST' })
            if (!response.ok) {
                throw new Error('Erro ao sincronizar com SWAPI')
            }
            await loadFleet()
        } catch (syncError) {
            setError(syncError instanceof Error ? syncError.message : 'Erro ao sincronizar com SWAPI')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleOpenModal = (ship: FleetShip) => {
        setSelectedShip(ship)
        setEditName(ship.name)
        setEditModel(ship.model)
        setEditManufacturer(ship.manufacturer)
        setEditCapacity(String(ship.capacity))
        setEditDailyPrice(ship.dailyPrice)
        // Naves inativas mostram 'desativada' no select; alugadas não são editáveis mas default para manutencao
        const initialStatus: EditableFleetStatus = !ship.active
            ? 'desativada'
            : ship.status === 'alugada'
                ? 'manutencao'
                : ship.status
        setNewStatus(initialStatus)
        setEstimatedCost('')
        setRepairDescription('')
        setIsModalOpen(true)
    }

    const fleetColumns = useMemo(() => createFleetColumns(handleOpenModal), [])

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedShip(null)
        setEditName('')
        setEditModel('')
        setEditManufacturer('')
        setEditCapacity('')
        setEditDailyPrice('')
        setNewStatus('disponivel')
        setEstimatedCost('')
        setRepairDescription('')
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedShip) return

        try {
            setIsSaving(true)

            // 1. Sempre persiste dados cadastrais via PUT
            const putResponse = await apiFetch(`/spaceships/${selectedShip.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    model: editModel,
                    manufacturer: editManufacturer,
                    capacity: Number(editCapacity),
                    costInCredits: Math.round(Number(editDailyPrice)),
                }),
            })
            if (!putResponse.ok) {
                throw new Error((await putResponse.text()) || 'Erro ao atualizar nave')
            }

            // 2. Lida com ativação / desativação via PATCH /active
            const wantsDeactivate = newStatus === 'desativada'
            if (wantsDeactivate && selectedShip.active) {
                // Nave ativa → desativar
                const res = await apiFetch(`/spaceships/${selectedShip.id}/active`, { method: 'PATCH' })
                if (!res.ok) throw new Error((await res.text()) || 'Erro ao desativar nave')
            } else if (!wantsDeactivate && !selectedShip.active) {
                // Nave inativa → reativar
                const res = await apiFetch(`/spaceships/${selectedShip.id}/active`, { method: 'PATCH' })
                if (!res.ok) throw new Error((await res.text()) || 'Erro ao reativar nave')
            }

            // 3. Lida com mudança de status físico via PATCH /status
            // Apenas quando o novo valor é um status físico válido E é diferente do original.
            // Naves 'alugada' têm seu status gerido pelo sistema de aluguéis — não alteramos.
            const isPhysicalStatus = newStatus === 'disponivel' || newStatus === 'manutencao'
            const physicalStatusChanged = isPhysicalStatus
                && newStatus !== selectedShip.status
                && selectedShip.status !== 'alugada'
            if (physicalStatusChanged) {
                const res = await apiFetch(`/spaceships/${selectedShip.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                })
                if (!res.ok) throw new Error((await res.text()) || 'Erro ao atualizar status da nave')
            }

            await loadFleet()
            handleCloseModal()
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Erro ao atualizar nave')
        } finally {
            setIsSaving(false)
        }
    }

    const modalTitle = selectedShip ? `Editar Nave — ${selectedShip.name}` : 'Editar Nave'

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
                    <div className="flex gap-2">
                        <AnimatedButton
                            variant="ghost-white"
                            className="px-4 py-2 text-sm"
                            onClick={handleSyncSwapi}
                            disabled={isSyncing}
                        >
                            {isSyncing ? 'A sincronizar...' : 'Sincronizar SWAPI'}
                        </AnimatedButton>
                        <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadFleet}>
                            Atualizar Frota
                        </PilledButton>
                    </div>
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
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalTitle}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Edit section */}
                    <div className="space-y-4 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Dados da Nave</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="form-control sm:col-span-2">
                                <label htmlFor="editName" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Nome</span>
                                </label>
                                <input
                                    id="editName"
                                    type="text"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editModel" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Modelo</span>
                                </label>
                                <input
                                    id="editModel"
                                    type="text"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editModel}
                                    onChange={(e) => setEditModel(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editManufacturer" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Fabricante</span>
                                </label>
                                <input
                                    id="editManufacturer"
                                    type="text"
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editManufacturer}
                                    onChange={(e) => setEditManufacturer(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editCapacity" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Capacidade</span>
                                </label>
                                <input
                                    id="editCapacity"
                                    type="number"
                                    min="0"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editCapacity}
                                    onChange={(e) => setEditCapacity(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editDailyPrice" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Preço Diário (Créditos)</span>
                                </label>
                                <input
                                    id="editDailyPrice"
                                    type="number"
                                    min="0"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editDailyPrice}
                                    onChange={(e) => setEditDailyPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status section */}
                    <div className="form-control">
                        <label htmlFor="newStatus" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Status da Frota</span>
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
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Custo Estimado</span>
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
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Descrição do Reparo</span>
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
