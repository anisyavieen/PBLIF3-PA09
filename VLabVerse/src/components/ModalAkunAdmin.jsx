import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useState } from 'react'

function ModalAkunAdmin({
  open,
  onClose,
  onSubmit,
  editId,
  form,
  onChange,
  saving,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false)

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '8px',
  }

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '5px',
      backgroundColor: '#fff',
    },
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '10px',
          padding: '8px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#0f172a',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        {editId ? 'Edit Akun Admin' : 'Tambah Akun Admin'}

        <IconButton onClick={onClose} disabled={saving}>
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent>
          {/* Nama Lengkap */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="nama-admin" style={labelStyle}>
              Nama Lengkap
            </label>

            <TextField
              id="nama-admin"
              name="nama"
              value={form.nama}
              onChange={onChange}
              placeholder="Masukkan nama lengkap"
              fullWidth
              required
              size="medium"
              sx={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email-admin" style={labelStyle}>
              Email
            </label>

            <TextField
              id="email-admin"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Masukkan email"
              fullWidth
              required
              size="medium"
              sx={inputStyle}
            />
          </div>

          {/* Password */}
            <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password-admin" style={labelStyle}>
                {editId ? 'Password Baru (opsional)' : 'Password'}
            </label>

            <div style={{ position: 'relative', width: '100%' }}>
                <TextField
                id="password-admin"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                placeholder={
                    editId
                    ? 'Kosongkan jika tidak ingin mengubah password'
                    : 'Masukkan password'
                }
                fullWidth
                required={!editId}
                size="medium"
                autoComplete="new-password"
                sx={{
                    ...inputStyle,
                    '& .MuiOutlinedInput-input': {
                    paddingRight: '52px',
                    },
                }}
                />

                <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: '#475569',
                    cursor: 'pointer',
                }}
                >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    {showPassword ? (
                    <>
                        <path d="M2 12s3.6-7 10-7c2.1 0 3.9.8 5.4 1.9" />
                        <path d="M22 12s-3.6 7-10 7c-2.1 0-3.9-.8-5.4-1.9" />
                        <path d="M3 3l18 18" />
                        <path d="M10 10a3 3 0 0 0 4 4" />
                    </>
                    ) : (
                    <>
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </>
                    )}
                </svg>
                </button>
            </div>

            {editId && (
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Kosongkan jika password tidak ingin diubah.
                </p>
            )}
            </div>

          {/* Status */}
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="status-admin" style={labelStyle}>
              Status Akun
            </label>

            <FormControl fullWidth sx={inputStyle}>
              <Select
                id="status-admin"
                name="status"
                value={form.status}
                onChange={onChange}
                displayEmpty
              >
                <MenuItem value="aktif">Aktif</MenuItem>
                <MenuItem value="nonaktif">Nonaktif</MenuItem>
              </Select>
            </FormControl>
          </div>

          {error && (
            <p
              style={{
                color: '#d32f2f',
                fontSize: '14px',
                marginTop: '12px',
              }}
            >
              {error}
            </p>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={saving}
            sx={{ borderRadius: '5px', textTransform: 'none' }}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ borderRadius: '5px', textTransform: 'none' }}
          >
            {saving
              ? 'Menyimpan...'
              : editId
                ? 'Simpan Perubahan'
                : 'Simpan Akun'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ModalAkunAdmin