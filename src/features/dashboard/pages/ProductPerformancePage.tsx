import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import {
  Inventory2 as ProductIcon,
  Sell as UnitsIcon,
  CurrencyRupee as RevenueIcon,
  LocalShipping as OrdersIcon,
  EmojiEvents as LeaderIcon,
} from '@mui/icons-material';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { GradientText } from '../../../components/glassmorphism/GlassComponents';
import { useGetProductPerformanceQuery, type ProductPerformanceItem } from '../api/dashboardApi';

type Period = 'today' | 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

const fmtNum = (value: number | undefined) =>
  new Intl.NumberFormat('en-IN').format(Number(value ?? 0));

const fmtRupee = (value: number | undefined) =>
  `Rs ${Number(value ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  helper,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  helper?: string;
  loading?: boolean;
}) {
  const { isDark } = useAppTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1.5px solid ${alpha(color, isDark ? 0.28 : 0.18)}`,
        background: isDark
          ? `linear-gradient(135deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.9) 100%)`
          : `linear-gradient(135deg, #ffffff 0%, ${alpha(color, 0.04)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(color, isDark ? 0.16 : 0.08)}`,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
        <Avatar sx={{ bgcolor: alpha(color, 0.14), color, width: 44, height: 44 }}>
          <Icon fontSize="small" />
        </Avatar>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={0.8}
        >
          {label}
        </Typography>
      </Stack>

      {loading ? (
        <CircularProgress size={22} sx={{ color }} />
      ) : (
        <Typography variant="h4" fontWeight={900} sx={{ color }}>
          {value}
        </Typography>
      )}

      {helper && (
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
          {helper}
        </Typography>
      )}
    </Paper>
  );
}

export default function ProductPerformancePage() {
  const { currentTheme, isDark } = useAppTheme();
  const [period, setPeriod] = useState<Period>('today');
  const { data, isLoading, isFetching } = useGetProductPerformanceQuery(period);

  const topProduct = useMemo<ProductPerformanceItem | null>(
    () => (data?.topProducts?.length ? data.topProducts[0] : null),
    [data],
  );

  const cardBg = isDark
    ? 'linear-gradient(180deg, rgba(30,41,59,0.97) 0%, rgba(15,23,42,0.92) 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';

  const sectionStyle = {
    p: 3,
    borderRadius: 4,
    background: cardBg,
    border: `1px solid ${currentTheme.border}`,
    boxShadow: isDark ? '0 8px 32px rgba(2,8,23,0.3)' : '0 4px 24px rgba(15,23,42,0.07)',
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Paper sx={{ ...sectionStyle, p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} mb={0.5}>
              <GradientText>Product Performance</GradientText>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Track top-selling products across delivered orders for{' '}
              {PERIOD_LABELS[period].toLowerCase()}.
            </Typography>
            {data?.from && data?.to && (
              <Typography color="text.secondary" variant="caption" display="block" mt={0.75}>
                {dayjs(data.from).format('DD MMM YYYY, hh:mm A')} to{' '}
                {dayjs(data.to).format('DD MMM YYYY, hh:mm A')}
              </Typography>
            )}
          </Box>

          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, value) => value && setPeriod(value)}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            {(['today', 'week', 'month', 'all'] as Period[]).map((item) => (
              <ToggleButton
                key={item}
                value={item}
                sx={{
                  px: 2,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  '&.Mui-selected': {
                    background: currentTheme.accent,
                    color: '#fff',
                    '&:hover': { background: currentTheme.accent },
                  },
                }}
              >
                {item === 'all' ? 'All Time' : item.charAt(0).toUpperCase() + item.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Products"
            value={fmtNum(data?.summary?.productsCount)}
            icon={ProductIcon}
            color="#6366f1"
            helper="Products with delivered sales"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Units Sold"
            value={fmtNum(data?.summary?.unitsSold)}
            icon={UnitsIcon}
            color="#f59e0b"
            helper={PERIOD_LABELS[period]}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Product Revenue"
            value={fmtRupee(data?.summary?.productRevenue)}
            icon={RevenueIcon}
            color="#059669"
            helper="Item revenue only"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Delivered Orders"
            value={fmtNum(data?.summary?.deliveredOrders)}
            icon={OrdersIcon}
            color="#3b82f6"
            helper="Orders counted in this window"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...sectionStyle, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.16), color: '#f59e0b' }}>
                <LeaderIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Top Performer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best seller for {PERIOD_LABELS[period].toLowerCase()}
                </Typography>
              </Box>
            </Stack>

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : topProduct ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={topProduct.imageUrl || undefined}
                    variant="rounded"
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: 3,
                      bgcolor: alpha(currentTheme.accent, 0.12),
                      color: currentTheme.accent,
                      fontWeight: 800,
                    }}
                  >
                    {topProduct.productName?.slice(0, 1)?.toUpperCase() || 'P'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={800} noWrap>
                      {topProduct.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {topProduct.storeName || 'Store not available'}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    background: alpha('#f59e0b', isDark ? 0.12 : 0.06),
                    border: `1px solid ${alpha('#f59e0b', 0.18)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    textTransform="uppercase"
                  >
                    Leaderboard Stats
                  </Typography>
                  <Stack spacing={1.2} mt={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Units Sold
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {fmtNum(topProduct.unitsSold)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Revenue
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {fmtRupee(topProduct.revenue)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Orders
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {fmtNum(topProduct.orderCount)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Box
                sx={{
                  minHeight: 220,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Box>
                  <LeaderIcon sx={{ fontSize: 42, opacity: 0.5, mb: 1 }} />
                  <Typography fontWeight={700}>No product sales yet</Typography>
                  <Typography variant="body2">
                    Delivered orders will populate this leaderboard.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={sectionStyle}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1.5}
              mb={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Top Products Leaderboard
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ranked by units sold, then by revenue
                </Typography>
              </Box>
              {isFetching && !isLoading ? (
                <Typography variant="caption" color="text.secondary">
                  Refreshing...
                </Typography>
              ) : null}
            </Stack>

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={7}>
                <CircularProgress />
              </Box>
            ) : data?.topProducts?.length ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Store</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">
                        Units
                      </TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">
                        Orders
                      </TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">
                        Revenue
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.topProducts.map((product) => (
                      <TableRow key={`${product.productId}-${product.rank}`} hover>
                        <TableCell>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: 14,
                              fontWeight: 800,
                              bgcolor: alpha(currentTheme.accent, 0.14),
                              color: currentTheme.accent,
                            }}
                          >
                            {product.rank}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={product.imageUrl || undefined}
                              variant="rounded"
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                bgcolor: alpha(currentTheme.accent, 0.12),
                                color: currentTheme.accent,
                                fontWeight: 800,
                              }}
                            >
                              {product.productName?.slice(0, 1)?.toUpperCase() || 'P'}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={800} noWrap>
                                {product.productName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Product ID: {product.productId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.storeName || 'Store not available'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800}>{fmtNum(product.unitsSold)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800}>{fmtNum(product.orderCount)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={900}>{fmtRupee(product.revenue)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Box>
                  <ProductIcon sx={{ fontSize: 46, opacity: 0.45, mb: 1 }} />
                  <Typography fontWeight={700}>
                    No delivered product sales in this period
                  </Typography>
                  <Typography variant="body2">
                    Switch the filter or wait for delivered orders to build the leaderboard.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
