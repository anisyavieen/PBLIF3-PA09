import { useEffect, useState } from 'react'
import { TextField } from '@mui/material'
import ModalBase, { Field, inputSx } from './ModalBase'
import { batasiDesimal, rapikan, KODE_BAWAAN } from './AturanParameter'

const KOSONG = { name: '', desc: '', min: '', def: '', max: '', unit: '', dec: '2' }

// initial  = null      -> mode tambah
// initial  = parameter -> mode ubah
// validasi = fungsi (form) => objek error, disediakan oleh halaman KelolaParameter
//
// Semua parameter adalah parameter bawaan yang dipakai rumus (punya `kode`):
// satuan ditampilkan sebagai info (terkunci), jumlah desimal tidak ditampilkan karena sudah tetap
// dan dipakai di balik layar untuk membatasi isian min/default/maks.
// jenisDefault = nama jenis propelan yang menentukan nilai Default parameter ini, atau null kalau tidak ada.
//   Kalau ada, kolom Default terkunci (nilainya mengikuti jenis, diubah lewat popup jenis propelan).
export default function ModalParameter({ open, initial, jenisDefault = null, validasi, onClose, onSave }) {
  const [form, setForm] = useState(KOSONG)
  const [errors, setErrors] = useState({})

  const tetap = initial?.kode ? KODE_BAWAAN[initial.kode] : null

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              desc: initial.desc,
              min: initial.min,
              def: initial.def,
              max: initial.max,
              unit: tetap ? tetap.satuan : initial.unit ?? '',
              dec: tetap ? tetap.desimal : initial.dec ?? '2',
            }
          : KOSONG
      )
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const ubah = (key) => (e) => {
    let v = e.target.value
    if (key === 'min' || key === 'def' || key === 'max') v = batasiDesimal(v, form.dec)
    setForm({ ...form, [key]: v })
    setErrors({ ...errors, [key]: undefined })
  }

  const handleSave = () => {
    const dec = tetap ? tetap.desimal : String(form.dec).trim()
    const decValid = /^[0-4]$/.test(dec)
    // Rapikan angka sesuai jumlah desimal dulu, baru divalidasi (pembulatan bisa mengubah urutan min < maks)
    const bersih = {
      ...form,
      name: form.name.trim(),
      unit: tetap ? tetap.satuan : form.unit.trim(),
      dec,
      ...(decValid
        ? { min: rapikan(form.min, dec), def: rapikan(form.def, dec), max: rapikan(form.max, dec) }
        : {}),
    }
    const e = validasi(bersih)
    if (jenisDefault && e.def) e.def = `Nilai jenis ${jenisDefault} di luar rentang min – maks.`
    if (Object.keys(e).length > 0) {
      setForm(bersih)
      return setErrors(e)
    }
    onSave(bersih)
  }

  const kolom = (id, label, key, extra) => {
    const dikunci = (!!tetap && key === 'unit') || (key === 'def' && !!jenisDefault)
    // Satuan kosong (parameter tanpa satuan) ditampilkan sebagai "Tanpa satuan"; isi datanya tetap kosong
    const tampil = key === 'unit' && dikunci && !form.unit ? 'Tanpa satuan' : form[key]
    return (
      <Field id={id} label={label}>
        <TextField
          id={id}
          size="small"
          fullWidth
          value={tampil}
          onChange={ubah(key)}
          error={!!errors[key]}
          helperText={errors[key] || (dikunci && key === 'unit' ? 'Terkunci, dipakai rumus' : '')}
          disabled={dikunci}
          sx={inputSx}
          {...extra}
        />
      </Field>
    )
  }

  return (
    <ModalBase
      open={open}
      title={initial ? 'Ubah Parameter' : 'Tambah Parameter'}
      onClose={onClose}
      onSave={handleSave}
    >
      {kolom('param-nama', 'Nama parameter', 'name', { autoFocus: true })}

      {/* Tiga kolom angka sebaris; kalau popup terlalu sempit (layar kecil) turun jadi 2 + 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
        {kolom('param-min', 'Min', 'min', { slotProps: { htmlInput: { inputMode: 'decimal' } } })}
        {kolom('param-def', 'Default', 'def', { slotProps: { htmlInput: { inputMode: 'decimal' } } })}
        {kolom('param-max', 'Maks', 'max', { slotProps: { htmlInput: { inputMode: 'decimal' } } })}
      </div>
      {jenisDefault && (
        <p className="mf-hint">
          Default terkunci karena mengikuti nilai jenis {jenisDefault}. Ubah lewat popup jenis propelan.
        </p>
      )}

      {kolom('param-unit', 'Satuan', 'unit')}

      {kolom('param-desc', 'Keterangan singkat', 'desc', { multiline: true, minRows: 2 })}
    </ModalBase>
  )
}