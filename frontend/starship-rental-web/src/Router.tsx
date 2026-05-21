import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/shared/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import OperationsDashboard from './pages/OperationsDashboard'
import FleetManagement from './pages/management/FleetManagement'
import PlanetsManagement from './pages/management/PlanetsManagement'
import Management from './pages/management/Management'
import Login from './pages/Login'
import Home from './pages/Home'
import MyRentals from './pages/MyRentals'
import SpaceshipDetails from './pages/SpaceshipDetails'

function Router() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/nave/:id" element={<SpaceshipDetails />} />

                <Route
                    path="/meus-alugueis"
                    element={
                        <ProtectedRoute>
                            <MyRentals />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/painel/gestao"
                    element={
                        <ProtectedRoute>
                            <Management />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/painel"
                    element={
                        <ProtectedRoute>
                            <OperationsDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/frota"
                    element={
                        <ProtectedRoute>
                            <FleetManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/planetas"
                    element={
                        <ProtectedRoute>
                            <PlanetsManagement />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

export default Router