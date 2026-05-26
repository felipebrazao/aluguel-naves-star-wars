import PageHeader from "../components/shared/PageHeader";
import DataTable, {
  type DataTableColumn,
} from "../components/shared/DataTable";
import { useFetch } from "../hooks/useFetch";
import { rentalService, userService } from "../services/api";
import type { Rental, User } from "../types/api";

type DashboardRental = Rental & {
  customerName: string;
};

const statusStyles: Record<string, string> = {
  ativa: "border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow",
  concluida: "border-jedi-green/40 bg-jedi-green/10 text-jedi-green",
  cancelada: "border-sith-red/40 bg-sith-red/10 text-sith-red",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function buildRentalColumns(): DataTableColumn<DashboardRental>[] {
  return [
    { header: "Cliente", accessor: "customerName" },
    { header: "Nave", accessor: "spaceshipName" },
    {
      header: "Status",
      accessor: (rental) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[rental.status] ?? "border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue"}`}
        >
          {rental.status}
        </span>
      ),
    },
    { header: "Data", accessor: (rental) => formatDateTime(rental.createdAt) },
    {
      header: "Total",
      accessor: (rental) => (
        <span className="font-semibold text-sw-yellow">
          Créditos {Number(rental.totalPrice).toLocaleString("pt-BR")}
        </span>
      ),
    },
  ];
}

function OperationsDashboard() {
  const { data: rentals, loading, error } = useFetch(rentalService.findAll);
  const { data: users } = useFetch(userService.findAll);

  const customerNamesById = new Map<number, string>(
    (users ?? []).map((user: User) => [user.id, user.name]),
  );

  const dashboardRentals: DashboardRental[] = (rentals ?? []).map((rental) => ({
    ...rental,
    customerName:
      customerNamesById.get(rental.userId) ?? `Cliente #${rental.userId}`,
  }));

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Operações"
        title="Dashboard Geral"
        description="Visão consolidada de todos os aluguéis do sistema."
      />

      {loading ? (
        <p className="text-sw-yellow">Carregando dashboard...</p>
      ) : null}
      {error ? <p className="text-sith-red">{error}</p> : null}

      <DataTable
        columns={buildRentalColumns()}
        data={dashboardRentals}
        rowKey="id"
      />
    </section>
  );
}

export default OperationsDashboard;
