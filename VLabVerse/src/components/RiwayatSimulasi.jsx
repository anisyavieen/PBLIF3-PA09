const STORAGE_KEY = 'vlab_hasil_simulasi'

// Panggil fungsi ini setiap simulasi selesai dijalankan di UjiCoba.jsx
export function simpanHasilSimulasi({ modul, jenis, a, n, rho, pc, ab, wb, hasil }) {
  try {
    const lama = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const daftar = Array.isArray(lama) ? lama : []
    daftar.push({
      id: Date.now(),
      waktu: new Date().toISOString(),
      modul, jenis, a, n, rho, pc, ab, wb, hasil,
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftar))
  } catch {
    /* abaikan kalau penyimpanan penuh atau diblokir */
  }
}