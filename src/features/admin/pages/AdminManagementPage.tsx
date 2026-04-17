import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  PersonAdd,
  LockReset,
  ToggleOn,
  ToggleOff,
  AdminPanelSettings,
  VpnKey,
} from '@mui/icons-material';
import { showSnackbar } from '@components/snackbarUtils';
import {
  useListAdminsQuery,
  useCreateAdminMutation,
  useToggleAdminStatusMutation,
  useResetAdminPasswordMutation,
  useSetAdminAccessCodeMutation,
  type AdminUser,
} from '@features/admin/api/adminManagementApi';
import { useAppSelector } from '@app/hooks';

const AdminManagementPage: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.role === 'ROLE_SUPER_ADMIN';

  const {
    data: admins = [],
    isLoading,
    isError,
  } = useListAdminsQuery(undefined, {
    skip: !isSuperAdmin,
  });
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [toggleStatus] = useToggleAdminStatusMutation();
  const [resetPassword] = useResetAdminPasswordMutation();
  const [setAdminAccessCode, { isLoading: isSavingAccessCode }] = useSetAdminAccessCodeMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ email: '', name: '' });
  const [formError, setFormError] = useState('');
  const [accessCodeDialogOpen, setAccessCodeDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  const handleCreateSubmit = async () => {
    setFormError('');
    if (!form.email || !form.name) {
      setFormError('Email and name are required.');
      return;
    }

    try {
      await createAdmin(form).unwrap();
      showSnackbar({
        message: 'Admin created. Setup email sent to their inbox.',
        severity: 'success',
      });
      setDialogOpen(false);
      setForm({ email: '', name: '' });
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || 'Failed to create admin.');
    }
  };

  const handleToggle = async (admin: AdminUser) => {
    if (admin.id === currentUser?.id) {
      showSnackbar({ message: 'You cannot disable your own account.', severity: 'warning' });
      return;
    }

    try {
      const updated = await toggleStatus(admin.id).unwrap();
      showSnackbar({
        message: `${updated.email} has been ${updated.enabled ? 'enabled' : 'disabled'}.`,
        severity: 'info',
      });
    } catch (err: any) {
      showSnackbar({
        message: err?.data?.message || 'Failed to update status.',
        severity: 'error',
      });
    }
  };

  const handleResetPassword = async (admin: AdminUser) => {
    if (!window.confirm(`Send a new Firebase reset link to ${admin.email}?`)) {
      return;
    }

    try {
      await resetPassword(admin.id).unwrap();
      showSnackbar({ message: 'Password reset email sent to admin inbox.', severity: 'success' });
    } catch (err: any) {
      showSnackbar({
        message: err?.data?.message || err?.message || 'Failed to reset password.',
        severity: 'error',
      });
    }
  };

  const openAccessCodeDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAccessCode('');
    setAccessCodeError('');
    setAccessCodeDialogOpen(true);
  };

  const handleAccessCodeSubmit = async () => {
    if (!selectedAdmin) {
      return;
    }

    if (!/^\d{6}$/.test(accessCode)) {
      setAccessCodeError('Access code must be exactly 6 digits.');
      return;
    }

    try {
      const updated = await setAdminAccessCode({
        id: selectedAdmin.id,
        code: accessCode,
      }).unwrap();
      showSnackbar({
        message: `Access code saved for ${updated.email}.`,
        severity: 'success',
      });
      setAccessCodeDialogOpen(false);
      setSelectedAdmin(null);
      setAccessCode('');
    } catch (err: any) {
      setAccessCodeError(err?.data?.message || err?.message || 'Failed to save access code.');
    }
  };

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  if (!isSuperAdmin) {
    return (
      <Box p={3}>
        <Alert severity="error">Only the super admin can manage admin access.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AdminPanelSettings sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Admin Access Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Super admin controls every admin account, password resets, and the 6-digit access code
              required after admin login.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Add Admin
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">Failed to load admin accounts.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'var(--color-surface)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Setup Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Access Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.name || '-'}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      color={admin.role === 'ROLE_SUPER_ADMIN' ? 'secondary' : 'primary'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.enabled ? 'Active' : 'Disabled'}
                      color={admin.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {admin.mustChangePassword ? (
                      <Chip label="Setup pending" color="warning" size="small" />
                    ) : (
                      <Chip label="Ready" color="success" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    {admin.role === 'ROLE_SUPER_ADMIN' ? (
                      <Chip label="Not required" size="small" variant="outlined" />
                    ) : admin.hasAdminAccessCode ? (
                      <Chip label="Configured" color="success" size="small" variant="outlined" />
                    ) : (
                      <Chip label="Missing" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(admin.createdAt)}</TableCell>
                  <TableCell>{formatDate(admin.lastLoginAt)}</TableCell>
                  <TableCell align="right">
                    {admin.role !== 'ROLE_SUPER_ADMIN' && (
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Tooltip
                          title={
                            admin.hasAdminAccessCode
                              ? 'Update 6-digit admin access code'
                              : 'Set 6-digit admin access code'
                          }
                        >
                          <IconButton size="small" onClick={() => openAccessCodeDialog(admin)}>
                            <VpnKey
                              sx={{
                                color: admin.hasAdminAccessCode ? 'primary.main' : 'warning.main',
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={admin.enabled ? 'Disable account' : 'Enable account'}>
                          <IconButton size="small" onClick={() => handleToggle(admin)}>
                            {admin.enabled ? (
                              <ToggleOff sx={{ color: 'text.secondary' }} />
                            ) : (
                              <ToggleOn sx={{ color: 'success.main' }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send a new Firebase reset link">
                          <IconButton size="small" onClick={() => handleResetPassword(admin)}>
                            <LockReset sx={{ color: 'warning.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Admin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            We will create the admin account and send a setup email so the admin can choose their
            own password. After that, set the 6-digit access code from the actions menu before the
            admin can enter the panel.
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            label="Full Name"
            fullWidth
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={isCreating}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {isCreating ? 'Creating...' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={accessCodeDialogOpen}
        onClose={() => setAccessCodeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedAdmin?.hasAdminAccessCode ? 'Update Access Code' : 'Set Access Code'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedAdmin?.email
              ? `This 6-digit code will be required every time ${selectedAdmin.email} logs in.`
              : 'Set a 6-digit code that the admin must enter after password login.'}
          </Typography>
          {accessCodeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {accessCodeError}
            </Alert>
          )}
          <TextField
            label="6-digit access code"
            fullWidth
            value={accessCode}
            onChange={(event) => {
              const numeric = event.target.value.replace(/\D/g, '').slice(0, 6);
              setAccessCode(numeric);
              setAccessCodeError('');
            }}
            inputProps={{
              inputMode: 'numeric',
              maxLength: 6,
            }}
            helperText="Example: 482615"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAccessCodeDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAccessCodeSubmit}
            disabled={isSavingAccessCode}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {isSavingAccessCode ? 'Saving...' : 'Save Code'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagementPage;
