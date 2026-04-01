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
import { DeleteOutline, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

import { useAppTheme } from '@contexts/ThemeContext';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
} from '@components/glassmorphism/GlassComponents';
import EmptyState from '@components/empty-state/EmptyState';
import { SkeletonPageHeader, SkeletonTable } from '@components/skeletons/LoadingSkeletons';
import { useDeleteRatingMutation, useGetAllRatingsQuery } from '../api/adminApi';

export default function RatingsManagement() {
  const { currentTheme } = useAppTheme();
  const { data, isLoading, isError, refetch } = useGetAllRatingsQuery();
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();

  const ratings = data || [];

  const handleDelete = async (id: number) => {
    try {
      await deleteRating(id).unwrap();
      toast.success('Rating deleted successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete rating');
    }
  };

  if (isLoading) {
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
          title="Ratings unavailable"
          description="We could not load product ratings."
          secondaryActionLabel="Retry"
          onSecondaryAction={refetch}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <GlassPageHeader>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                <GradientText>Product Ratings</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Review customer ratings and remove problematic feedback when needed.
              </Typography>
            </Box>
            <Chip
              icon={<Star fontSize="small" />}
              label={`${ratings.length} ratings`}
              sx={{ bgcolor: `${currentTheme.accent}18`, color: currentTheme.accent, fontWeight: 800 }}
            />
          </Stack>
        </GlassPageHeader>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
        <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
          {ratings.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                type="no-data"
                title="No ratings found"
                description="Ratings returned by /api/admin/ratings will appear here."
              />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 980 }}>
                <TableHead sx={{ bgcolor: `${currentTheme.border}30` }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Review</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id} hover>
                      <TableCell>
                        <Typography fontWeight={800}>#{rating.id}</Typography>
                      </TableCell>
                      <TableCell>{rating.customerName || rating.userName || '—'}</TableCell>
                      <TableCell>{rating.productName || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={<Star sx={{ fontSize: '0.9rem !important' }} />}
                          label={rating.rating}
                          sx={{ bgcolor: 'rgba(245,158,11,0.16)', color: '#b45309', fontWeight: 800 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ maxWidth: 340, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rating.review || rating.comment || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{rating.createdAt || rating.updatedAt ? dayjs(rating.createdAt || rating.updatedAt).format('DD MMM YYYY') : '—'}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutline />}
                          disabled={isDeleting}
                          onClick={() => handleDelete(rating.id)}
                        >
                          Delete
                        </Button>
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
