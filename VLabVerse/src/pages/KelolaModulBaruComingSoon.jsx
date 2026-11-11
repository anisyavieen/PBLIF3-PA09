import { useLocation } from 'react-router-dom'

function KelolaModulBaruComingSoon() {
  const { state } = useLocation()
  const namaModul = state?.nama || 'Modul'

  return (
    <section className="coming-soon-page">
      <div className="coming-soon-content">
        <h1>Coming Soon</h1>
        <p>
          Halaman pengelolaan modul ini sedang dalam tahap pengembangan.
          Nantikan fitur selanjutnya!
        </p>
      </div>
    </section>
  )
}

export default KelolaModulBaruComingSoon
