import { Snackbar, Alert as MuiAlert, AlertColor, styled } from '@mui/material';
import { create } from 'zustand';
import { AlertStateProps } from '@/core/types/commonTypes';

export const useAlertStore = create<AlertStateProps>((set) => ({
  open: false,
  message: '',
  type: 'info',
  showAlert: (message: string, type: AlertColor = 'info') =>
    set({ open: true, message, type }),
  hideAlert: () => set({ open: false }),
}));

const StyledAlert = styled(MuiAlert)({
  width: '100%',
});

export default function RcAlertComponent() {
  const { open, message, type, hideAlert } = useAlertStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideAlert}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <StyledAlert
        onClose={hideAlert}
        severity={type}
        variant="filled"
      >
        {message}
      </StyledAlert>
    </Snackbar>
  );
}