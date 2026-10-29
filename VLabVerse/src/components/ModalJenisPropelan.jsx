import { useEffect, useState } from 'react'
import { InputAdornment, TextField } from '@mui/material'
import ModalBase, { Field, inputSx } from './ModalBase'
import { batasiDesimal, rapikan } from './AturanParameter'

// initial = null  -> mode tambah
// initial = jenis -> mode ubah   (bentuk jenis: { id, name, vals: { [idParameter]: 'nilai' } })
// params   = daftar parameter dari grup "Parameter Propelan" (menentukan kolom isian, rentang, dan jumlah desimal)
// validasi = fungsi (nama, vals) => objek error, disediakan oleh halaman KelolaParameter
export default function ModalJenisPropelan({ open, initial, params, grupNama, validasi, onClose, onSave }) {
  const [name, setName] = useState('')
  const [vals, setVals] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setName(initial ? initial.name : '')
      setVals(initial ? { ...initial.vals } : {})
      setErrors({})
    }
  }, [open, initial])

  const handleSave = () => {
    // Rapikan tiap nilai sesuai jumlah desimal parameternya, baru divalidasi
    const rapi = { ...vals }
    for (const p of params) {
      const v = vals[p.id]
      if (v !== undefined && String(v).trim() !== '') rapi[p.id] = rapikan(v, p.dec)
    }
    const e = validasi(name, rapi)
    if (Object.keys(e).length > 0) {
      setVals(rapi)
      return setErrors(e)
    }
    onSave({ name: name.trim(), vals: rapi })
  }

  return (
    <ModalBase
      open={open}
      title={initial ? 'Ubah Jenis Propelan' : 'Tambah Jenis Propelan'}
      onClose={onClose}
      onSave={handleSave}
    >
      <p className="mf-desc">
        Nilai di bawah jadi angka awal slider saat pengguna memilih jenis ini. Pengguna tetap bisa menggesernya.
      </p>

      <Field id="jenis-nama" label="Nama jenis">
        <TextField
          id="jenis-nama"
          size="small"
          fullWidth
          autoFocus
          value={name}
          error={!!errors.name}
          helperText={errors.name || ''}
          onChange={(e) => {
            setErrors({ ...errors, name: undefined })
            setName(e.target.value)
          }}
          sx={inputSx}
        />
      </Field>

      <div className="mf-row">
        {params.map((p) => (
          <Field key={p.id} id={`jenis-${p.id}`} label={p.name}>
            <TextField
              id={`jenis-${p.id}`}
              size="small"
              fullWidth
              value={vals[p.id] || ''}
              error={!!errors[p.id]}
              helperText={errors[p.id] || ''}
              slotProps={{
                input: { endAdornment: p.unit ? <InputAdornment position="end">{p.unit}</InputAdornment> : null },
                htmlInput: { inputMode: 'decimal' },
              }}
              onChange={(e) => {
                setVals({ ...vals, [p.id]: batasiDesimal(e.target.value, p.dec) })
                setErrors({ ...errors, [p.id]: undefined })
              }}
              sx={inputSx}
            />
          </Field>
        ))}
      </div>

      <p className="mf-hint">
        Isian di atas mengikuti parameter di grup “{grupNama}”, termasuk jumlah desimalnya. Kosongkan kolom kalau ingin memakai nilai default grup.
      </p>
    </ModalBase>
  )
}