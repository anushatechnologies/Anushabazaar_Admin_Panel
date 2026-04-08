import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useGetDeliveryOrdersQuery } from '../api/deliveryApi';
import { useNavigate } from 'react-router-dom';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PLACED: 'default',
  STORE_NOTIFIED: 'warning',
  STORE_ACCEPTED: 'warning',
  PICKUP_OTP_GENERATED: 'info',
  BROADCASTED_TO_RIDERS: 'info',
  RIDER_ASSIGNED: 'info',
  REACHED_STORE: 'info',
  PICKUP_OTP_VERIFIED: 'info',
  PICKED_UP: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
  STORE_REJECTED: 'error',
  RIDER_REJECTED: 'error',
};

const AssignmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isFetching, isError, refetch } = useGetDeliveryOrdersQuery(
    statusFilter || undefined,
    { pollingInterval: 15_000 }, // auto-refresh every 15 s
  );

  const orders = data?.orders ?? [];

  const QUICK_FILTERS = [
    { label: 'All Active', value: '' },
    { label: 'Broadcasting', value: 'BROADCASTED_TO_RIDERS' },
    { label: 'Assigned', value: 'RIDER_ASSIGNED' },
    { label: 'En Route', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Assignment Dashboard
        </Typography>
        <Tooltip title="Refresh (auto every 15s)">
          <IconButton onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {QUICK_FILTERS.map(({ label, value }) => (
          <Chip
            key={value}
            label={label}
            onClick={() => setStatusFilter(value)}
            color={statusFilter === value ? 'primary' : 'default'}
            variant={statusFilter === value ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load orders. Check backend connection.
        </Alert>
      )}

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Broadcasting', status: 'BROADCASTED_TO_RIDERS', color: 'info' as const },
          { label: 'Assigned', status: 'RIDER_ASSIGNED', color: 'info' as const },
          { label: 'En Route', status: 'OUT_FOR_DELIVERY', color: 'warning' as const },
        ].map(({ label, status, color }) => {
          const count = orders.filter((o: any) => o.status === status).length;
          return (
            <Card key={status} sx={{ minWidth: 120 }}>
              <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                <Typography variant="h5" color={`${color}.main`}>
                  {count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Orders table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>
                <b>Order #</b>
              </TableCell>
              <TableCell>
                <b>Store</b>
              </TableCell>
              <TableCell>
                <b>Customer</b>
              </TableCell>
              <TableCell>
                <b>Delivery Address</b>
              </TableCell>
              <TableCell>
                <b>Fee</b>
              </TableCell>
              <TableCell>
                <b>Rider</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
              <TableCell>
                <b>Created</b>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching && orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.store?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: 12 }}>
                    {order.deliveryAddress}
                  </TableCell>
                  <TableCell>₹{order.deliveryFee ?? '—'}</TableCell>
                  <TableCell>
                    {order.deliveryPerson ? (
                      `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status?.replace(/_/g, ' ') ?? '—'}
                      color={STATUS_COLOR[order.status] ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View detail">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {orders.length} order{orders.length !== 1 ? 's' : ''} • Auto-refreshes every 15 seconds
      </Typography>
    </Box>
  );
};

export default AssignmentDashboard;
