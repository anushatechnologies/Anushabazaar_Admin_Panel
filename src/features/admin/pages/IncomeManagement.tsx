import React from 'react';
import {
  Box,
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
import { AttachMoney, CurrencyRupee, ReceiptLong } from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

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

const normalizeTransactions = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export default function IncomeManagement() {
  const { currentTheme } = useAppTheme();
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
                <GradientText>Income & Payments</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Revenue summary and payment transaction history for the admin portal.
              </Typography>
            </Box>
            <Chip
              icon={<ReceiptLong fontSize="small" />}
              label={`${rows.length} transactions`}
              sx={{ bgcolor: `${currentTheme.accent}18`, color: currentTheme.accent, fontWeight: 800 }}
            />
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
        <StatCard accent={currentTheme.info}>
          <Stack spacing={1}>
            <AttachMoney sx={{ color: currentTheme.info }} />
            <Typography variant="body2" color="text.secondary">
              Today Income
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {formatCurrency(summary?.todayIncome)}
            </Typography>
          </Stack>
        </StatCard>
        <StatCard accent={currentTheme.accent}>
          <Stack spacing={1}>
            <CurrencyRupee sx={{ color: currentTheme.accent }} />
            <Typography variant="body2" color="text.secondary">
              Month Income
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {formatCurrency(summary?.monthIncome)}
            </Typography>
          </Stack>
        </StatCard>
        <StatCard accent={currentTheme.success}>
          <Stack spacing={1}>
            <ReceiptLong sx={{ color: currentTheme.success }} />
            <Typography variant="body2" color="text.secondary">
              Total Income
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {formatCurrency(summary?.totalIncome)}
            </Typography>
          </Stack>
        </StatCard>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
          {rows.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                type="no-data"
                title="No transactions found"
                description="Payment transaction history will appear here when the backend returns data."
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
                  {rows.map((row: any, index: number) => (
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
                          label={row.status || 'UNKNOWN'}
                          sx={{
                            bgcolor: `${currentTheme.accent}14`,
                            color: currentTheme.accent,
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.method || row.paymentMethod || '—'}</TableCell>
                      <TableCell>
                        {row.date || row.createdAt
                          ? dayjs(row.date || row.createdAt).format('DD MMM YYYY · hh:mm A')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>
      </motion.div>
    </Box>
  );
}
