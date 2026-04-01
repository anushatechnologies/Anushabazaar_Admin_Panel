import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Stack,
  keyframes,
} from '@mui/material';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const skeletonGradient = `
  linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  )
`;

interface SkeletonCardProps {
  count?: number;
  height?: number;
}

export const SkeletonStatCard: React.FC = () => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: skeletonGradient,
        backgroundSize: '200% 100%',
        animation: `${shimmer} 1.5s infinite`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={80} height={50} />
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={60} height={16} />
      </Box>
    </CardContent>
  </Card>
);

export const SkeletonStatCards: React.FC<SkeletonCardProps> = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
        <SkeletonStatCard />
      </Grid>
    ))}
  </Grid>
);

export const SkeletonTable: React.FC = () => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Stack
          key={index}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ py: 2, borderBottom: index < 4 ? '1px solid' : 'none', borderColor: 'divider' }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 4 }} />
        </Stack>
      ))}
    </Box>
  </Card>
);

export const SkeletonDocumentCard: React.FC = () => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Skeleton variant="rectangular" height={180} />
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 4 }} />
      </Stack>
      <Skeleton variant="text" width="80%" height={18} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={16} />
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width="50%" height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="50%" height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>
    </CardContent>
  </Card>
);

export const SkeletonDocumentGrid: React.FC<SkeletonCardProps> = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
        <SkeletonDocumentCard />
      </Grid>
    ))}
  </Grid>
);

export const SkeletonDetailView: React.FC = () => (
  <Grid container spacing={4}>
    <Grid size={{ xs: 12, md: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Skeleton
          variant="circular"
          width={120}
          height={120}
          sx={{ mx: 'auto', mb: 3 }}
        />
        <Skeleton variant="text" width="70%" height={32} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ mx: 'auto', borderRadius: 4 }} />
      </Card>
    </Grid>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          p: 3,
          mb: 3,
        }}
      >
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 6 }} key={index}>
              <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={24} />
            </Grid>
          ))}
        </Grid>
      </Card>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          p: 3,
        }}
      >
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="50%" height={16} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Grid>
  </Grid>
);

export const SkeletonPageHeader: React.FC = () => (
  <Box sx={{ mb: 4 }}>
    <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={200} height={20} />
  </Box>
);

export const SkeletonCharts: React.FC = () => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      p: 3,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 2 }} />
    </Stack>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
  </Card>
);

export const FullPageSkeleton: React.FC = () => (
  <Box sx={{ p: 4 }}>
    <SkeletonPageHeader />
    <SkeletonStatCards count={4} />
    <Box sx={{ mt: 4 }}>
      <SkeletonCharts />
    </Box>
    <Box sx={{ mt: 4 }}>
      <SkeletonTable />
    </Box>
  </Box>
);

export default {
  SkeletonStatCard,
  SkeletonStatCards,
  SkeletonTable,
  SkeletonDocumentCard,
  SkeletonDocumentGrid,
  SkeletonDetailView,
  SkeletonPageHeader,
  SkeletonCharts,
  FullPageSkeleton,
};
