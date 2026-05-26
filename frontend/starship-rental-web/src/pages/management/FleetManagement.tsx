import { useEffect, useState } from "react";
import PageHeader from "../../components/shared/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../../components/shared/DataTable";
import Modal from "../../components/shared/Modal";
import PilledButton from "../../components/shared/PilledButton";
import { useFetch } from "../../hooks/useFetch";
import { extractApiErrorMessage, spaceshipService } from "../../services/api";
import type { Spaceship, SpaceshipStatus } from "../../types/api";

type ShipFormMode = "create" | "edit";

type FleetStatusBadgeProps = {
  readonly status: SpaceshipStatus;
};

const fleetStatusStyles: Record<SpaceshipStatus, string> = {
  disponivel: "border-jedi-green/40 bg-jedi-green/10 text-jedi-green",
  alugada: "border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue",
  manutencao: "border-windu-purple/40 bg-windu-purple/10 text-windu-purple",
  desativada: "border-sith-red/40 bg-sith-red/10 text-sith-red",
};

function FleetStatusBadge({ status }: FleetStatusBadgeProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${fleetStatusStyles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

type ActionButtonProps = {
  readonly label: string;
  readonly onClick: () => void;
  readonly variant?: "primary" | "secondary" | "danger";
};

function ActionButton({
  label,
  onClick,
  variant = "primary",
}: ActionButtonProps) {
  return (
    <PilledButton
      variant={variant}
      className="px-3 py-2 text-xs"
      onClick={onClick}
    >
      {label}
    </PilledButton>
  );
}

function FleetManagement() {
  const {
    data: fetchedShips,
    loading,
    refetch,
  } = useFetch(spaceshipService.getAll);
  const [data, setData] = useState<Spaceship[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isShipFormOpen, setIsShipFormOpen] = useState(false);
  const [shipFormMode, setShipFormMode] = useState<ShipFormMode>("create");
  const [selectedShip, setSelectedShip] = useState<Spaceship | null>(null);
  const [newStatus, setNewStatus] = useState<SpaceshipStatus>("manutencao");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [repairDescription, setRepairDescription] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipModel, setShipModel] = useState("");
  const [shipManufacturer, setShipManufacturer] = useState("");
  const [shipCapacity, setShipCapacity] = useState("");
  const [shipCostInCredits, setShipCostInCredits] = useState("");

  useEffect(() => {
    if (fetchedShips) {
      setData(fetchedShips);
    }
  }, [fetchedShips]);

  const resetShipForm = () => {
    setShipName("");
    setShipModel("");
    setShipManufacturer("");
    setShipCapacity("");
    setShipCostInCredits("");
  };

  const handleCloseModal = () => {
    setIsStatusModalOpen(false);
    setIsShipFormOpen(false);
    setShipFormMode("create");
    setSelectedShip(null);
    setNewStatus("manutencao");
    setEstimatedCost("");
    setRepairDescription("");
    resetShipForm();
    setRequestError(null);
  };

  const handleOpenCreateModal = () => {
    setShipFormMode("create");
    setSelectedShip(null);
    resetShipForm();
    setRequestError(null);
    setIsShipFormOpen(true);
  };

  const handleOpenEditModal = async (ship: Spaceship) => {
    setRequestError(null);

    try {
      const fullShip = await spaceshipService.findById(ship.id);
      setShipFormMode("edit");
      setSelectedShip(fullShip);
      setShipName(fullShip.name);
      setShipModel(fullShip.model);
      setShipManufacturer(fullShip.manufacturer ?? "");
      setShipCapacity(String(fullShip.capacity ?? ""));
      setShipCostInCredits(String(fullShip.costInCredits ?? ""));
      setIsShipFormOpen(true);
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleOpenStatusModal = (ship: Spaceship) => {
    setSelectedShip(ship);
    setNewStatus(ship.status);
    setEstimatedCost("");
    setRepairDescription("");
    setRequestError(null);
    setIsStatusModalOpen(true);
  };

  const handleImport = async () => {
    setRequestError(null);

    try {
      await spaceshipService.importSpaceships();
      await refetch();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleToggleActive = async (ship: Spaceship) => {
    setRequestError(null);

    try {
      await spaceshipService.toggleActive(ship.id);
      await refetch();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleStatusSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedShip) {
      return;
    }

    try {
      const updated = await spaceshipService.updateStatus(
        selectedShip.id,
        newStatus,
      );
      setData((prev) =>
        prev.map((ship) => (ship.id === updated.id ? updated : ship)),
      );
      handleCloseModal();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleShipFormSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !shipName.trim() ||
      !shipModel.trim() ||
      !shipCapacity.trim() ||
      !shipCostInCredits.trim()
    ) {
      setRequestError("Preencha nome, modelo, capacidade e custo em créditos.");
      return;
    }

    const payload = {
      name: shipName.trim(),
      model: shipModel.trim(),
      manufacturer: shipManufacturer.trim(),
      capacity: Number(shipCapacity),
      costInCredits: Number(shipCostInCredits),
    };

    try {
      if (shipFormMode === "edit" && selectedShip) {
        const updated = await spaceshipService.update(selectedShip.id, payload);
        setData((prev) =>
          prev.map((ship) => (ship.id === updated.id ? updated : ship)),
        );
      } else {
        const created = await spaceshipService.create(payload);
        setData((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const fleetColumns: DataTableColumn<Spaceship>[] = [
    { header: "Nome da Nave", accessor: "name" },
    { header: "Modelo", accessor: "model" },
    {
      header: "Status",
      accessor: (ship) => <FleetStatusBadge status={ship.status} />,
    },
    {
      header: "Ativa",
      accessor: (ship) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${ship.active ? "border-jedi-green/40 bg-jedi-green/10 text-jedi-green" : "border-sith-red/40 bg-sith-red/10 text-sith-red"}`}
        >
          {ship.active ? "ATIVA" : "INATIVA"}
        </span>
      ),
    },
    {
      header: "Ações",
      accessor: (ship) => (
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Editar"
            onClick={() => void handleOpenEditModal(ship)}
            variant="secondary"
          />
          <ActionButton
            label="Status"
            onClick={() => handleOpenStatusModal(ship)}
          />
          <ActionButton
            label={ship.active ? "Desativar" : "Ativar"}
            onClick={() => void handleToggleActive(ship)}
            variant={ship.active ? "danger" : "primary"}
          />
        </div>
      ),
    },
  ];

  const shipFormTitle =
    shipFormMode === "edit" && selectedShip
      ? `Editar Nave - ${selectedShip.name}`
      : "Adicionar Nave";
  const createDisabled =
    !shipName.trim() ||
    !shipModel.trim() ||
    !shipCapacity.trim() ||
    !shipCostInCredits.trim();

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Operações"
        title="Gestão de Frota"
        description="Catálogo físico de naves e controle operacional da frota."
        actions={
          <div className="flex gap-3">
            <PilledButton
              variant="secondary"
              className="px-4 py-2 text-sm"
              onClick={() => void handleImport()}
            >
              Importar Naves
            </PilledButton>
            <PilledButton
              variant="primary"
              className="px-4 py-2 text-sm"
              onClick={handleOpenCreateModal}
            >
              Adicionar Nave
            </PilledButton>
          </div>
        }
      />

      {loading ? <p className="text-sw-yellow">Carregando naves...</p> : null}
      {requestError ? <p className="text-sith-red">{requestError}</p> : null}

      <DataTable columns={fleetColumns} data={data} rowKey="id" />

      <Modal
        isOpen={isStatusModalOpen}
        onClose={handleCloseModal}
        title={
          selectedShip ? `Gerir Status - ${selectedShip.name}` : "Gerir Status"
        }
      >
        <form className="space-y-5" onSubmit={handleStatusSubmit}>
          <div className="form-control">
            <label htmlFor="newStatus" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                Novo Status
              </span>
            </label>
            <select
              id="newStatus"
              className="select select-bordered w-full bg-surface-light/30 text-gray-100"
              value={newStatus}
              onChange={(event) =>
                setNewStatus(event.target.value as SpaceshipStatus)
              }
            >
              <option value="manutencao">manutencao</option>
              <option value="desativada">desativada</option>
            </select>
          </div>

          {newStatus === "manutencao" ? (
            <div className="space-y-5 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
              <div className="form-control">
                <label htmlFor="estimatedCost" className="label">
                  <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                    Custo Estimado
                  </span>
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
                  <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                    Descrição do Reparo
                  </span>
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

            <PilledButton
              variant="primary"
              type="submit"
              className="w-full sm:w-auto"
            >
              Guardar Alterações
            </PilledButton>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isShipFormOpen}
        onClose={handleCloseModal}
        title={shipFormTitle}
      >
        <form className="space-y-5" onSubmit={handleShipFormSubmit}>
          <div className="form-control">
            <label htmlFor="shipName" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                Nome
              </span>
            </label>
            <input
              id="shipName"
              className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
              value={shipName}
              onChange={(event) => setShipName(event.target.value)}
              placeholder="Millennium Falcon"
            />
          </div>

          <div className="form-control">
            <label htmlFor="shipModel" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                Modelo
              </span>
            </label>
            <input
              id="shipModel"
              className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
              value={shipModel}
              onChange={(event) => setShipModel(event.target.value)}
              placeholder="YT-1300"
            />
          </div>

          <div className="form-control">
            <label htmlFor="shipManufacturer" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                Fabricante
              </span>
            </label>
            <input
              id="shipManufacturer"
              className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
              value={shipManufacturer}
              onChange={(event) => setShipManufacturer(event.target.value)}
              placeholder="Corellian Engineering Corporation"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-control">
              <label htmlFor="shipCapacity" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Capacidade
                </span>
              </label>
              <input
                id="shipCapacity"
                type="number"
                min="0"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={shipCapacity}
                onChange={(event) => setShipCapacity(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label htmlFor="shipCostInCredits" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Custo em Créditos
                </span>
              </label>
              <input
                id="shipCostInCredits"
                type="number"
                min="0"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={shipCostInCredits}
                onChange={(event) => setShipCostInCredits(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
              onClick={handleCloseModal}
            >
              Cancelar
            </button>

            <PilledButton
              variant="primary"
              type="submit"
              className="w-full sm:w-auto"
              disabled={createDisabled}
            >
              {shipFormMode === "edit" ? "Salvar Alterações" : "Criar Nave"}
            </PilledButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default FleetManagement;
