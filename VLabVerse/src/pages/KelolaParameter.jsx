import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, IconButton, MenuItem, Select } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlined from '@mui/icons-material/EditOutlined'

import ParameterRow from '../components/ParameterRow'
import ModalJenisPropelan from '../components/ModalJenisPropelan'
import ModalParameter from '../components/ModalParameter'
import ModalGrup from '../components/ModalGrup'
import ConfirmDelete from '../components/ConfirmDelete'
import Notification from '../components/Notification'
import { isAngka, keAngka, rapikan, KODE_BAWAAN, normalisasiData, siapkanData } from '../components/AturanParameter'
import './KelolaParameter.css'

// Route: /dashboard/modul/:id/kelola  (id modul bisa diambil dengan useParams saat sudah tersambung ke API)
const PATH_DAFTAR_MODUL = '/dashboard/modul'

/* =====================================================================
   Penyimpanan sementara (testing) — nanti diganti API backend.
   Kunci yang sama dibaca oleh halaman UjiCoba.jsx
   ===================================================================== */
const STORAGE_KEY = 'vlab_laju_bakar'
const DESC_LAMA = ['Geser untuk menetapkan nilai default.', 'Tetapkan nilai default dan batas']

function muatData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!d || !Array.isArray(d.groups)) return null
    const groups = d.groups.map((g) => ({
      ...g,
      desc: DESC_LAMA.some((t) => (g.desc || '').startsWith(t)) ? '' : g.desc || '',
      params: g.params || [],
    }))
    const types = Array.isArray(d.types) ? d.types.map((t) => ({ ...t, vals: t.vals || {} })) : []
    // Data lama: beri kode ke parameter bawaan, buang parameter di luar rumus, pulihkan yang hilang,
    // kunci satuan & desimalnya, rapikan angkanya
    return { ...siapkanData(groups, types, newId), status: d.status || 'Aktif' }
  } catch {
    return null
  }
}

function simpanData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* =====================================================================
   Validasi
   ===================================================================== */
const NAMA_KOLOM = { min: 'Min', def: 'Default', max: 'Maks' }

// Hasil: objek error, misalnya { max: 'Maks harus lebih besar dari min' }. Kosong = valid.
function validasiBatas({ min, def, max }) {
  const err = {}
  const isi = { min, def, max }
  for (const k of ['min', 'def', 'max']) {
    if (String(isi[k] ?? '').trim() === '') err[k] = `${NAMA_KOLOM[k]} wajib diisi`
    else if (!isAngka(isi[k])) err[k] = `${NAMA_KOLOM[k]} harus berupa angka`
  }
  const okMin = isAngka(min)
  const okMax = isAngka(max)
  const okDef = isAngka(def)
  if (okMin && okMax && keAngka(min) >= keAngka(max)) err.max = 'Maks harus lebih besar dari min'
  if (okDef && okMin && keAngka(def) < keAngka(min)) err.def = 'Default tidak boleh kurang dari min'
  else if (okDef && okMax && keAngka(def) > keAngka(max)) err.def = 'Default tidak boleh lebih dari maks'
  return err
}

// Popup jenis propelan: hanya cek nama & bentuk angka. Kecocokan dengan rentang dicek saat simpan halaman.
function validasiFormJenis(name, vals, params) {
  const e = {}
  for (const p of params) {
    const v = vals?.[p.id]
    if (v === undefined || String(v).trim() === '') continue
    if (!isAngka(v)) e[p.id] = 'Harus berupa angka'
  }
  if (!name.trim()) e.name = 'Nama wajib diisi'
  return e
}

// Validasi isian popup parameter
function validasiFormParam(form) {
  const e = { ...validasiBatas(form) }
  if (!form.name.trim()) e.name = 'Nama wajib diisi'
  return e
}

// Cek seluruh data sebelum disimpan. Hasil: pesan error pertama, atau '' kalau aman.
function cariError(groups, types) {
  // 1) Nilai tiap jenis propelan harus berada di dalam rentang slider grup pertama
  const utama = groups[0]
  if (utama) {
    for (const t of types) {
      for (const p of utama.params) {
        const v = t.vals?.[p.id]
        if (v === undefined || String(v).trim() === '') continue
        if (!isAngka(v)) return `Jenis ${t.name}: ${p.name} harus berupa angka`
        const n = keAngka(v)
        if (n < keAngka(p.min) || n > keAngka(p.max)) {
          return `Jenis ${t.name}: ${p.name} (${v}) di luar rentang ${p.min} – ${p.max}. Sesuaikan rentang parameter atau nilai jenis.`
        }
      }
    }
  }
  // 2) Batas min / default / maks tiap parameter
  for (const g of groups) {
    for (const p of g.params) {
      const e = validasiBatas(p)
      const pesan = e.min || e.def || e.max
      if (pesan) return `${p.name}: ${pesan}`
    }
  }
  return ''
}

// Default grup pertama mengikuti nilai sebuah jenis propelan (kalau nilainya sudah diisi di popup jenis).
const punyaNilai = (jenis, p) => !!jenis && String(jenis.vals?.[p.id] ?? '').trim() !== ''

function terapkanDefault(groups, jenis) {
  if (!jenis) return groups
  return groups.map((g, gi) => (gi !== 0 ? g : {
    ...g,
    params: g.params.map((p) => (punyaNilai(jenis, p) ? { ...p, def: jenis.vals[p.id] } : p)),
  }))
}

/* =====================================================================
   Data awal (dipakai kalau belum pernah disimpan)
   Enam parameter bawaan (kode a, n, rho, pc, ab, wb) dibuat oleh siapkanData() di
   components/aturanParameter.jsx, lengkap dengan satuan & desimal tetapnya.
   ===================================================================== */
let seq = 0
const newId = () => Date.now() * 1000 + (seq++ % 1000)

const DATA_JENIS = [
  { id: 1, name: 'KNSB', vals: {} },
  { id: 2, name: 'APCP', vals: {} },
]

/* =====================================================================
   Halaman
   ===================================================================== */
export default function KelolaParameter() {
  const navigate = useNavigate()

  // Data awal: dari penyimpanan kalau ada, kalau tidak pakai data bawaan di atas
  const [awal] = useState(() => muatData() || { ...siapkanData([], DATA_JENIS, newId), status: 'Aktif' })
  const [groups, setGroups] = useState(awal.groups)
  const [types, setTypes] = useState(awal.types)
  const [status, setStatus] = useState(awal.status)
  const [jenisAktifId, setJenisAktifId] = useState(awal.types[0]?.id ?? null)
  const jenisAktif = types.find((t) => t.id === jenisAktifId) || types[0] || null // jenis yang sedang diatur
  const [baseline, setBaseline] = useState(() => JSON.stringify({
    groups: terapkanDefault(awal.groups, awal.types[0]), types: awal.types, status: awal.status,
  }))
  // Data yang disimpan: default mengikuti jenis pertama (patokan tetap)
  const groupsView = terapkanDefault(groups, types[0])
  // Tampilan: default mengikuti jenis yang sedang aktif
  const groupsTampil = terapkanDefault(groups, jenisAktif)
  const dirty = JSON.stringify({ groups: groupsView, types, status }) !== baseline

  const [notice, setNotice] = useState(null)
  const notify = (message, type = 'success') => setNotice({ type, message })

  // dlg = popup tambah/ubah yang terbuka:
  // { kind: 'jenis' | 'param' | 'grup', gid?: idGrup, item: objek yang diubah | null (kalau tambah) }
  const [dlg, setDlg] = useState(null)
  const tutup = () => setDlg(null)

  // hapus = data yang menunggu konfirmasi hapus: { buka, kind, id, gid?, objek }
  const [hapus, setHapus] = useState(null)

  const grupPropelan = groups[0] // isian popup jenis mengikuti grup pertama

  /* ---------- Simpan seluruh halaman ---------- */
  const simpanSemua = () => {
    // Rapikan dulu (jumlah desimal tiap parameter), baru dicek
    const norm = normalisasiData(groupsView, types)
    const pesan = cariError(norm.groups, norm.types)
    if (pesan) return notify(pesan, 'error')
    const data = { groups: norm.groups, types: norm.types, status }
    simpanData(data) // TODO: ganti dengan panggilan API
    setGroups(norm.groups)
    setTypes(norm.types)
    setBaseline(JSON.stringify(data))
    notify('Perubahan modul berhasil disimpan.')
  }

  /* ---------- Jenis propelan ---------- */
  const simpanJenis = ({ name, vals }) => {
    const { item } = dlg
    const idBaru = newId()
    setTypes((ts) => item
      ? ts.map((t) => (t.id === item.id ? { ...t, name, vals } : t))
      : [...ts, { id: idBaru, name, vals }])
    setJenisAktifId(item ? item.id : idBaru)
    tutup()
    notify(item ? 'Jenis propelan berhasil diperbarui.' : 'Jenis propelan berhasil ditambahkan.')
  }

  /* ---------- Grup (hanya nama & keterangan yang bisa diubah; grup tidak bisa dihapus) ---------- */
  const simpanGrup = ({ name, desc }) => {
    const { item } = dlg
    setGroups((gs) => gs.map((g) => (g.id === item.id ? { ...g, name, desc } : g)))
    tutup()
    notify('Grup berhasil diperbarui.')
  }

  /* ---------- Parameter (semuanya parameter bawaan: hanya bisa diubah, tidak bisa ditambah/dihapus) ---------- */
  const simpanParam = (form) => {
    const { gid, item } = dlg
    // Satuan & desimal selalu dikembalikan ke nilai tetap (kode tidak pernah berubah)
    const tetap = KODE_BAWAAN[item.kode]
    const data = tetap ? { ...form, unit: tetap.satuan, dec: tetap.desimal } : form
    setGroups((gs) => gs.map((g) => (g.id !== gid ? g : {
      ...g,
      params: g.params.map((p) => (p.id === item.id ? { ...p, ...data } : p)),
    })))
    // Nilai tiap jenis propelan untuk parameter ini ikut dirapikan
    setTypes((ts) => ts.map((t) => {
      const v = t.vals?.[item.id]
      if (v === undefined || String(v).trim() === '') return t
      return { ...t, vals: { ...t.vals, [item.id]: rapikan(v, data.dec) } }
    }))
    tutup()
    notify('Parameter berhasil diperbarui.')
  }
  const ubahNilai = (gid, pid, key, value) => {
    setGroups((gs) => gs.map((g) => (g.id !== gid ? g : {
      ...g,
      params: g.params.map((p) => (p.id === pid ? { ...p, [key]: value } : p)),
    })))
  }

  /* ---------- Hapus jenis propelan (setelah konfirmasi) ---------- */
  const konfirmasiHapus = () => {
    const { id, objek } = hapus
    setTypes((ts) => ts.filter((t) => t.id !== id))
    setHapus((h) => ({ ...h, buka: false }))
    notify(`${objek.charAt(0).toUpperCase()}${objek.slice(1)} berhasil dihapus.`)
  }

  return (
    <>
      <div className="kp-page">
        {/* Header */}
        <div className="kp-head">
          <div>
            <h1 className="kp-title">Laju Bakar</h1>
            <p className="kp-sub">
              Atur nilai default dan batas tiap parameter. Nilai ini yang akan muncul sebagai slider awal di simulator publik.
            </p>
          </div>
          <label className="kp-status">
            Status modul:
            <Select
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`kp-pill ${status === 'Aktif' ? 'kp-pill-on' : 'kp-pill-off'}`}
              renderValue={(v) => `• ${v}`}
            >
              <MenuItem value="Aktif">Aktif</MenuItem>
              <MenuItem value="Nonaktif">Nonaktif</MenuItem>
            </Select>
          </label>
        </div>

        {/* Jenis propelan */}
        <section className="kp-card">
          <h2 className="kp-card-title">Jenis propelan tersedia</h2>
          <p className="kp-card-desc">
            Tiap jenis menyimpan nilai awal slider. Klik nama jenis untuk memilih dan mengubah nilainya. Jenis yang dipilih (biru) menentukan nilai default di grup Parameter Propelan di bawah.
          </p>
          <div className="kp-chips">
            {types.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                color={t.id === jenisAktif?.id ? 'primary' : 'default'}
                variant={t.id === jenisAktif?.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }}
                onClick={() => { setJenisAktifId(t.id); setDlg({ kind: 'jenis', item: t }) }}
                onDelete={() => setHapus({ buka: true, kind: 'jenis', id: t.id, objek: 'jenis propelan' })}
              />
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDlg({ kind: 'jenis', item: null })}>
              Tambah jenis
            </Button>
          </div>
        </section>

        {/* Grup parameter */}
        {groupsTampil.map((g, gi) => (
          <section className="kp-card" key={g.id}>
            <div className="kp-card-head">
              <h2 className="kp-card-title">
                {g.name}
                {gi === 0 && jenisAktif && <span className="kp-jenis-badge">Jenis: {jenisAktif.name}</span>}
              </h2>
              <div>
                <IconButton size="small" aria-label="Ubah grup" onClick={() => setDlg({ kind: 'grup', item: g })}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              </div>
            </div>
            {g.desc && <p className="kp-card-desc">{g.desc}</p>}
            <p className="kp-card-hint">
              Tetapkan nilai default dan batas min/maks yang bisa diatur pengguna di simulasi.
            </p>
            {gi === 0 && jenisAktif && (
              <p className="kp-card-hint">
                Kolom default menampilkan nilai jenis <b>{jenisAktif.name}</b>. Klik jenis lain di atas untuk berganti.
              </p>
            )}

            <div className="kp-cols">
              <span className="kp-cols-name">Parameter</span>
              <div className="kp-cols-nums"><span>Min</span><span>Default</span><span>Maks</span></div>
              <div className="kp-cols-tools" />
            </div>

            {g.params.map((p) => {
              const otomatis = gi === 0 && punyaNilai(jenisAktif, p)
              const err = validasiBatas(p)
              if (otomatis && err.def) err.def = `Nilai jenis ${jenisAktif.name} di luar rentang min – maks.`
              return (
                <ParameterRow
                  key={p.id}
                  param={p}
                  errors={err}
                  defOtomatis={otomatis}
                  onChange={(key, value) => ubahNilai(g.id, p.id, key, value)}
                  onEdit={() => setDlg({ kind: 'param', gid: g.id, item: p })}
                />
              )
            })}
          </section>
        ))}

        {/* Footer */}
        <div className="kp-footer">
          <Button className="kp-back" variant="contained" onClick={() => navigate(PATH_DAFTAR_MODUL)}>
            Kembali ke daftar modul
          </Button>
          <div className="kp-footer-right">
            {dirty && <span className="kp-dirty">Ada perubahan yang belum disimpan</span>}
            <Button className="kp-cancel" variant="outlined" onClick={() => navigate(PATH_DAFTAR_MODUL)}>Batal</Button>
            <Button variant="contained" onClick={simpanSemua}>Simpan perubahan</Button>
          </div>
        </div>
      </div>

      {/* Popup tambah / ubah */}
      <ModalJenisPropelan
        open={dlg?.kind === 'jenis'}
        initial={dlg?.kind === 'jenis' ? dlg.item : null}
        params={grupPropelan ? grupPropelan.params : []}
        grupNama={grupPropelan ? grupPropelan.name : ''}
        validasi={(name, vals) => validasiFormJenis(name, vals, grupPropelan ? grupPropelan.params : [])}
        onClose={tutup}
        onSave={simpanJenis}
      />
      <ModalParameter
        open={dlg?.kind === 'param'}
        initial={dlg?.kind === 'param' ? dlg.item : null}
        jenisDefault={
          dlg?.kind === 'param' && groups[0]?.id === dlg.gid && punyaNilai(jenisAktif, dlg.item)
            ? jenisAktif.name
            : null
        }
        validasi={validasiFormParam}
        onClose={tutup}
        onSave={simpanParam}
      />
      <ModalGrup
        open={dlg?.kind === 'grup'}
        initial={dlg?.kind === 'grup' ? dlg.item : null}
        onClose={tutup}
        onSave={simpanGrup}
      />

      {/* Konfirmasi hapus & notifikasi (komponen milik proyek) */}
      <ConfirmDelete
        open={Boolean(hapus?.buka)}
        onClose={() => setHapus((h) => ({ ...h, buka: false }))}
        onConfirm={konfirmasiHapus}
        objek={hapus?.objek}
      />
      <Notification
        open={Boolean(notice)}
        message={notice?.message || ''}
        severity={notice?.type || 'success'}
        onClose={() => setNotice(null)}
      />
    </>
  )
}