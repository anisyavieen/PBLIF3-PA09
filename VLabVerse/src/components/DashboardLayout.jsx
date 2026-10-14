
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function DashboardLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">V</span>
          <span>V-LabVerse</span>
        </div>

        <p className="sidebar-label">MENU UTAMA</p>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end>
            <span>▦</span> Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <p>Virtual Laboratory Platform</p>
          <button type="button" onClick={handleLogout}>
            ↪ Keluar
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-caption">V-LABVERSE / ADMIN PANEL</p>
            <h2>Dashboard</h2>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {(user.nama || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.nama || 'Admin'}</strong>
              <span>{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
