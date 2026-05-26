import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import { useFetch } from '../../hooks/useFetch'
import { planetService } from '../../services/api'
import type { Planet } from '../../types/api'

type ManagePlanetButtonProps = {
    readonly planet: Planet
    readonly onManage: (planet: Planet) => void
}

function ManagePlanetButton({ planet, onManage }: ManagePlanetButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onManage(planet)}>
            Gerir Planeta
        </PilledButton>
    )
}

function createManagePlanetAccessor(onManage: (planet: Planet) => void): DataTableColumn<Planet>['accessor'] {
    return (planet) => <ManagePlanetButton planet={planet} onManage={onManage} />
}

function createPlanetColumns(onManage: (planet: Planet) => void): DataTableColumn<Planet>[] {
    return [
        { header: 'Nome do Planeta', accessor: 'name' },
        {
            header: 'Ações',
            accessor: createManagePlanetAccessor(onManage),
        },
    ]
}

function PlanetsManagement() {
    const { data: planetsData, loading, error } = useFetch(planetService.getAll)
    const [isPlanetModalOpen, setIsPlanetModalOpen] = useState(false)
    const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)

    const handleOpenPlanetModal = (planet: Planet) => {
        setSelectedPlanet(planet)
        setIsPlanetModalOpen(true)
    }

    const planetColumns = createPlanetColumns(handleOpenPlanetModal)

    const handleCloseModal = () => {
        setIsPlanetModalOpen(false)
        setSelectedPlanet(null)
    }

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    const planetModalTitle = selectedPlanet ? `Gerir Planeta - ${selectedPlanet.name}` : 'Gerir Planeta'

    return (
        <section className="space-y-8">
            <PageHeader
                overline="Operações"
                title="Gestão de Planetas"
                description="Cadastro de destinos, disponibilidade operacional e restrições de acesso por planeta."
                actions={
                    <PilledButton variant="primary" className="px-4 py-2 text-sm" disabled>
                        {/* Pendente: habilitar criação quando houver fluxo de formulário conectado ao endpoint POST /planets */}
                        Adicionar Planeta
                    </PilledButton>
                }
            />

            {loading ? <p className="text-sw-yellow">Carregando planetas...</p> : null}
            {error ? <p className="text-sith-red">{error}</p> : null}

            <DataTable columns={planetColumns} data={planetsData ?? []} rowKey="id" />

            <Modal
                isOpen={isPlanetModalOpen}
                onClose={handleCloseModal}
                title={planetModalTitle}
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Pendente: habilitar edição quando houver campos de planeta na UI alinhados ao endpoint PUT /planets/{id} */}
                    {/* Pendente: habilitar desativação quando houver ação explícita para PATCH /planets/{id}/active */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>

                        <PilledButton variant="primary" type="submit" className="w-full sm:w-auto" disabled>
                            Guardar Alterações
                        </PilledButton>
                    </div>
                </form>
            </Modal>
        </section>
    )
}

export default PlanetsManagement
