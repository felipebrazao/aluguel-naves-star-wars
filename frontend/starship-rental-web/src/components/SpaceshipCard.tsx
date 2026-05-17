import { Link } from 'react-router-dom'

export type SpaceshipCardProps = {
  id: string
  name: string
  model: string
  dailyPrice: number
  capacity: number
  status: 'DISPONIVEL' | 'MANUTENCAO'
}

function SpaceshipCard({ id, name, model, dailyPrice, capacity, status }: SpaceshipCardProps) {
  const statusStyles =
    status === 'DISPONIVEL'
      ? 'border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue'
      : 'border-empire-red/40 bg-empire-red/10 text-empire-red'

  return (
    <article className="rounded-2xl border border-panel-border bg-panel-dark p-5 shadow-[0_0_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Nave</p>
          <h3 className="mt-1 text-xl font-semibold text-sw-yellow">{name}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles}`}>
          {status}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm text-gray-300">
        <div>
          <dt className="text-gray-500">Modelo</dt>
          <dd className="text-gray-100">{model}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Capacidade</dt>
          <dd className="text-gray-100">{capacity} tripulantes</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-gray-500">Diária</dt>
          <dd className="text-lg font-semibold text-sw-yellow">R$ {dailyPrice.toFixed(2)}</dd>
        </div>
      </dl>

      <Link
        to={`/nave/${id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-sw-yellow/40 bg-sw-yellow/10 px-4 py-3 text-sm font-semibold text-sw-yellow transition-all hover:bg-sw-yellow hover:text-space-black"
      >
        Ver detalhes
      </Link>
    </article>
  )
}

export default SpaceshipCard