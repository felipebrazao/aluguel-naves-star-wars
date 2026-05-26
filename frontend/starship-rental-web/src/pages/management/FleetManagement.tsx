import { useEffect, useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import { useFetch } from '../../hooks/useFetch'
import { spaceshipService } from '../../services/api'
import type { Spaceship, SpaceshipStatus } from '../../types/api'

const fleetStatusStyles: Record<SpaceshipStatus, string> = {
    disponivel: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    alugada: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
    manutencao: 'border-windu-purple/40 bg-windu-purple/10 text-windu-purple',
    desativada: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
}

type FleetStatusBadgeProps = {
    readonly status: SpaceshipStatus
}

function FleetStatusBadge({ status }: FleetStatusBadgeProps) {
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${fleetStatusStyles[status]}`}>
            {status}
        </span>
    )
}

type ManageStatusButtonProps = {
    readonly ship: Spaceship
    readonly onManage: (ship: Spaceship) => void
}

function ManageStatusButton({ ship, onManage }: ManageStatusButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onManage(ship)}>
            Gerir Status
        </PilledButton>
    )
}

const renderFleetStatusCell: DataTableColumn<Spaceship>['accessor'] = (ship) => <FleetStatusBadge status={ship.status} />

function createManageStatusAccessor(onManage: (ship: Spaceship) => void): DataTableColumn<Spaceship>['accessor'] {
    return (ship) => <ManageStatusButton ship={ship} onManage={onManage} />
}

function createFleetColumns(onManage: (ship: Spaceship) => void): DataTableColumn<Spaceship>[] {
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

function FleetManagement() {
    const { data: fetchedShips, loading } = useFetch(spaceshipService.getAll)
    const [data, setData] = useState<Spaceship[]>([])
    const [requestError, setRequestError] = useState<string | null>(null)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedShip, setSelectedShip] = useState<Spaceship | null>(null)
    const [newStatus, setNewStatus] = useState<SpaceshipStatus>('manutencao')
    const [estimatedCost, setEstimatedCost] = useState('')
    const [repairDescription, setRepairDescription] = useState('')

    useEffect(() => {
        if (fetchedShips) {
            setData(fetchedShips)
        }
    }, [fetchedShips])

    const handleOpenStatusModal = (ship: Spaceship) => {
        setSelectedShip(ship)
        setNewStatus(ship.status)
        setEstimatedCost('')
        setRepairDescription('')
        setRequestError(null)
        setIsStatusModalOpen(true)
    }

    const fleetColumns = createFleetColumns(handleOpenStatusModal)

    const handleCloseModal = () => {
        setIsStatusModalOpen(false)
        setSelectedShip(null)
        setNewStatus('manutencao')
        setEstimatedCost('')
        setRepairDescription('')
        setRequestError(null)
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!selectedShip) {
            return
        }

        try {
            const updated = await spaceshipService.updateStatus(selectedShip.id, newStatus)
            setData((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
            handleCloseModal()
        } catch (error) {
            setRequestError(error instanceof Error ? error.message : 'Erro desconhecido')
        }
    }

    const statusModalTitle = selectedShip ? `Gerir Status - ${selectedShip.name}` : 'Gerir Status'

    return (
        <section className="space-y-8">
            <PageHeader
                overline="Operações"
                title="Gestão de Frota"
                description="Catálogo físico de naves e controle operacional da frota."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm">
                        Adicionar Nave
                    </PilledButton>
                }
            />

            {loading ? <p className="text-sw-yellow">Carregando naves...</p> : null}

            <DataTable columns={fleetColumns} data={data} rowKey="id" />

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
                            onChange={(event) => setNewStatus(event.target.value as SpaceshipStatus)}
                        >
                            <option value="manutencao">manutencao</option>
                            <option value="desativada">desativada</option>
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

                    {requestError ? <p className="text-sith-red">{requestError}</p> : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>

                        <PilledButton variant="primary" type="submit" className="w-full sm:w-auto">
                            Guardar Alterações
                        </PilledButton>
                    </div>
                </form>
            </Modal>
        </section>
    )
}

export default FleetManagement
