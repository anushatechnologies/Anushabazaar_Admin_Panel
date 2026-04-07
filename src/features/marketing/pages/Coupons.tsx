import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ReusableTable from '../../../components/common/ReusableTable';
import {
  GlassPageHeader,
  GlassCard,
  GradientText,
} from '../../../components/glassmorphism/GlassComponents';
import EmptyState from '../../../components/empty-state/EmptyState';
import { SkeletonPageHeader, SkeletonTable } from '../../../components/skeletons/LoadingSkeletons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
  useGetAllCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  Coupon,
} from '../../../api/couponsApi';

export default function Coupons() {
  const { data: coupons, isLoading } = useGetAllCouponsQuery();
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minCartValue: 0,
    maxDiscountAmount: 0,
    firstTimeUserOnly: false,
    startDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    expiryDate: dayjs().add(30, 'days').format('YYYY-MM-DDTHH:mm:ss'),
    usageLimit: 1000,
    usageLimitPerUser: 1,
    active: true,
  });

  const handleOpen = (item?: Coupon) => {
    if (item) {
      setEditId(item.id);
      setFormData({ ...item });
    } else {
      setEditId(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minCartValue: 0,
        maxDiscountAmount: 0,
        firstTimeUserOnly: false,
        startDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        expiryDate: dayjs().add(30, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        usageLimit: 1000,
        usageLimitPerUser: 1,
        active: true,
      });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateCoupon({ id: editId, data: { ...formData, id: editId } }).unwrap();
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(formData).unwrap();
        toast.success('Coupon created successfully');
      }
      setOpen(false);
    } catch {
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id).unwrap();
        toast.success('Coupon deleted successfully');
      } catch {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const filteredCoupons = useMemo(() => {
    return (coupons || []).filter((coupon) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        coupon.description?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? coupon.active : !coupon.active;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  const hasActiveFilters = Boolean(search) || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  const columns = [
    {
      header: 'Code',
      key: 'code',
      render: (row: Coupon) => (
        <Typography fontWeight={700} color="primary">
          {row.code}
        </Typography>
      ),
    },
    {
      header: 'Discount',
      key: 'discountValue',
      render: (row: Coupon) =>
        row.discountType === 'PERCENTAGE' ? `${row.discountValue}%` : `Rs ${row.discountValue}`,
    },
    { header: 'Min Order', key: 'minCartValue', render: (row: Coupon) => `Rs ${row.minCartValue}` },
    {
      header: 'Max Cap',
      key: 'maxDiscountAmount',
      render: (row: Coupon) => `Rs ${row.maxDiscountAmount}`,
    },
    {
      header: 'Expiry',
      key: 'expiryDate',
      render: (row: Coupon) => dayjs(row.expiryDate).format('DD MMM, YYYY'),
    },
    { header: 'Total Limit', key: 'usageLimit' },
    { header: 'Limit/User', key: 'usageLimitPerUser' },
    {
      header: 'Status',
      key: 'active',
      render: (row: Coupon) => (
        <Chip
          size="small"
          color={row.active ? 'success' : 'error'}
          label={row.active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row: Coupon) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpen(row)}
            startIcon={<Edit size={14} />}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleDelete(row.id)}
            startIcon={<Trash2 size={14} />}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
                <GradientText>Coupons & Discounts</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Search, filter, and manage promotional offers from one place.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlusCircle />}
              onClick={() => handleOpen()}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                px: 3,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Add Coupon
            </Button>
          </Box>
        </GlassPageHeader>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard>
          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coupon code or description..."
              sx={{ flex: 1, minWidth: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              sx={{ flexShrink: 0 }}
            >
              <Chip
                label="All"
                color={statusFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('all')}
                clickable
              />
              <Chip
                label="Active"
                color={statusFilter === 'active' ? 'success' : 'default'}
                onClick={() => setStatusFilter('active')}
                clickable
              />
              <Chip
                label="Inactive"
                color={statusFilter === 'inactive' ? 'error' : 'default'}
                onClick={() => setStatusFilter('inactive')}
                clickable
              />
            </Stack>
            <Button
              variant={hasActiveFilters ? 'contained' : 'outlined'}
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              sx={{
                minWidth: 154,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: hasActiveFilters ? '0 12px 24px rgba(37, 99, 235, 0.18)' : 'none',
                flexShrink: 0,
              }}
            >
              Reset Filters
            </Button>
          </Stack>

          {!filteredCoupons.length ? (
            <Box sx={{ py: 5 }}>
              <EmptyState
                title={search || statusFilter !== 'all' ? 'No matching coupons' : 'No Coupons Yet'}
                description={
                  search || statusFilter !== 'all'
                    ? 'Try a different search or status filter.'
                    : 'Create a coupon to attract more orders!'
                }
              />
            </Box>
          ) : (
            <ReusableTable columns={columns} data={filteredCoupons} loading={isLoading} />
          )}
        </GlassCard>
      </motion.div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Coupon Code"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Start Date"
                fullWidth
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate?.substring(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value + ':00' })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Expiry Date"
                fullWidth
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.expiryDate?.substring(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value + ':00' })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Discount Type"
                fullWidth
                select
                SelectProps={{ native: true }}
                margin="dense"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (Rs)</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                margin="dense"
                label="Discount Value"
                fullWidth
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: Number(e.target.value) })
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                margin="dense"
                label="Min Cart Value (Rs)"
                fullWidth
                type="number"
                value={formData.minCartValue}
                onChange={(e) => setFormData({ ...formData, minCartValue: Number(e.target.value) })}
              />
            </Grid>
            {formData.discountType === 'PERCENTAGE' && (
              <Grid size={{ xs: 6 }}>
                <TextField
                  margin="dense"
                  label="Max Cap (Rs)"
                  fullWidth
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 6 }}>
              <TextField
                margin="dense"
                label="Total Usage Limit"
                fullWidth
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                margin="dense"
                label="Limit per User"
                fullWidth
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.firstTimeUserOnly}
                    onChange={(e) =>
                      setFormData({ ...formData, firstTimeUserOnly: e.target.checked })
                    }
                  />
                }
                label="First Time Users Only"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    color="success"
                    checked={!!formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Active (Enable/Disable)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Coupon
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
