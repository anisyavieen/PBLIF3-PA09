// Aturan angka & parameter bawaan untuk fitur Kelola Parameter.
// Dipakai bersama oleh KelolaParameter, ModalParameter, ParameterRow, dan ModalJenisPropelan.
//
// Bagian 1: helper angka. Pemisah desimal yang diterima titik atau koma;
//           hasil rapikan() selalu memakai koma (sama seperti data yang sudah ada, mis. '0,35').
// Bagian 2: parameter bawaan dengan kode tetap.

/* =====================================================================
   Bagian 1 — Helper angka
   ===================================================================== */
export const isAngka = (s) => /^-?\d+([.,]\d+)?$/.test(String(s ?? '').trim())
export const keAngka = (s) => parseFloat(String(s ?? '').trim().replace(',', '.'))

// Ubah isian "jumlah desimal" (string) jadi angka. Kalau tidak valid, pakai 2 (bawaan form).
export function desimalDari(dec) {
  const d = parseInt(String(dec ?? '').trim(), 10)
  return Number.isInteger(d) && d >= 0 ? d : 2
}

// Dipakai saat mengetik: buang karakter selain angka, minus (hanya di depan), dan satu pemisah desimal,
// lalu potong angka desimal yang melebihi batas. dec = 0 -> pemisah tidak boleh diketik.
export function batasiDesimal(value, dec) {
  const d = desimalDari(dec)
  let s = String(value ?? '').replace(/[^\d.,-]/g, '')
  const minus = s.startsWith('-') ? '-' : ''
  s = s.replace(/-/g, '')
  const i = s.search(/[.,]/)
  if (i === -1) return minus + s
  const bulat = s.slice(0, i)
  if (d === 0) return minus + bulat
  const pecahan = s.slice(i + 1).replace(/[.,]/g, '').slice(0, d)
  return `${minus}${bulat}${s[i]}${pecahan}`
}

// Dipakai saat selesai mengisi (blur) / saat simpan: samakan jumlah desimalnya. '5' dengan dec 2 -> '5,00'.
// Kalau isinya bukan angka, dikembalikan apa adanya (biar ditangkap validasi).
export function rapikan(value, dec) {
  if (!isAngka(value)) return value
  const hasil = keAngka(value).toFixed(desimalDari(dec)).replace('.', ',')
  return hasil.replace(/^-(0(,0+)?)$/, '$1') // hindari "-0,00"
}

/* =====================================================================
   Bagian 2 — Parameter bawaan
   Tiap parameter bawaan punya KODE TETAP (disimpan di field `kode`), jadi perhitungan tidak lagi
   bergantung pada nama maupun urutan parameter. Satuan dan jumlah desimalnya terkunci,
   karena rumus mengharapkan satuan ini: Pc dalam MPa, Ab dalam cm², Wb dalam mm, ρ dalam kg/m³.
   Keenamnya wajib ada: tidak bisa dihapus, dan kalau hilang dari data lama akan dipulihkan.
   ===================================================================== */
export const KODE_BAWAAN = {
  a: { satuan: '', desimal: '2' },
  n: { satuan: '', desimal: '3' },
  rho: { satuan: 'kg/m³', desimal: '0' },
  pc: { satuan: 'MPa', desimal: '1' },
  ab: { satuan: 'cm²', desimal: '0' },
  wb: { satuan: 'mm', desimal: '1' },
}

// Isian awal tiap parameter bawaan (dipakai saat data pertama kali dibuat atau saat parameter dipulihkan).
// grup = urutan grup tempatnya (0 = Parameter Propelan, 1 = Kondisi Pembakaran).
const NAMA_GRUP = ['Parameter Propelan', 'Kondisi Pembakaran']
const PARAM_BAWAAN = {
  a: { grup: 0, name: 'Koefisien laju bakar (a)', desc: 'Satuan mm/s per MPa^n. Makin besar, propelan terbakar makin cepat.', min: '0', def: '5', max: '20' },
  n: { grup: 0, name: 'Eksponen tekanan (n)', desc: 'Makin besar, laju bakar makin sensitif terhadap perubahan tekanan.', min: '0', def: '0,35', max: '1' },
  rho: { grup: 0, name: 'Massa jenis (ρ)', desc: 'Makin besar, laju aliran massa dan massa terbakar makin besar.', min: '1000', def: '1750', max: '2200' },
  pc: { grup: 1, name: 'Tekanan ruang bakar (Pc)', desc: 'Dianggap tetap selama pembakaran. Makin tinggi, laju bakar makin cepat.', min: '0,1', def: '6', max: '10' },
  ab: { grup: 1, name: 'Luas permukaan bakar (Ab)', desc: 'Makin luas, gas yang dihasilkan tiap detik makin banyak.', min: '1', def: '100', max: '200' },
  wb: { grup: 1, name: 'Ketebalan web (Wb)', desc: 'Jarak yang harus dibakar sampai propelan habis. Makin tebal, waktu bakar makin lama.', min: '5', def: '12,5', max: '60' },
}

// Data lama belum punya `kode`. Dikenali dalam dua tahap, tiap kode hanya diberikan ke satu parameter:
// 1) simbol di akhir nama, mis. "Koefisien laju bakar (a)"
// 2) kalau nama sudah diubah dan simbolnya hilang, lewat kata kunci di nama, mis. "web" atau "tebal" untuk Wb
const KODE_DARI_SIMBOL = { a: 'a', n: 'n', 'ρ': 'rho', rho: 'rho', pc: 'pc', ab: 'ab', wb: 'wb' }
const KATA_KUNCI = [
  ['a', 'koefisien'], ['n', 'eksponen'], ['rho', 'massa jenis'],
  ['pc', 'tekanan'], ['ab', 'luas'], ['wb', 'web'], ['wb', 'tebal'],
]

const dariSimbol = (nama) => {
  const m = nama.match(/\(\s*([^()\s]+)\s*\)\s*$/)
  return m ? KODE_DARI_SIMBOL[m[1].toLowerCase()] : undefined
}
const dariKataKunci = (nama) => {
  const kecil = nama.toLowerCase()
  const hit = KATA_KUNCI.find(([, kata]) => kecil.includes(kata))
  return hit ? hit[0] : undefined
}

export function tandaiKode(groups) {
  const terpakai = new Set()
  groups.forEach((g) => (g.params || []).forEach((p) => p.kode && terpakai.add(p.kode)))
  const tahap = (cari) => (gs) => gs.map((g) => ({
    ...g,
    params: (g.params || []).map((p) => {
      if (p.kode) return p
      const kode = cari(String(p.name ?? ''))
      if (!kode || terpakai.has(kode)) return p
      terpakai.add(kode)
      return { ...p, kode }
    }),
  }))
  return tahap(dariKataKunci)(tahap(dariSimbol)(groups))
}

// Satu parameter: paksa satuan & desimal bawaan, lalu rapikan min/default/maks sesuai jumlah desimalnya.
export function lengkapiParam(p) {
  const tetap = p.kode ? KODE_BAWAAN[p.kode] : null
  const unit = tetap ? tetap.satuan : p.unit ?? ''
  const dec = tetap ? tetap.desimal : String(p.dec ?? '2')
  return { ...p, unit, dec, min: rapikan(p.min, dec), def: rapikan(p.def, dec), max: rapikan(p.max, dec) }
}

// Seluruh data: semua parameter dilengkapi, nilai tiap jenis propelan ikut dirapikan
// sesuai jumlah desimal parameternya.
export function normalisasiData(groups, types) {
  const g2 = groups.map((g) => ({ ...g, params: (g.params || []).map(lengkapiParam) }))
  const dec = {}
  g2.forEach((g) => g.params.forEach((p) => { dec[p.id] = p.dec }))
  const t2 = types.map((t) => {
    const vals = {}
    for (const [id, v] of Object.entries(t.vals || {})) {
      vals[id] = dec[id] !== undefined && String(v ?? '').trim() !== '' ? rapikan(v, dec[id]) : v
    }
    return { ...t, vals }
  })
  return { groups: g2, types: t2 }
}

// Menyiapkan data yang dimuat (atau data kosong untuk pertama kali):
// 1) beri kode ke parameter bawaan, 2) buang parameter di luar rumus (dan grup yang jadi kosong),
// 3) pulihkan parameter bawaan yang hilang, 4) kunci satuan & desimal lalu rapikan angkanya.
// buatId = fungsi pembuat id baru. Panggil siapkanData([], types, buatId) untuk data awal.
export function siapkanData(groups, types, buatId) {
  let g = tandaiKode(groups)
    .map((gr) => ({ ...gr, params: (gr.params || []).filter((p) => p.kode) }))
    .filter((gr) => gr.params.length > 0)

  const ada = new Set(g.flatMap((gr) => gr.params.map((p) => p.kode)))
  for (const kode of Object.keys(PARAM_BAWAAN)) {
    if (ada.has(kode)) continue
    const { grup, ...isi } = PARAM_BAWAAN[kode]
    while (g.length <= grup) {
      g = [...g, { id: buatId(), name: NAMA_GRUP[g.length] ?? 'Grup Parameter', desc: '', params: [] }]
    }
    const baru = { id: buatId(), kode, ...isi }
    g = g.map((gr, i) => (i === grup ? { ...gr, params: [...gr.params, baru] } : gr))
  }
  return normalisasiData(g, types)
}

// Untuk halaman Uji Coba: ambil parameter lewat kode, bukan urutan.
//   const p = ambilByKode(data.groups)
//   p.pc.def  // nilai default tekanan ruang bakar
export function ambilByKode(groups) {
  const hasil = {}
  groups.forEach((g) => (g.params || []).forEach((p) => { if (p.kode) hasil[p.kode] = p }))
  return hasil
}