import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Snackbar, Alert, AlertColor, SnackbarOrigin } from '@mui/material';

let root: Root | null = null;

interface SnackbarOptions {
  message: string;
  severity?: AlertColor; // "success" | "info" | "warning" | "error"
  duration?: number;
  position?: SnackbarOrigin;
}

export const showSnackbar = ({
  message,
  severity = 'info',
  duration = 3000,
  position = { vertical: 'bottom', horizontal: 'right' },
}: SnackbarOptions): void => {
  // Remove any previous snackbar container
  const existing = document.getElementById('global-snackbar');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'global-snackbar';
  document.body.appendChild(div);

  root = createRoot(div);

  const handleClose = () => {
    if (root) {
      root.unmount();
      div.remove();
    }
  };

  root.render(
    <Snackbar open={true} autoHideDuration={duration} onClose={handleClose} anchorOrigin={position}>
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>,
  );
};
