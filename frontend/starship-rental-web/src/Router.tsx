import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/shared/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import FleetManagement from './pages/admin/FleetManagement'
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
                    path="/admin"
                    element={
                        <ProtectedRoute role="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/frota"
                    element={
                        <ProtectedRoute role="Admin">
                            <FleetManagement />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

export default Router