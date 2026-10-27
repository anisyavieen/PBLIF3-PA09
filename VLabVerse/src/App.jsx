import {BrowserRouter, Routes, Route ,Navigate,} from 'react-router-dom'
import Login from './pages/Login.jsx'
import KontrolAkunAdmin from './pages/KontrolAkunAdmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import ModulLab from './pages/ModulLab.jsx'
import NotFound from './pages/NotFound.jsx'
import LandingPage from './pages/LandingPage.jsx'
import './App.css'
import LandingPageAdmin from './pages/LandingPageAdmin.jsx'
import UjiCoba from './pages/UjiCoba.jsx'
import KelolaModul from './pages/KelolaModul.jsx'

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

// Landingpage Admin

function HasilRiwayat() {
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/uji-coba" element={<UjiCoba />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
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
            element={<KelolaModul />}
          />

          <Route
            path="riwayat"
            element={<HasilRiwayat />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
