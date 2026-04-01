import React, { useState } from 'react';
import { Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Switch, FormControlLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ReusableTable from '../../../components/common/ReusableTable';
import { GlassPageHeader, GlassCard, GradientText } from '../../../components/glassmorphism/GlassComponents';
import EmptyState from '../../../components/empty-state/EmptyState';
import { SkeletonPageHeader, SkeletonTable } from '../../../components/skeletons/LoadingSkeletons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useGetAllCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation, Coupon } from '../../../api/couponsApi';

export default function Coupons() {
  const { data: coupons, isLoading, error } = useGetAllCouponsQuery();
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
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
        code: '', description: '', discountType: 'PERCENTAGE',
        discountValue: 0, minCartValue: 0, maxDiscountAmount: 0,
        firstTimeUserOnly: false, 
        startDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        expiryDate: dayjs().add(30, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        usageLimit: 1000,
        usageLimitPerUser: 1, active: true,
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
    } catch (e: any) {
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id).unwrap();
        toast.success('Coupon deleted successfully');
      } catch (e) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const columns = [
    { header: 'Code', key: 'code', render: (row: Coupon) => <Typography fontWeight={700} color="primary">{row.code}</Typography> },
    { header: 'Discount', key: 'discountValue', render: (row: Coupon) => row.discountType === 'PERCENTAGE' ? `${row.discountValue}%` : `₹${row.discountValue}` },
    { header: 'Min Order', key: 'minCartValue', render: (row: Coupon) => `₹${row.minCartValue}` },
    { header: 'Max Cap', key: 'maxDiscountAmount', render: (row: Coupon) => `₹${row.maxDiscountAmount}` },
    { header: 'Expiry', key: 'expiryDate', render: (row: Coupon) => dayjs(row.expiryDate).format('DD MMM, YYYY') },
    { header: 'Total Limit', key: 'usageLimit' },
    { header: 'Limit/User', key: 'usageLimitPerUser' },
    { header: 'Status', key: 'active', render: (row: Coupon) => <Chip size="small" color={row.active ? 'success' : 'error'} label={row.active ? 'Active' : 'Expired'} /> },
    { 
      header: 'Actions', 
      key: 'actions', 
      render: (row: Coupon) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => handleOpen(row)} startIcon={<Edit size={14} />}>Edit</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(row.id)} startIcon={<Trash2 size={14} />}>Delete</Button>
        </Box>
      )
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassPageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <GradientText>Coupons & Discounts</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Manage promotional codes and cart-level discounts.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlusCircle />}
              onClick={() => handleOpen()}
              sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', px: 3, py: 1.5, borderRadius: 2 }}
            >
              Add Coupon
            </Button>
          </Box>
        </GlassPageHeader>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <GlassCard>
           {!coupons || coupons.length === 0 ? (
             <EmptyState title="No Coupons Yet" description="Create a coupon to attract more orders!" />
           ) : (
             <ReusableTable columns={columns} data={coupons} loading={isLoading} />
           )}
        </GlassCard>
      </motion.div>

      {/* Editor Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField autoFocus margin="dense" label="Coupon Code" fullWidth required
                value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField margin="dense" label="Start Date" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }}
                value={formData.startDate?.substring(0, 16) || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value + ':00' })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField margin="dense" label="Expiry Date" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }}
                value={formData.expiryDate?.substring(0, 16) || ''} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value + ':00' })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField margin="dense" label="Description" fullWidth multiline rows={2}
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <TextField label="Discount Type" fullWidth select SelectProps={{ native: true }} margin="dense"
                value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField margin="dense" label="Discount Value" fullWidth type="number"
                value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <TextField margin="dense" label="Min Cart Value (₹)" fullWidth type="number"
                value={formData.minCartValue} onChange={(e) => setFormData({ ...formData, minCartValue: Number(e.target.value) })} />
            </Grid>
            {formData.discountType === 'PERCENTAGE' && (
              <Grid size={{ xs: 6 }}>
                <TextField margin="dense" label="Max Cap (₹)" fullWidth type="number"
                  value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })} />
              </Grid>
            )}

            <Grid size={{ xs: 6 }}>
              <TextField margin="dense" label="Total Usage Limit" fullWidth type="number"
                value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField margin="dense" label="Limit per User" fullWidth type="number"
                value={formData.usageLimitPerUser} onChange={(e) => setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel control={<Switch checked={!!formData.firstTimeUserOnly} onChange={(e) => setFormData({ ...formData, firstTimeUserOnly: e.target.checked })} />} label="First Time Users Only" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel control={<Switch color="success" checked={!!formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />} label="Active (Enable/Disable)" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save Coupon</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
