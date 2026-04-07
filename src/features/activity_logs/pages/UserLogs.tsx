import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { History, Search } from '@mui/icons-material';

import { useGetUserLogsQuery, type UserLog } from '@/api/userLogsApi';
import EmptyState from '@components/empty-state/EmptyState';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
} from '@components/glassmorphism/GlassComponents';
import { SkeletonPageHeader, SkeletonTable } from '@components/skeletons/LoadingSkeletons';

const getDateFilterLabel = (timestamp: string) => {
  const now = new Date();
  const logDate = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (logDate >= todayStart) return 'today';
  if (logDate >= yesterdayStart) return 'yesterday';
  return 'older';
};

const formatRelativeTime = (timestamp: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function UserLogs() {
  const { data: logs = [], isLoading, error } = useGetUserLogsQuery();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'today' | 'yesterday' | 'older'>('ALL');

  const roleOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(logs.map((log) => log.userRole).filter(Boolean))).sort()],
    [logs],
  );

  const actionOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort()],
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...logs]
      .filter((log) => {
        const haystack = [
          log.userId,
          log.userRole,
          log.action,
          log.details,
          log.ipAddress,
          new Date(log.timestamp).toLocaleString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch = !query || haystack.includes(query);
        const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        const matchesDate =
          dateFilter === 'ALL' || getDateFilterLabel(log.timestamp) === dateFilter;

        return matchesSearch && matchesRole && matchesAction && matchesDate;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, search, roleFilter, actionFilter, dateFilter]);

  const summary = useMemo(
    () => ({
      total: logs.length,
      today: logs.filter((log) => getDateFilterLabel(log.timestamp) === 'today').length,
      yesterday: logs.filter((log) => getDateFilterLabel(log.timestamp) === 'yesterday').length,
      filtered: filteredLogs.length,
    }),
    [logs, filteredLogs],
  );

  const hasActiveFilters =
    Boolean(search) || roleFilter !== 'ALL' || actionFilter !== 'ALL' || dateFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setActionFilter('ALL');
    setDateFilter('ALL');
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Unable to load user logs"
          description="Please try again in a moment."
          secondaryActionLabel="Retry"
          onSecondaryAction={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <GlassPageHeader>
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              <GradientText>User Activity Logs</GradientText>
            </Typography>
            <Typography color="text.secondary">
              Search by user ID, role, action, phone inside details, or IP address.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<History fontSize="small" />}
              label={`${summary.filtered} visible`}
              color="primary"
            />
            <Chip label={`Today ${summary.today}`} variant="outlined" />
            <Chip label={`Yesterday ${summary.yesterday}`} variant="outlined" />
            <Chip label={`Total ${summary.total}`} variant="outlined" />
          </Stack>
        </Stack>
      </GlassPageHeader>

      <GlassCard sx={{ mt: 3, p: 3 }}>
        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user ID, role, action, mobile, details, IP..."
            sx={{ flex: 1, minWidth: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 180, flexShrink: 0 }}>
            <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'ALL' ? 'All Roles' : option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200, flexShrink: 0 }}>
            <Select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
              {actionOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'ALL' ? 'All Actions' : option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 170, flexShrink: 0 }}>
            <Select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as any)}
            >
              <MenuItem value="ALL">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="older">Older</MenuItem>
            </Select>
          </FormControl>
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

        {filteredLogs.length === 0 ? (
          <EmptyState
            type="not-found"
            title="No matching logs"
            description="Try a different search or filter combination."
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log: UserLog) => {
                  const bucket = getDateFilterLabel(log.timestamp);
                  const bucketLabel =
                    bucket === 'today' ? 'Today' : bucket === 'yesterday' ? 'Yesterday' : 'Earlier';

                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={700}>
                            {formatRelativeTime(log.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                          <Chip size="small" label={bucketLabel} sx={{ width: 'fit-content' }} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={700}>User #{log.userId}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.ipAddress || 'IP not captured'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={log.userRole || 'UNKNOWN'}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{log.action}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {log.details || 'No extra details'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassCard>
    </Box>
  );
}
