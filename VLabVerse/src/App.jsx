import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import KontrolAkunAdmin from './pages/KontrolAkunAdmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import ModulLab from './pages/ModulLab.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'
import LandingPage from './pages/LandingPage.jsx'


function DashboardHome() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const role = user?.role

  if (role === 'super_admin') {
    return <KontrolAkunAdmin />
  }

  if (role === 'admin') {
    return <ModulLab />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}