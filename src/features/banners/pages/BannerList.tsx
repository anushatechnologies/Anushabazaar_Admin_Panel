import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Skeleton,
  Alert,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PlayCircle as VideoIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from '../../../components/toast/ToastContainer';
import {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  Banner,
} from '../api/bannersApi';
import { GlassPageHeader, GlassCard, GradientText, EmptyState } from '@/components/ui';
import BannerForm from './BannerForm';

export default function BannerList() {
  const { data, isLoading, error } = useGetAdminBannersQuery();
  const [toggleStatus] = useToggleBannerStatusMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);

  const banners = data?.banners || [];

  const handleAddNew = () => {
    setEditingBanner(null);
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowModal(true);
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      await toggleStatus({ id: banner.id, isActive: !banner.isActive }).unwrap();
      toast.success(`Banner ${banner.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      toast.error('Failed to update banner status');
    }
  };

  const handleDeleteClick = (id: number) => {
    setBannerToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteBanner(bannerToDelete).unwrap();
      toast.success('Banner deleted successfully');
      setDeleteConfirmOpen(false);
      setBannerToDelete(null);
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Failed to load banners. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassPageHeader>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                }}
              >
                <GradientText>Banners</GradientText>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {banners.length} banners • Manage promotional banners
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              fullWidth
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                py: { xs: 1, sm: 1.2 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: '140px' },
              }}
            >
              Add Banner
            </Button>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <GlassCard sx={{ mt: 3 }}>
          <EmptyState
            type="empty"
            title="No banners yet"
            description="Create your first promotional banner to display on the customer app."
            actionLabel="Add Banner"
            onAction={handleAddNew}
          />
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {banners.map((banner, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={banner.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BannerCard
                    banner={banner}
                    onEdit={() => handleEdit(banner)}
                    onToggleStatus={() => handleToggleStatus(banner)}
                    onDelete={() => handleDeleteClick(banner.id)}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBanner(null);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' },
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} component="span">
            {editingBanner ? 'Edit Banner' : 'Create Banner'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <BannerForm
            initialData={editingBanner}
            onClose={() => {
              setShowModal(false);
              setEditingBanner(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Delete Banner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this banner? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

// Banner Card Component
interface BannerCardProps {
  banner: Banner;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function BannerCard({ banner, onEdit, onToggleStatus, onDelete }: BannerCardProps) {
  const hasVideo = !!banner.videoUrl;
  const hasImage = !!banner.imageUrl;

  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid rgba(255, 255, 255, 0.5)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        },
        opacity: banner.isActive ? 1 : 0.7,
      }}
    >
      {/* Media Preview */}
      <Box sx={{ position: 'relative', height: { xs: 140, sm: 160 } }}>
        {hasImage ? (
          <CardMedia
            component="img"
            image={banner.imageUrl}
            alt={banner.name}
            sx={{
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : hasVideo ? (
          <Box
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoIcon sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
          </Box>
        )}

        {/* Status Badge */}
        <Chip
          label={banner.isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            left: { xs: 8, sm: 12 },
            background: banner.isActive
              ? 'rgba(34, 197, 94, 0.9)'
              : 'rgba(156, 163, 175, 0.9)',
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          }}
        />

        {/* Media Type Indicator */}
        {hasVideo && (
          <Chip
            icon={<VideoIcon sx={{ fontSize: 16 }} />}
            label="Video"
            size="small"
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          />
        )}
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {banner.name}
        </Typography>

        {banner.targetUrl && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 1,
            }}
          >
            {banner.targetUrl}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          >
            Order: {banner.displayOrder}
          </Typography>
        </Box>
      </CardContent>

      <CardActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          pt: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                color: 'primary.main',
                '&:hover': { background: 'rgba(99, 102, 241, 0.1)' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                color: 'error.main',
                '&:hover': { background: 'rgba(239, 68, 68, 0.1)' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Tooltip title={banner.isActive ? 'Disable' : 'Enable'}>
          <Switch
            checked={banner.isActive}
            onChange={onToggleStatus}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#22c55e',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#22c55e',
              },
            }}
          />
        </Tooltip>
      </CardActions>
    </Card>
  );
}
