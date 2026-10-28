import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'

const MENU_ITEMS = [
  {
    to: '/dashboard/landingpage',
    label: 'Data Content',
    icon: <HomeOutlinedIcon />,
  },
  {
    to: '/dashboard/modul',
    label: 'Data Modul',
    icon: <ScienceOutlinedIcon />,
  },
  {
    to: '/dashboard/riwayat',
    label: 'Hasil Riwayat',
    icon: <HistoryOutlinedIcon />,
  },
]

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch {
    return {}
  }
}

function AdminSidebar({ open = false, onClose }) {
  const navigate = useNavigate()
  const user = getStoredUser()

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
          <p>Panel Admin</p>
        </div>

        <nav className="sidebar-nav" aria-label="Menu utama">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
            <strong>
              {user.nama || user.name || 'Pengguna'}
            </strong>
            <span>{user.email || '-'}</span>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogoutOutlinedIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar