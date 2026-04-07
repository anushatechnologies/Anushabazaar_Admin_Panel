import React from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AttachMoney, Bolt, CurrencyRupee, ReceiptLong } from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Link, useLocation } from 'react-router-dom';

import { useAppTheme } from '@contexts/ThemeContext';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
  StatCard,
} from '@components/glassmorphism/GlassComponents';
import EmptyState from '@components/empty-state/EmptyState';
import { SkeletonPageHeader, SkeletonTable } from '@components/skeletons/LoadingSkeletons';
import { useGetIncomeSummaryQuery, useGetIncomeTransactionsQuery } from '../api/adminApi';

const formatCurrency = (value?: number) =>
  `Rs. ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const normalizeMethod = (row: any) => {
  const rawMethod = String(row?.method || row?.paymentMethod || '')
    .trim()
    .toUpperCase();
  if (rawMethod === 'ONLINE' || rawMethod === 'RAZORPAY') return 'RAZORPAY';
  if (rawMethod === 'COD') return 'COD';
  return rawMethod || 'UNKNOWN';
};

const normalizeTransactions = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export default function IncomeManagement() {
  const { currentTheme } = useAppTheme();
  const location = useLocation();
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isError: isSummaryError,
  } = useGetIncomeSummaryQuery();
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
    isError: isTransactionsError,
  } = useGetIncomeTransactionsQuery();

  const loading = isSummaryLoading || isTransactionsLoading;
  const isError = isSummaryError || isTransactionsError;

  const refresh = async () => {
    await Promise.all([refetchSummary(), refetchTransactions()]);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Income data unavailable"
          description="We could not load the admin income summary right now."
          secondaryActionLabel="Retry"
          onSecondaryAction={refresh}
        />
      </Box>
    );
  }

  const summary = summaryData?.summary;
  const rows = normalizeTransactions(transactions);
  const paymentView =
    location.pathname === '/payments/razorpay'
      ? 'RAZORPAY'
      : location.pathname === '/payments/cod'
        ? 'COD'
        : 'ALL';
  const filteredRows = rows.filter(
    (row: any) => paymentView === 'ALL' || normalizeMethod(row) === paymentView,
  );
  const pageTitle = paymentView === 'ALL' ? 'Income & Payments' : `${paymentView} Payments`;
  const pageDescription =
    paymentView === 'ALL'
      ? 'Revenue summary and payment transaction history for the admin portal.'
      : `Focused view of ${paymentView} collections and transaction history.`;
  const summaryCards = [
    {
      label: 'Today Income',
      value: summary?.todayIncome,
      accent: currentTheme.info,
      icon: <AttachMoney sx={{ color: currentTheme.info }} />,
    },
    {
      label: 'Week Income',
      value: summary?.weekIncome,
      accent: currentTheme.warning,
      icon: <CurrencyRupee sx={{ color: currentTheme.warning }} />,
    },
    {
      label: 'Month Income',
      value: summary?.monthIncome,
      accent: currentTheme.accent,
      icon: <CurrencyRupee sx={{ color: currentTheme.accent }} />,
    },
    {
      label: 'Total Income',
      value: summary?.totalIncome,
      accent: currentTheme.success,
      icon: <ReceiptLong sx={{ color: currentTheme.success }} />,
    },
    {
      label: 'Razorpay Total',
      value: summary?.razorpayIncome,
      accent: '#2563eb',
      icon: <Bolt sx={{ color: '#2563eb' }} />,
    },
    {
      label: 'COD Total',
      value: summary?.codIncome,
      accent: '#ea580c',
      icon: <AttachMoney sx={{ color: '#ea580c' }} />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <GlassPageHeader>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                <GradientText>{pageTitle}</GradientText>
              </Typography>
              <Typography color="text.secondary">{pageDescription}</Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {[
                  { label: 'All', path: '/admin/income' },
                  { label: 'Razorpay', path: '/payments/razorpay' },
                  { label: 'COD', path: '/payments/cod' },
                ].map((tab) => {
                  const active = tab.path === location.pathname;
                  return (
                    <Button
                      key={tab.path}
                      component={Link}
                      to={tab.path}
                      variant={active ? 'contained' : 'outlined'}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        textTransform: 'none',
                        fontWeight: 700,
                        color: active ? '#fff' : currentTheme.text,
                        borderColor: `${currentTheme.border}80`,
                        bgcolor: active ? currentTheme.accent : 'transparent',
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Stack>
              <Chip
                icon={<ReceiptLong fontSize="small" />}
                label={`${filteredRows.length} transactions`}
                sx={{
                  bgcolor: `${currentTheme.accent}18`,
                  color: currentTheme.accent,
                  fontWeight: 800,
                }}
              />
            </Stack>
          </Stack>
        </GlassPageHeader>
      </motion.div>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mb: 3,
        }}
      >
        {summaryCards.map((card) => (
          <StatCard key={card.label} accent={card.accent}>
            <Stack spacing={1}>
              {card.icon}
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {formatCurrency(card.value)}
              </Typography>
            </Stack>
          </StatCard>
        ))}
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
          {filteredRows.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                type="no-data"
                title="No transactions found"
                description="Payment transaction history will appear here once matching Razorpay or COD collections are available."
              />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: `${currentTheme.border}30` }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Txn ID</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row: any, index: number) => {
                    const method = normalizeMethod(row);
                    const status = String(row.status || 'UNKNOWN').toUpperCase();
                    const statusColor =
                      status === 'SUCCESS'
                        ? currentTheme.success
                        : status === 'FAILED'
                          ? currentTheme.error
                          : currentTheme.warning;

                    return (
                      <TableRow key={row.id ?? row.txnid ?? row.transactionId ?? index} hover>
                        <TableCell>
                          <Typography fontWeight={800}>
                            {row.txnid || row.transactionId || `TX-${index + 1}`}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(row.amount)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={status}
                            sx={{
                              bgcolor: `${statusColor}18`,
                              color: statusColor,
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={method}
                            sx={{
                              bgcolor: `${method === 'COD' ? '#ea580c' : '#2563eb'}18`,
                              color: method === 'COD' ? '#ea580c' : '#2563eb',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {row.date || row.createdAt
                            ? dayjs(row.date || row.createdAt).format('DD MMM YYYY � hh:mm A')
                            : '�'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>
      </motion.div>
    </Box>
  );
}
