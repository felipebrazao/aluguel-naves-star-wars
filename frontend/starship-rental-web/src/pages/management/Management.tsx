import Tabs from '../../components/shared/Tabs'
import FleetManagement from './FleetManagement'
import PlanetsManagement from './PlanetsManagement'

function Management() {
    return (
        <section className="rounded-3xl border border-panel-border bg-panel-dark p-8">
            <Tabs
                tabs={[
                    {
                        label: 'Frota',
                        content: <FleetManagement />,
                        id: 'fleet',
                    },
                    {
                        label: 'Planetas',
                        content: <PlanetsManagement />,
                        id: 'planets',
                    },
                ]}
                className="mb-0"
            />
        </section>
    )
}

export default Management
