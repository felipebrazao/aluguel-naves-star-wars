import { useEffect, useState } from "react";
import PageHeader from "../../components/shared/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../../components/shared/DataTable";
import Modal from "../../components/shared/Modal";
import PilledButton from "../../components/shared/PilledButton";
import { useFetch } from "../../hooks/useFetch";
import { extractApiErrorMessage, planetService } from "../../services/api";
import type { Planet } from "../../types/api";

type PlanetFormMode = "create" | "edit";

type ActiveBadgeProps = {
  readonly active: boolean;
};

function ActiveBadge({ active }: ActiveBadgeProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${active ? "border-jedi-green/40 bg-jedi-green/10 text-jedi-green" : "border-sith-red/40 bg-sith-red/10 text-sith-red"}`}
    >
      {active ? "ATIVO" : "INATIVO"}
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

function PlanetsManagement() {
  const {
    data: planetsData,
    loading,
    refetch,
  } = useFetch(planetService.getAll);
  const [data, setData] = useState<Planet[]>([]);
  const [isPlanetFormOpen, setIsPlanetFormOpen] = useState(false);
  const [planetFormMode, setPlanetFormMode] =
    useState<PlanetFormMode>("create");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [diameter, setDiameter] = useState("");
  const [climate, setClimate] = useState("");
  const [terrain, setTerrain] = useState("");
  const [population, setPopulation] = useState("");

  useEffect(() => {
    if (planetsData) {
      setData(planetsData);
    }
  }, [planetsData]);

  const resetForm = () => {
    setName("");
    setDiameter("");
    setClimate("");
    setTerrain("");
    setPopulation("");
  };

  const handleCloseModal = () => {
    setIsPlanetFormOpen(false);
    setPlanetFormMode("create");
    setSelectedPlanet(null);
    resetForm();
    setRequestError(null);
  };

  const handleOpenCreateModal = () => {
    setPlanetFormMode("create");
    setSelectedPlanet(null);
    resetForm();
    setRequestError(null);
    setIsPlanetFormOpen(true);
  };

  const handleOpenEditModal = async (planet: Planet) => {
    setRequestError(null);

    try {
      const fullPlanet = await planetService.findById(planet.id);
      setPlanetFormMode("edit");
      setSelectedPlanet(fullPlanet);
      setName(fullPlanet.name);
      setDiameter(
        fullPlanet.diameter != null ? String(fullPlanet.diameter) : "",
      );
      setClimate(fullPlanet.climate ?? "");
      setTerrain(fullPlanet.terrain ?? "");
      setPopulation(
        fullPlanet.population != null ? String(fullPlanet.population) : "",
      );
      setIsPlanetFormOpen(true);
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleToggleActive = async (planet: Planet) => {
    setRequestError(null);

    try {
      await planetService.toggleActive(planet.id);
      await refetch();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handleImport = async () => {
    setRequestError(null);

    try {
      await planetService.importPlanets();
      await refetch();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const handlePlanetFormSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setRequestError("Nome é obrigatório.");
      return;
    }

    const payload = {
      name: name.trim(),
      diameter: diameter ? Number(diameter) : undefined,
      climate: climate.trim() || undefined,
      terrain: terrain.trim() || undefined,
      population: population ? Number(population) : undefined,
    };

    try {
      if (planetFormMode === "edit" && selectedPlanet) {
        const updated = await planetService.update(selectedPlanet.id, payload);
        setData((prev) =>
          prev.map((planet) => (planet.id === updated.id ? updated : planet)),
        );
      } else {
        const created = await planetService.create(payload);
        setData((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      setRequestError(extractApiErrorMessage(error));
    }
  };

  const planetColumns: DataTableColumn<Planet>[] = [
    { header: "Nome do Planeta", accessor: "name" },
    {
      header: "Ativo",
      accessor: (planet) => <ActiveBadge active={planet.active} />,
    },
    {
      header: "População",
      accessor: (planet) =>
        planet.population != null ? String(planet.population) : "—",
    },
    {
      header: "Ações",
      accessor: (planet) => (
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Editar"
            onClick={() => void handleOpenEditModal(planet)}
            variant="secondary"
          />
          <ActionButton
            label={planet.active ? "Desativar" : "Ativar"}
            onClick={() => void handleToggleActive(planet)}
            variant={planet.active ? "danger" : "primary"}
          />
        </div>
      ),
    },
  ];

  const planetFormTitle =
    planetFormMode === "edit" && selectedPlanet
      ? `Editar Planeta - ${selectedPlanet.name}`
      : "Adicionar Planeta";
  const formDisabled = !name.trim();

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Operações"
        title="Gestão de Planetas"
        description="Cadastro de destinos, disponibilidade operacional e restrições de acesso por planeta."
        actions={
          <div className="flex gap-3">
            <PilledButton
              variant="secondary"
              className="px-4 py-2 text-sm"
              onClick={() => void handleImport()}
            >
              Importar Planetas
            </PilledButton>
            <PilledButton
              variant="primary"
              className="px-4 py-2 text-sm"
              onClick={handleOpenCreateModal}
            >
              Adicionar Planeta
            </PilledButton>
          </div>
        }
      />

      {loading ? (
        <p className="text-sw-yellow">Carregando planetas...</p>
      ) : null}
      {requestError ? <p className="text-sith-red">{requestError}</p> : null}

      <DataTable columns={planetColumns} data={data} rowKey="id" />

      <Modal
        isOpen={isPlanetFormOpen}
        onClose={handleCloseModal}
        title={planetFormTitle}
      >
        <form className="space-y-5" onSubmit={handlePlanetFormSubmit}>
          <div className="form-control">
            <label htmlFor="planetName" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                Nome
              </span>
            </label>
            <input
              id="planetName"
              className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tatooine"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-control">
              <label htmlFor="planetDiameter" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Diâmetro
                </span>
              </label>
              <input
                id="planetDiameter"
                type="number"
                min="0"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={diameter}
                onChange={(event) => setDiameter(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label htmlFor="planetPopulation" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  População
                </span>
              </label>
              <input
                id="planetPopulation"
                type="number"
                min="0"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={population}
                onChange={(event) => setPopulation(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-control">
              <label htmlFor="planetClimate" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Clima
                </span>
              </label>
              <input
                id="planetClimate"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={climate}
                onChange={(event) => setClimate(event.target.value)}
                placeholder="arid"
              />
            </div>

            <div className="form-control">
              <label htmlFor="planetTerrain" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Terreno
                </span>
              </label>
              <input
                id="planetTerrain"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={terrain}
                onChange={(event) => setTerrain(event.target.value)}
                placeholder="desert"
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
              disabled={formDisabled}
            >
              {planetFormMode === "edit"
                ? "Salvar Alterações"
                : "Criar Planeta"}
            </PilledButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default PlanetsManagement;
