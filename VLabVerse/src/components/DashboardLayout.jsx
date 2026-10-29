import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AdminSidebar from '../components/AdminSidebar'
import './DashboardLayout.css'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="dashboard-layout">
      {user?.role === 'admin' ? (
        <AdminSidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
        />
      ) : (
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
        />
      )}

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