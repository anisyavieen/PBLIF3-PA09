
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <p className="welcome-label">OVERVIEW</p>
        <h1>Selamat datang, {user.nama || 'Admin'}!</h1>
        <p>
          Kelola laboratorium virtual dan pantau modul pengujian
          melalui halaman dashboard ini.
        </p>
      </section>

      <section className="dashboard-cards">
        <article className="dashboard-card">
          <div className="dashboard-card-icon">⌘</div>
          <p>Total Modul</p>
          <h2>—</h2>
          <span>Modul laboratorium</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-icon">▤</div>
          <p>Data Pengujian</p>
          <h2>—</h2>
          <span>Riwayat pengujian</span>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-icon">◈</div>
          <p>Status Sistem</p>
          <h2 className="system-status">Aktif</h2>
          <span>Antarmuka dashboard tersedia</span>
        </article>
      </section>

      <section className="dashboard-info">
        <div>
          <h3>V-LabVerse</h3>
          <p>
            Platform laboratorium virtual untuk mendukung kegiatan
            pengujian dan eksplorasi sains.
          </p>
        </div>
        <span className="info-badge">Admin Panel</span>
      </section>
    </div>
  )
}

export default Dashboard
