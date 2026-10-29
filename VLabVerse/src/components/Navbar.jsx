import './Navbar.css'

function FlaskIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3h6" />
      <path d="M10 3v6.2L4.6 18.1A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.9L14 9.2V3" />
      <path d="M7.5 15h9" />
    </svg>
  )
}

export default function Navbar() {
  return (
    <nav className="vlab-navbar">
      <div className="vlab-logo">
        <FlaskIcon />
        <span>V-LabVerse</span>
      </div>

      <div className="vlab-nav-links">
      <a href="/">Home</a>
      <a href="/#fitur">Fitur</a>
      <a href="/#cara-kerja">Cara Kerja</a>
      <a href="/#kontak">Kontak</a>
      <a href="/login" className="vlab-login">
        Login
      </a>
    </div>
    </nav>
  )
}