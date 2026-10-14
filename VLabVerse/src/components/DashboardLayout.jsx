import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './DashboardLayout.css'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'


function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Guard sederhana: tanpa token, kembali ke halaman login.
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <MenuOutlinedIcon />
          </button>
          <span>V-LabVerse</span>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout