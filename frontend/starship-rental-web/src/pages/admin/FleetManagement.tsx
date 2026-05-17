import { useEffect, useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'

type FleetStatus = 'DISPONIVEL' | 'MANUTENCAO' | 'DESATIVADA'

type FleetShip = {
    id: string
    name: string
    model: string
    status: FleetStatus
}

const fleetShips: FleetShip[] = [
    { id: 'fleet-001', name: 'Millennium Falcon', model: 'YT-1300', status: 'DISPONIVEL' },
    { id: 'fleet-002', name: 'X-Wing Starfighter', model: 'T-65B', status: 'MANUTENCAO' },
    { id: 'fleet-003', name: 'TIE Advanced x1', model: 'Experimental Interceptor', status: 'DESATIVADA' },
]

const fleetStatusStyles: Record<FleetStatus, string> = {
    DISPONIVEL: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    MANUTENCAO: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    DESATIVADA: 'border-gray-500/40 bg-gray-500/10 text-gray-300',
}

function FleetManagement() {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedShip, setSelectedShip] = useState<FleetShip | null>(null)
    const [newStatus, setNewStatus] = useState<FleetStatus>('DISPONIVEL')
    const [estimatedCost, setEstimatedCost] = useState('')
    const [repairDescription, setRepairDescription] = useState('')

    useEffect(() => {
        if (selectedShip) {
            setNewStatus(selectedShip.status)
            setEstimatedCost('')
            setRepairDescription('')
        }
    }, [selectedShip])

    const fleetColumns: DataTableColumn<FleetShip>[] = [
        { header: 'Nome da Nave', accessor: 'name' },
        { header: 'Modelo', accessor: 'model' },
        {
            header: 'Status da Frota',
            accessor: (ship) => (
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${fleetStatusStyles[ship.status]}`}
                >
                    {ship.status}
                </span>
            ),
        },
        {
            header: 'Ações',
            accessor: (ship) => (
                <PilledButton
                    variant="primary"
                    className="px-3 py-2 text-xs"
                    onClick={() => {
                        setSelectedShip(ship)
                        setIsStatusModalOpen(true)
                    }}
                >
                    Gerir Status
                </PilledButton>
            ),
        },
    ]

    const handleCloseModal = () => {
        setIsStatusModalOpen(false)
        setSelectedShip(null)
        setNewStatus('DISPONIVEL')
        setEstimatedCost('')
        setRepairDescription('')
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        handleCloseModal()
    }

    return (
        <section className="space-y-8">
            <PageHeader
                overline="Admin"
                title="Gestão de Frota"
                description="Catálogo físico de naves e controle operacional da frota."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm">
                        Adicionar Nave
                    </PilledButton>
                }
            />

            <DataTable columns={fleetColumns} data={fleetShips} rowKey="id" />

            <Modal
                isOpen={isStatusModalOpen}
                onClose={handleCloseModal}
                title={`Gerir Status${selectedShip ? ` - ${selectedShip.name}` : ''}`}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label htmlFor="newStatus" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Novo Status</span>
                        </label>
                        <select
                            id="newStatus"
                            className="select select-bordered w-full bg-black/30 text-gray-100"
                            value={newStatus}
                            onChange={(event) => setNewStatus(event.target.value as FleetStatus)}
                        >
                            <option value="DISPONIVEL">DISPONIVEL</option>
                            <option value="MANUTENCAO">MANUTENCAO</option>
                            <option value="DESATIVADA">DESATIVADA</option>
                        </select>
                    </div>

                    {newStatus === 'MANUTENCAO' ? (
                        <div className="space-y-5 rounded-2xl border border-panel-border bg-black/30 p-4">
                            <div className="form-control">
                                <label htmlFor="estimatedCost" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Custo Estimado</span>
                                </label>
                                <input
                                    id="estimatedCost"
                                    type="number"
                                    min="0"
                                    className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                                    value={estimatedCost}
                                    onChange={(event) => setEstimatedCost(event.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="repairDescription" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Descrição do Reparo</span>
                                </label>
                                <textarea
                                    id="repairDescription"
                                    className="textarea textarea-bordered min-h-28 w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
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

                        <PilledButton variant="primary" className="w-full sm:w-auto">
                            Guardar Alterações
                        </PilledButton>
                    </div>
                </form>
            </Modal>
        </section>
    )
}

export default FleetManagement