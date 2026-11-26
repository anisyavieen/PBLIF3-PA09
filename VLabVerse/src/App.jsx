import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login.jsx'
import KontrolAkunAdmin from './pages/KontrolAkunAdmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import ModulLab from './pages/ModulLab.jsx'
import NotFound from './pages/NotFound.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LandingPageAdmin from './pages/LandingPageAdmin.jsx'
import UjiCoba from './pages/UjiCoba.jsx'
import KelolaParameter from './pages/KelolaParameter.jsx'
import HasilSimulasi from './pages/HasilSimulasi.jsx'
import HasilSimulasiPengguna from './pages/HasilSimulasiPengguna.jsx'
import KelolaModulBaruComingSoon from './pages/KelolaModulBaruComingSoon.jsx'

import './App.css'

function DashboardHome() {
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  if (user?.role === 'super_admin') {
    return <KontrolAkunAdmin />
  }

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard/landingpage" replace />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/uji-coba" element={<UjiCoba />} />
        <Route path="/login" element={<Login />} />

        {/* Halaman Admin dan Super Admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          <Route
            path="landingpage"
            element={<LandingPageAdmin />}
          />

          <Route
            path="modul"
            element={<ModulLab />}
          />

          <Route
            path="modul/:id/kelola"
            element={<KelolaParameter />}
          />

          <Route
            path="modul/:id/kelola-baru"
            element={<KelolaModulBaruComingSoon />}
          />
          
          <Route
            path="riwayat"
            element={<HasilSimulasi />}
          />
        </Route>


        <Route
          path="/pengguna"
          element={
            <ProtectedRoute allowedRoles={['pengguna']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="riwayat" replace />}
          />
          <Route
            path="riwayat"
            element={<HasilSimulasiPengguna />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}