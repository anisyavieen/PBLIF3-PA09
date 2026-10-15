
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <h2>Halaman tidak ditemukan</h2>
      <p>Halaman yang kamu cari tidak tersedia.</p>
      <Link to="/login">Kembali ke halaman login</Link>
    </main>
  )
}

export default NotFound
