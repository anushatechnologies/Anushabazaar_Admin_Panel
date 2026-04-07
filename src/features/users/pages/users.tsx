import { useState, useEffect, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Pagination,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from '../../../components/toast/ToastContainer';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/empty-state/EmptyState';
import { SkeletonTable, SkeletonPageHeader } from '../../../components/skeletons/LoadingSkeletons';
import {
  GlassPageHeader,
  GradientText,
  GlassCard,
} from '../../../components/glassmorphism/GlassComponents';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import {
  useGetCustomersQuery,
  useUpdateCustomerStatusMutation,
  useDeleteCustomerMutation,
} from '../../customers/api/customerApi';

export default function Users() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [showPhone, setShowPhone] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { handleError } = useErrorHandler();

  const { data, isLoading, isFetching, isError, error } = useGetCustomersQuery({
    search: debouncedSearch,
    active: filterActive === 'all' ? undefined : filterActive,
    page,
    size: 20,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateCustomerStatusMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const customers = data?.customers || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;
  const currentPage = data?.currentPage || 0;

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusToggle = async (id: number, currentActive: boolean) => {
    try {
      await updateStatus({ id, active: !currentActive }).unwrap();
      toast.success(`Customer ${!currentActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id).unwrap();
      toast.success('Customer deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    } finally {
      setOpenMenuId(null);
      setConfirmDeleteId(null);
    }
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Status', 'Created At'];
    const rows = customers.map((c) => [
      c.id,
      c.name || '—',
      c.phoneNumber,
      c.email || '—',
      c.isActive ? 'Active' : 'Inactive',
      c.createdAt?.slice(0, 10) || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully');
  };

  const maskPhone = (phone: string) => `${phone.slice(0, 5)}****${phone.slice(-2)}`;

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError && !customers.length) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Failed to load customers"
          description="There was an error loading the customer data. Please try again."
          secondaryActionLabel="Retry"
          onSecondaryAction={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassPageHeader>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <GradientText>Users Management</GradientText>
              </Typography>
              <Typography color="text.secondary">
                {totalElements} customers total • Page {currentPage + 1} of {totalPages}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadCSV}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                }}
              >
                Download CSV
              </Button>
            </Stack>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
            p: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <TextField
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'white',
              },
            }}
          />

          <Select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setPage(0);
            }}
            sx={{
              minWidth: 150,
              borderRadius: 3,
              background: 'white',
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </Box>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">Syncing...</Typography>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 4 }}>
                      <EmptyState
                        type={search ? 'not-found' : 'empty'}
                        title={search ? 'No customers found' : 'No customers yet'}
                        description={
                          search
                            ? `No results for "${search}". Try a different search term.`
                            : 'No customers have been added yet.'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer, index) => (
                    <TableRow
                      key={customer.id}
                      hover
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              background: customer.isActive
                                ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                              width: 40,
                              height: 40,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>
                              {customer.name || 'Unnamed Customer'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: #{customer.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontFamily="monospace">
                            {showPhone === customer.id
                              ? customer.phoneNumber
                              : maskPhone(customer.phoneNumber)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setShowPhone(showPhone === customer.id ? null : customer.id)
                            }
                          >
                            {showPhone === customer.id ? (
                              <VisibilityOffIcon fontSize="small" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography color={customer.email ? 'text.primary' : 'text.disabled'}>
                          {customer.email || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={customer.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            background: customer.isActive
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: customer.isActive ? '#16a34a' : '#dc2626',
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography color="text.secondary">
                          {formatDate(customer.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ position: 'relative' }}>
                          <Tooltip title="Actions">
                            <IconButton
                              onClick={() =>
                                setOpenMenuId(openMenuId === customer.id ? null : customer.id)
                              }
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>

                          {openMenuId === customer.id && (
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                zIndex: 10,
                                background: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                minWidth: 160,
                                py: 1,
                              }}
                            >
                              <Button
                                fullWidth
                                startIcon={customer.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                                onClick={() => handleStatusToggle(customer.id, customer.isActive)}
                                disabled={isUpdating}
                                sx={{
                                  justifyContent: 'flex-start',
                                  px: 2,
                                  py: 1,
                                  color: customer.isActive ? '#f59e0b' : '#22c55e',
                                }}
                              >
                                {customer.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                fullWidth
                                startIcon={<DeleteIcon />}
                                onClick={() => setConfirmDeleteId(customer.id)}
                                disabled={isDeleting}
                                sx={{
                                  justifyContent: 'flex-start',
                                  px: 2,
                                  py: 1,
                                  color: '#ef4444',
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </GlassCard>
      </motion.div>

      {/* Close menu on outside click */}
      {openMenuId !== null && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 5,
          }}
          onClick={() => setOpenMenuId(null)}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete Customer"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone."
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </Box>
  );
}
