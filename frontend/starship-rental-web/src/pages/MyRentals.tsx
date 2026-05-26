import { useCallback, useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../components/shared/DataTable";
import PilledButton from "../components/shared/PilledButton";
import { useFetch } from "../hooks/useFetch";
import { extractApiErrorMessage, rentalService } from "../services/api";
import type { Rental } from "../types/api";

type MyRentalsProps = {
  readonly userId: number;
};

function MyRentals({ userId }: MyRentalsProps) {
  const fetchRentals = useCallback(
    () => rentalService.getByUser(userId),
    [userId],
  );
  const { data: rentals, loading, error } = useFetch(fetchRentals);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const handleConcludeRental = async (rentalId: number) => {
    setActionError(null);
    setActionLoadingId(rentalId);

    try {
      await rentalService.conclude(rentalId);
      await fetchRentals();
    } catch (error) {
      setActionError(extractApiErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  const rentalColumns: DataTableColumn<Rental>[] = [
    { header: "Nave", accessor: "spaceshipName" },
    {
      header: "Status",
      accessor: (rental) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            rental.status === "ativa"
              ? "border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue"
              : "border-jedi-green/40 bg-jedi-green/10 text-jedi-green"
          }`}
        >
          {rental.status}
        </span>
      ),
    },
    {
      header: "Ação",
      accessor: (rental) =>
        rental.status === "ativa" ? (
          <PilledButton
            variant="primary"
            className="px-3 py-2 text-xs"
            onClick={() => handleConcludeRental(rental.id)}
            disabled={actionLoadingId === rental.id}
          >
            {actionLoadingId === rental.id
              ? "Encerrando..."
              : "Encerrar aluguel"}
          </PilledButton>
        ) : (
          <span className="text-xs text-gray-500">Finalizado</span>
        ),
    },
    {
      header: "Retirada Real",
      accessor: (rental) => rental.actualPickupDate ?? "—",
    },
    {
      header: "Devolução Real",
      accessor: (rental) => rental.actualReturnDate ?? "—",
    },
    {
      header: "Valor",
      accessor: (rental) => (
        <span className="font-semibold text-sw-yellow">
          R$ {Number(rental.totalPrice).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Cliente"
        title="Meus Aluguéis"
        description="Acompanhe o histórico das suas locações e o status de cada missão."
      />

      {loading ? (
        <p className="text-sw-yellow">Carregando aluguéis...</p>
      ) : null}
      {error ? <p className="text-sith-red">{error}</p> : null}
      {actionError ? <p className="text-sith-red">{actionError}</p> : null}

      <DataTable columns={rentalColumns} data={rentals ?? []} rowKey="id" />
    </section>
  );
}

export default MyRentals;
