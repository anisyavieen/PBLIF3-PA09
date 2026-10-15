const STORAGE_KEY = 'mock_modul'

const DEFAULT_DATA = [
  {
    id: 1,
    nama: 'Laju bakar',
    deskripsi:
      'Simulasi pembakaran propelan roket dengan koefisien, tekanan, dan massa jenis.',
    status: 'aktif',
    jumlah_parameter: 5,
    jumlah_grup: 3,
  },
  {
    id: 2,
    nama: 'FTIR',
    deskripsi:
      'Simulasi analisis gugus fungsi dan struktur kimia berdasarkan spektrum inframerah.',
    status: 'nonaktif',
    jumlah_parameter: 0,
    jumlah_grup: 0,
  },
  {
    id: 3,
    nama: 'SEM-EDS',
    deskripsi:
      'Simulasi pengamatan struktur permukaan serta identifikasi unsur penyusun material.',
    status: 'nonaktif',
    jumlah_parameter: 0,
    jumlah_grup: 0,
  },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function readList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

function writeList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // abaikan jika penyimpanan penuh/diblokir
  }
}

export async function getModul() {
  await delay()
  return readList()
}

export async function createModul(payload) {
  await delay()
  const item = { id: Date.now(), jumlah_parameter: 0, jumlah_grup: 0, ...payload }
  writeList([...readList(), item])
  return item
}

export async function updateModul(id, payload) {
  await delay()
  writeList(readList().map((m) => (m.id === id ? { ...m, ...payload } : m)))
}

export async function deleteModul(id) {
  await delay()
  writeList(readList().filter((m) => m.id !== id))
}