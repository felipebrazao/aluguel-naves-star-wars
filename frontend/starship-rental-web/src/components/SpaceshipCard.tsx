import { Link } from 'react-router-dom'
import AnimatedCard from './ui/AnimatedCard'
import AnimatedButton from './ui/AnimatedButton'

export type SpaceshipCardProps = {
  id: number
  name: string
  model: string
  dailyPrice: number
  capacity: number
  status: string
}

function SpaceshipCard({ id, name, model, dailyPrice, capacity, status }: Readonly<SpaceshipCardProps>) {
  const statusStyles: Record<string, string> = {
    disponivel: 'border-jedi-green/40 bg-jedi-green/10 text-jedi-green',
    manutencao: 'border-windu-purple/40 bg-windu-purple/10 text-windu-purple',
    desativada: 'border-sith-red/40 bg-sith-red/10 text-sith-red',
    alugada: 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue',
  }

  const normalizedStatus = status.toLowerCase()
  const displayStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

  return (
    <AnimatedCard className="flex h-full min-h-[320px] flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rebel-blue">Nave</p>
          <h3 className="mt-1 text-xl font-semibold text-sw-yellow">{name}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[normalizedStatus] ?? statusStyles.disponivel}`}>
          {displayStatus}
        </span>
      </div>

      <dl className="mt-6 grid flex-1 grid-cols-2 content-start gap-3 text-sm text-gray-300">
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

      <AnimatedButton as={Link} to={`/nave/${id}`} variant="secondary" className="mt-6 w-full">
        Ver detalhes
      </AnimatedButton>
    </AnimatedCard>
  )
}

export default SpaceshipCard