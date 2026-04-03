import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import ReusableTable from '../../../components/common/ReusableTable';
import {
  useGetPayoutsQuery,
  useGetPayoutStatsQuery,
  useGenerateWeeklyPayoutsMutation,
  useProcessPayoutMutation,
  useFailPayoutMutation,
  useRetryPayoutMutation
} from '../api/payoutApi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PayoutList() {
  const { data: payoutsData, isLoading: isPayoutsLoading } = useGetPayoutsQuery();
  const { data: statsData, isLoading: isStatsLoading } = useGetPayoutStatsQuery();
  const [generate] = useGenerateWeeklyPayoutsMutation();
  const [processPayout] = useProcessPayoutMutation();
  const [retryPayout] = useRetryPayoutMutation();

  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    paymentMethod: 'UPI'
  });

  const handleGenerate = async () => {
    try {
      const res = await generate().unwrap();
      toast.success(`Generated ${res.count} payouts successfully`);
    } catch (err) {
      toast.error('Generation failed');
    }
  };

  const handleProcess = async () => {
    if (!paymentId) return;
    try {
      await processPayout({
        id: paymentId,
        ...paymentDetails,
        adminId: 1
      }).unwrap();
      toast.success('Payout marked as paid');
      setPaymentId(null);
    } catch (err) {
      toast.error('Processing failed');
    }
  };

  const handleRetry = async (id: number) => {
    try {
      await retryPayout(id).unwrap();
      toast.success('Payout moved back to pending');
    } catch (err) {
      toast.error('Retry failed');
    }
  };

  const payouts = payoutsData?.payouts || [];
  const stats = statsData?.statistics;

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Payout Management</Typography>
          <Typography color="text.secondary">Review and process delivery staff commissions</Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          sx={{ height: 48 }}
        >
          Generate Weekly Payouts
        </Button>
      </Stack>

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Total Paid" value={`₹${stats?.totalProcessedAmount || 0}`} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Total Pending Amount" value={`₹${stats?.totalPendingAmount || 0}`} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Total Transactions" value={stats?.totalPayouts || 0} color="error.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Pending Records" value={stats?.pendingPayouts || 0} color="primary.main" />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <ReusableTable<any>
          columns={[
            { header: 'ID', key: 'id' },
            {
              header: 'Delivery Staff',
              key: 'deliveryPerson',
              render: (row) => (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {row.deliveryPerson?.firstName} {row.deliveryPerson?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.deliveryPerson?.phoneNumber}
                  </Typography>
                </Box>
              )
            },
            {
              header: 'Bank Details',
              key: 'bank',
              render: (row) => (
                <Box>
                  <Typography variant="caption" display="block">
                    {row.deliveryPerson?.bankName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {row.deliveryPerson?.accountNumber || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {row.deliveryPerson?.ifscCode || ''}
                  </Typography>
                </Box>
              )
            },
            {
              header: 'Amount',
              key: 'payoutAmount',
              render: (row) => <Typography fontWeight={700} color="primary.main">₹{row.payoutAmount}</Typography>
            },
            {
              header: 'Status',
              key: 'status',
              render: (row) => (
                <Chip
                  label={row.status}
                  color={row.status === 'PROCESSED' || row.status === 'PAID' ? 'success' : row.status === 'PENDING' ? 'warning' : 'error'}
                  size="small"
                />
              )
            },
            {
              header: 'Period',
              key: 'weekStartDate',
              render: (row) => `${new Date(row.weekStartDate).toLocaleDateString()} - ${new Date(row.weekEndDate).toLocaleDateString()}`
            },
            {
              header: 'Actions',
              key: 'id',
              render: (row) => (
                <Stack direction="row" spacing={1}>
                  {row.status === 'PENDING' && (
                    <Button size="small" variant="contained" onClick={() => setPaymentId(row.id)}>Pay</Button>
                  )}
                  {row.status === 'FAILED' && (
                    <Button size="small" variant="outlined" color="warning" onClick={() => handleRetry(row.id)}>Retry</Button>
                  )}
                  <Button size="small" variant="text">Log</Button>
                </Stack>
              )
            }
          ]}
          data={payouts}
          loading={isPayoutsLoading}
          currentPage={1}
          totalPages={1}
          onPageChange={() => { }}
        />
      </Card>

      {/* Payment Process Dialog */}
      <Dialog open={!!paymentId} onClose={() => setPaymentId(null)}>
        <DialogTitle>Mark as Paid</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={3}>Enter payment transaction details to complete the payout.</Typography>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={paymentDetails.paymentMethod}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
            >
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Transaction ID / Reference"
              placeholder="Enter internal or bank reference"
              value={paymentDetails.transactionId}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPaymentId(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleProcess}
            disabled={!paymentDetails.transactionId.trim()}
          >
            Mark as PAID
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight={700} color={color} mt={1}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
