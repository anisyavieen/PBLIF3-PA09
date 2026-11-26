import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') || {}
  } catch {
    return {}
  }
}

function Sidebar({ open = false, onClose }) {
  const navigate = useNavigate()
  const user = getStoredUser()

  const isPengguna = user.role === 'pengguna'

  const menuItems = isPengguna
    ? [
        {
          to: '/pengguna/riwayat',
          label: 'Hasil Simulasi',
          icon: <HistoryOutlinedIcon />,
        },
      ]
    : [
        {
          to: '/dashboard',
          label: 'Data Akun Admin',
          icon: <PeopleAltOutlinedIcon />,
        },
      ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <ScienceOutlinedIcon fontSize="medium" />
            <span>V-LabVerse</span>
          </div>

          <p>{isPengguna ? 'Panel Pengguna Umum' : 'Panel Super Admin'}</p>
        </div>

        <nav className="sidebar-nav" aria-label="Menu utama">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user.nama || user.name || 'Pengguna'}</strong>
            <span>{user.email || '-'}</span>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogoutOutlinedIcon />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar