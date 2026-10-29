import { IconButton, TextField } from '@mui/material'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { batasiDesimal, rapikan } from './AturanParameter'

// Satu baris parameter: nama + satuan + keterangan, input min/default/maks, tombol ubah.
// Semua parameter adalah parameter bawaan yang dipakai rumus, jadi tidak ada tombol hapus.
// errors = hasil validasiBatas(param), contoh { max: 'Maks harus lebih besar dari min' }
// Style ada di KelolaParameter.css (kelas .kp-row, .kp-nums, ...)
// defOtomatis = true -> kolom Default terkunci karena mengikuti nilai jenis propelan pertama
//
// Isian min/default/maks dibatasi mengikuti jumlah desimal parameter (param.dec):
// saat mengetik angka desimal yang berlebih dibuang, saat selesai mengisi angkanya dirapikan.
export default function ParameterRow({ param, errors = {}, defOtomatis = false, onChange, onEdit }) {
  const angka = (label, key) => (
    <TextField
      size="small"
      className="kp-num"
      value={param[key]}
      error={!!errors[key]}
      disabled={key === 'def' && defOtomatis}
      onChange={(e) => onChange(key, batasiDesimal(e.target.value, param.dec))}
      onBlur={(e) => {
        const rapi = rapikan(e.target.value, param.dec)
        if (rapi !== param[key]) onChange(key, rapi)
      }}
      slotProps={{ htmlInput: { 'aria-label': label, inputMode: 'decimal' } }}
    />
  )

  const pesan = errors.min || errors.def || errors.max

  return (
    <div className="kp-row">
      <div className="kp-row-info">
        <div className="kp-row-name">
          {param.name}
          {param.unit && <span className="kp-row-unit">{param.unit}</span>}
        </div>
        <div className="kp-row-desc">{param.desc}</div>
      </div>
      <div className="kp-nums">
        {angka('Min', 'min')}
        {angka('Default', 'def')}
        {angka('Maks', 'max')}
      </div>
      <div className="kp-tools">
        <IconButton size="small" aria-label="Ubah parameter" onClick={onEdit}>
          <EditOutlined fontSize="small" />
        </IconButton>
      </div>
      {pesan && <div className="kp-row-error" role="alert">{pesan}</div>}
    </div>
  )
}