import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  nama,
  deleting,
  objek = 'akun admin',
}) {
  return (
    <Dialog
      open={open}
      onClose={deleting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}> Konfirmasi Hapus </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Yakin ingin menghapus {objek}{' '}
          {nama ? <strong>{nama}</strong> : 'ini'}?
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={deleting}
        >
          Batal
        </Button>

        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? 'Menghapus...' : 'Ya, Hapus'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDelete