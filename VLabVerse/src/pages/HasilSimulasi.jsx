import { useMemo, useState } from 'react'
import { MenuItem, Select, TextField } from '@mui/material'
import './HasilSimulasi.css'

/* =====================================================================
   Sumber data sementara (testing) — nanti diganti API backend.
   Format satu data hasil simulasi (nanti ditulis oleh halaman UjiCoba / backend):
   { id, waktu (ISO string), modul, jenis, a, n, rho, pc, ab, wb, hasil }
   Kalau localStorage kosong, tampil data contoh di bawah.
   ===================================================================== */
const STORAGE_KEY = 'vlab_hasil_simulasi'

function muatData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(d) ? d : []
  } catch {
    return [] // TODO: ganti dengan fetch ke API backend
  }
}

/* ---------- Format ---------- */
const pad = (x) => String(x).padStart(2, '0')

const formatWaktu = (iso) => {
  const d = new Date(iso)
  const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${tanggal}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatAngka = (v, desimal = 2) =>
  Number(v).toLocaleString('id-ID', { minimumFractionDigits: desimal, maximumFractionDigits: desimal })

// yyyy-mm-dd (waktu lokal) supaya bisa dibandingkan dengan nilai <input type="date">
const kunciTanggal = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ---------- Unduh CSV ---------- */
const unduhCSV = (row) => {
  const header = ['Tanggal/waktu', 'Modul', 'Jenis propelan', 'a', 'n', 'rho (kg/m3)', 'Pc (MPa)', 'Ab (cm2)', 'Wb (mm)', 'Laju bakar (mm/s)']
  const isi = [formatWaktu(row.waktu), row.modul, row.jenis, row.a, row.n, row.rho, row.pc, row.ab, row.wb, row.hasil]
  const csv = [header, isi].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hasil-simulasi-${row.id}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/* =====================================================================
   Halaman
   Route: /dashboard/riwayat
   ===================================================================== */
export default function HasilSimulasi() {
  const [data] = useState(muatData)
  const [modul, setModul] = useState('')
  const [tanggal, setTanggal] = useState('')

  const daftarModul = useMemo(() => [...new Set(data.map((d) => d.modul))], [data])

  // Terbaru di atas, lalu disaring sesuai filter
  const tersaring = useMemo(
    () =>
      [...data]
        .sort((x, y) => new Date(y.waktu) - new Date(x.waktu))
        .filter((d) => (!modul || d.modul === modul) && (!tanggal || kunciTanggal(d.waktu) === tanggal)),
    [data, modul, tanggal],
  )

  return (
    <div className="hs-page">
      <div>
        <h1 className="hs-title">Hasil Simulasi</h1>
        <p className="hs-sub">Hasil tiap simulasi yang dijalankan pengguna umum dapat dilihat disini.</p>
      </div>

      {/* Filter */}
      <div className="hs-filter">
        <Select
          size="small"
          displayEmpty
          value={modul}
          onChange={(e) => setModul(e.target.value)}
          className="hs-select"
          inputProps={{ 'aria-label': 'Filter modul' }}
        >
          <MenuItem value="">Semua modul</MenuItem>
          {daftarModul.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </Select>

        <TextField
          size="small"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="hs-date"
          inputProps={{ 'aria-label': 'Filter tanggal' }}
        />
      </div>

      {/* Tabel */}
      <div className="hs-table-wrap">
        <table className="hs-table">
          <thead>
            <tr>
              <th>Tanggal/waktu</th>
              <th>Modul</th>
              <th>Parameter Utama</th>
              <th>Hasil</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tersaring.length === 0 ? (
              <tr>
                <td colSpan={5} className="hs-empty">Belum ada hasil simulasi.</td>
              </tr>
            ) : (
              tersaring.map((row) => (
                <tr key={row.id}>
                  <td>{formatWaktu(row.waktu)}</td>
                  <td>{row.modul}</td>
                  <td>{row.jenis} a={formatAngka(row.a)} Pc={formatAngka(row.pc, 1)} MPa</td>
                  <td>Laju bakar {formatAngka(row.hasil, 1)} mm/s</td>
                  <td>
                    <button type="button" className="hs-csv" onClick={() => unduhCSV(row)}>
                      Lihat CSV
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}