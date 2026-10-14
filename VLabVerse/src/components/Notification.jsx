
import { Alert, Snackbar } from '@mui/material'

function Notification({
  open,
  message,
  severity = 'success',
  onClose,
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') onClose()
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default Notification