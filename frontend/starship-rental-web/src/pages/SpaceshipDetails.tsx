import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/shared/PageHeader";
import PilledButton from "../components/shared/PilledButton";
import { useFetch } from "../hooks/useFetch";
import {
  planetService,
  rentalService,
  spaceshipService,
} from "../services/api";
import type { Planet } from "../types/api";

const paymentMethods = [
  { id: 1, name: "credito" },
  { id: 2, name: "debito" },
  { id: 3, name: "pix" },
] as const;

function SpaceshipDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupPlanetId, setPickupPlanetId] = useState("");
  const [returnPlanetId, setReturnPlanetId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("1");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const spaceshipId = Number(id);
  const isValidSpaceshipId = Number.isInteger(spaceshipId) && spaceshipId > 0;

  const fetchSpaceship = useCallback(() => {
    if (!isValidSpaceshipId) {
      throw new Error("Identificador de nave inválido.");
    }

    return spaceshipService.getById(spaceshipId);
  }, [isValidSpaceshipId, spaceshipId]);

  const fetchPlanets = useCallback(() => planetService.findAll(true), []);

  const { data: spaceship, loading, error } = useFetch(fetchSpaceship);

  const {
    data: planets,
    loading: planetsLoading,
    error: planetsError,
  } = useFetch(fetchPlanets);

  const totalDays =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const totalPrice = totalDays * Number(spaceship?.dailyPrice ?? 0);
  const planetMap = useMemo(
    () =>
      new Map<number, Planet>(
        (planets ?? []).map((planet) => [planet.id, planet]),
      ),
    [planets],
  );

  const selectedPickupPlanet = planetMap.get(Number(pickupPlanetId));
  const selectedReturnPlanet = planetMap.get(Number(returnPlanetId));

  const isSubmitDisabled =
    !user ||
    !spaceship ||
    !startDate ||
    !endDate ||
    !pickupPlanetId ||
    !returnPlanetId ||
    !paymentMethodId ||
    totalDays <= 0 ||
    !selectedPickupPlanet ||
    !selectedReturnPlanet;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!user) {
      setSubmitError("Faça login para confirmar o aluguel.");
      return;
    }

    if (!spaceship) {
      setSubmitError("Nave não encontrada.");
      return;
    }

    try {
      await rentalService.create({
        userId: user.id,
        spaceshipId: spaceship.id,
        pickupPlanetId: Number(pickupPlanetId),
        returnPlanetId: Number(returnPlanetId),
        startDate,
        endDate,
        paymentMethodId: Number(paymentMethodId),
      });

      setSubmitSuccess(
        "Aluguel confirmado com sucesso. Redirecionando para seus aluguéis...",
      );
      window.setTimeout(() => {
        navigate("/meus-alugueis", { replace: true });
      }, 1200);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao confirmar aluguel",
      );
    }
  };

  if (loading) {
    return (
      <section className="space-y-8">
        <PageHeader
          overline="Detalhes da Nave"
          title="Carregando..."
          description="Buscando informações da nave selecionada."
        />
        <p className="text-sw-yellow">Carregando detalhes da nave...</p>
      </section>
    );
  }

  if (error || !spaceship) {
    return (
      <section className="space-y-8">
        <PageHeader
          overline="Detalhes da Nave"
          title="Falha ao carregar"
          description="Não foi possível carregar os detalhes da nave selecionada."
        />
        <p className="text-sith-red">{error ?? "Nave não encontrada."}</p>
        <Link to="/" className="text-jedi-blue underline">
          Voltar para o catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        overline={spaceship.model}
        title={spaceship.name}
        description="Detalhes da nave e consolidação do checkout de aluguel."
      />

      <div className="grid gap-8 md:grid-cols-3">
        <article className="md:col-span-2 rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-jedi-blue">
                Ficha Técnica
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">
                Visão geral da nave
              </h3>
            </div>

            <span className="rounded-full border border-jedi-green/40 bg-jedi-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-jedi-green">
              {spaceship.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-panel-border/80 bg-surface-light/30 p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">
                  Fabricante
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-100">
                  {spaceship.manufacturer}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">
                  Capacidade
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-100">
                  {spaceship.capacity} tripulante(s)
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">
                  Preço da Diária
                </p>
                <p className="mt-2 text-3xl font-semibold text-sw-yellow">
                  R$ {Number(spaceship.dailyPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="md:col-span-1 rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-jedi-blue">
              Checkout
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-sw-yellow">
              Consola de Reserva
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Defina as datas, os planetas e o método de pagamento para calcular
              e registrar o aluguel.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {!user ? (
              <p className="rounded-2xl border border-sith-red/40 bg-sith-red/10 px-4 py-3 text-sm text-sith-red">
                Você precisa estar autenticado para criar um aluguel.
              </p>
            ) : null}

            <div className="form-control">
              <label htmlFor="startDate" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Data de Início
                </span>
              </label>
              <input
                id="startDate"
                type="date"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label htmlFor="endDate" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Data de Fim
                </span>
              </label>
              <input
                id="endDate"
                type="date"
                className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label htmlFor="pickupPlanetId" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Planeta de Retirada
                </span>
              </label>
              <select
                id="pickupPlanetId"
                className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                value={pickupPlanetId}
                onChange={(event) => setPickupPlanetId(event.target.value)}
                disabled={planetsLoading || (planets ?? []).length === 0}
              >
                <option value="">Selecionar planeta</option>
                {(planets ?? []).map((planet) => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="returnPlanetId" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Planeta de Devolução
                </span>
              </label>
              <select
                id="returnPlanetId"
                className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                value={returnPlanetId}
                onChange={(event) => setReturnPlanetId(event.target.value)}
                disabled={planetsLoading || (planets ?? []).length === 0}
              >
                <option value="">Selecionar planeta</option>
                {(planets ?? []).map((planet) => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="paymentMethodId" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-jedi-blue">
                  Método de Pagamento
                </span>
              </label>
              <select
                id="paymentMethodId"
                className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                value={paymentMethodId}
                onChange={(event) => setPaymentMethodId(event.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            {planetsError ? (
              <p className="text-sm text-sith-red">{planetsError}</p>
            ) : null}
            {submitError ? (
              <p className="text-sm text-sith-red">{submitError}</p>
            ) : null}
            {submitSuccess ? (
              <p className="text-sm text-jedi-green">{submitSuccess}</p>
            ) : null}

            <div className="divider border-panel-border text-gray-500" />

            <div className="rounded-2xl border border-panel-border bg-surface-light/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-jedi-blue">
                Valor Total
              </p>
              <p className="mt-2 text-3xl font-semibold text-sw-yellow">
                R$ {totalPrice.toFixed(2)}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {totalDays > 0
                  ? `${totalDays} dia(s) de aluguel`
                  : "Selecione as datas para calcular"}
              </p>
            </div>

            <PilledButton
              variant="primary"
              className="w-full"
              disabled={isSubmitDisabled}
            >
              Confirmar aluguel
            </PilledButton>
          </form>
        </article>
      </div>
    </section>
  );
}

export default SpaceshipDetails;
