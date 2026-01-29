import { useAlertStore } from './Alert';
import { type AlertColor } from '@mui/material';

const show = (message: string, type: AlertColor = 'info') => {
  useAlertStore.getState().showAlert(message, type);
};

const alertUtils = {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  info: (message: string) => show(message, 'info'),
  warning: (message: string) => show(message, 'warning'),
};

export default alertUtils;