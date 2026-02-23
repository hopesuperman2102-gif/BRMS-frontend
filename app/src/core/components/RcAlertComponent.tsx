import { Snackbar, Alert as MuiAlert, AlertColor } from '@mui/material';
import { create } from 'zustand';
import { AlertStateProps } from '../types/commonTypes';

export const useAlertStore = create<AlertStateProps>((set) => ({
  open: false,
  message: '',
  type: 'info',
  showAlert: (message: string, type: AlertColor = 'info') =>
    set({ open: true, message, type }),
  hideAlert: () => set({ open: false }),
}));

export default function RcAlertComponent() {
  const { open, message, type, hideAlert } = useAlertStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideAlert}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        onClose={hideAlert}
        severity={type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
}