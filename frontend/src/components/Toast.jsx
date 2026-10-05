import { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [state, setState] = useState(null);

  const toast = useCallback((message, severity = 'success') =>
    setState({ message, severity, key: Date.now() }), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Snackbar
        key={state?.key}
        open={!!state}
        autoHideDuration={2500}
        onClose={(_, reason) => reason !== 'clickaway' && setState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 8, md: 0 } }}
      >
        {state ? (
          <Alert
            severity={state.severity}
            variant="filled"
            onClose={() => setState(null)}
          >
            {state.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
