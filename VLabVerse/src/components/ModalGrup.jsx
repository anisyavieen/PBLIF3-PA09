import { useEffect, useState } from 'react'
import { TextField } from '@mui/material'
import ModalBase, { Field, inputSx } from './ModalBase'

const KOSONG = { name: '', desc: '' }

// initial = null  -> mode tambah
// initial = grup  -> mode ubah
export default function ModalGrup({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(KOSONG)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name, desc: initial.desc } : KOSONG)
      setError(false)
    }
  }, [open, initial])

  const handleSave = () => {
    if (!form.name.trim()) return setError(true)
    onSave({ name: form.name.trim(), desc: form.desc })
  }

  return (
    <ModalBase
      open={open}
      title={initial ? 'Ubah Grup' : 'Tambah Grup Baru'}
      onClose={onClose}
      onSave={handleSave}
    >
      <Field id="grup-nama" label="Nama grup">
        <TextField
          id="grup-nama"
          size="small"
          fullWidth
          autoFocus
          value={form.name}
          error={error}
          helperText={error ? 'Nama wajib diisi' : ''}
          onChange={(e) => {
            setError(false)
            setForm({ ...form, name: e.target.value })
          }}
          sx={inputSx}
        />
      </Field>

      <Field id="grup-desc" label="Deskripsi singkat (opsional)">
        <TextField
          id="grup-desc"
          size="small"
          fullWidth
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          sx={inputSx}
        />
      </Field>
    </ModalBase>
  )
}