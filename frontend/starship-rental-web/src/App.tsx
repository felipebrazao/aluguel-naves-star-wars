import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import FleetManagement from './pages/admin/FleetManagement'
import LocationsManagement from './pages/admin/LocationsManagement'
import Login from './pages/Login'
import Home from './pages/Home'
import MyRentals from './pages/MyRentals'
import SpaceshipDetails from './pages/SpaceshipDetails'

function FlyonUITest() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-panel-border bg-panel-dark p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">FlyonUI</p>
        <h2 className="mt-2 text-3xl font-semibold text-sw-yellow">Teste visual de componentes</h2>
        <p className="mt-3 text-sm text-gray-400">
          Botões padrão da biblioteca e um botão combinando FlyonUI com as cores customizadas do projeto.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button className="btn btn-primary">FlyonUI Primary</button>

        <button className="btn border border-sw-yellow bg-transparent text-sw-yellow hover:bg-sw-yellow hover:text-space-black">
          Star Rental Custom
        </button>
      </div>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/flyonui-test" element={<FlyonUITest />} />
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
          <Route
            path="/admin/localidades"
            element={
              <ProtectedRoute role="Admin">
                <LocationsManagement />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App