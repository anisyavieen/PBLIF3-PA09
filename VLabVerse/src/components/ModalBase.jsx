import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import './ModalForm.css'

// Gaya input disamakan dengan ModalAkunAdmin
export const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' },
}

// Label di atas input
export function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mf-label">{label}</label>
      {children}
    </div>
  )
}

// Cangkang popup: judul, isi, tombol Batal & Simpan perubahan.
// Dibungkus <form> supaya tombol Enter juga menyimpan.
export default function ModalBase({ open, title, onClose, onSave, children }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  const btnSx = { borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }
  const biruSx = { ...btnSx, bgcolor: '#2557e8', '&:hover': { bgcolor: '#1e47c4' } }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '10px', padding: '8px' } } }}
    >
      <DialogTitle className="mf-title">{title}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="mf-body">{children}</div>
        </DialogContent>

        <DialogActions className="mf-actions">
          <Button variant="outlined" color="inherit" onClick={onClose} sx={btnSx}>
            Batal
          </Button>
          <Button type="submit" variant="contained" sx={biruSx}>
            Simpan perubahan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}