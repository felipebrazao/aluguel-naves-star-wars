import { motion } from 'framer-motion'
import Tabs from '../../components/shared/Tabs'
import FleetManagement from './FleetManagement'
import PlanetsManagement from './PlanetsManagement'

function Management() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-panel-border bg-panel-dark p-8"
        >
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
        </motion.section>
    )
}

export default Management
