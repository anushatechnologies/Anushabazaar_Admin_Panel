import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardMedia,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowOutward as ArrowOutwardIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
  Banner,
} from '../api/bannerApi';
import {
  GlassPageHeader,
  GlassBadge,
  GradientText,
  GlassCard,
} from '../../../components/glassmorphism/GlassComponents';
import { SkeletonPageHeader, SkeletonTable } from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { toast } from '../../../components/toast/ToastContainer';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useGetCategoriesQuery } from '../../category/components/api/categoryApi';
import { useGetProductsQuery } from '../../products/api/productApi';
import { MenuItem, Select, Autocomplete, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useAppTheme } from '../../../contexts/ThemeContext';

interface BannerFormData {
  name: string;
  targetUrl: string;
  actionType: string;
  actionValue: string;
  displayOrder: number;
  image: File | null;
  video: File | null;
}

export default function BannersPage() {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const { handleError } = useErrorHandler();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<BannerFormData>({
    name: '',
    targetUrl: '',
    actionType: 'NONE',
    actionValue: '',
    displayOrder: 1,
    image: null,
    video: null,
  });

  const { data, isLoading, isError, error } = useGetBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleBannerStatusMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const banners = useMemo(() => data?.banners ?? [], [data?.banners]);

  const filteredBanners = useMemo(() => {
    return banners
      .filter((banner) => {
        const matchesSearch =
          banner.name.toLowerCase().includes(search.toLowerCase()) ||
          (banner.targetUrl && banner.targetUrl.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus =
          filterStatus === 'all'
            ? true
            : filterStatus === 'active'
              ? banner.isActive
              : !banner.isActive;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [banners, search, filterStatus]);

  const activeCount = useMemo(() => banners.filter((banner) => banner.isActive).length, [banners]);
  const videoCount = useMemo(
    () => banners.filter((banner) => Boolean(banner.videoUrl)).length,
    [banners],
  );
  const linkedCount = useMemo(
    () => banners.filter((banner) => banner.actionType && banner.actionType !== 'NONE').length,
    [banners],
  );

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      targetUrl: '',
      actionType: 'NONE',
      actionValue: '',
      displayOrder: banners.length + 1,
      image: null,
      video: null,
    });
    setImagePreview(null);
    setVideoPreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      targetUrl: banner.targetUrl || '',
      actionType: banner.actionType || 'NONE',
      actionValue: banner.actionValue || '',
      displayOrder: banner.displayOrder,
      image: null,
      video: null,
    });
    setImagePreview(banner.imageUrl);
    setVideoPreview(banner.videoUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBanner(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, video: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Banner name is required');
      return;
    }
    if (!editingBanner && !formData.image) {
      toast.error('Banner image is required');
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('name', formData.name);
    submitFormData.append('targetUrl', formData.targetUrl);
    submitFormData.append('actionType', formData.actionType);
    submitFormData.append('actionValue', formData.actionValue);
    submitFormData.append('displayOrder', String(formData.displayOrder));
    if (formData.image) submitFormData.append('image', formData.image);
    if (formData.video) submitFormData.append('video', formData.video);

    try {
      if (editingBanner) {
        await updateBanner({ id: editingBanner.id, formData: submitFormData }).unwrap();
        toast.success('Banner updated successfully');
      } else {
        await createBanner(submitFormData).unwrap();
        toast.success('Banner created successfully');
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save banner');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentStatus }).unwrap();
      toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBanner(deleteId).unwrap();
      toast.success('Banner deleted successfully');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete banner');
    }
  };

  const getActionChipLabel = (banner: Banner) => {
    if (!banner.actionType || banner.actionType === 'NONE') {
      return 'No action';
    }

    return banner.actionValue ? `${banner.actionType}: ${banner.actionValue}` : banner.actionType;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'grid', gap: { xs: 2.5, lg: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassPageHeader
          sx={{
            p: { xs: 2.5, md: 3.25 },
            background: isDark
              ? 'linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.88) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 55%, rgba(238,242,255,0.96) 100%)',
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12)}`,
            boxShadow: isDark
              ? '0 24px 48px rgba(2,6,23,0.34)'
              : '0 22px 40px rgba(79,70,229,0.10)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.4fr) minmax(320px, 0.92fr)' },
              alignItems: 'start',
            }}
          >
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                useFlexGap
                flexWrap="wrap"
              >
                <GlassBadge statusColor={theme.palette.primary.main}>
                  {filteredBanners.length} visible in current filter
                </GlassBadge>
                <GlassBadge statusColor={theme.palette.success.main}>
                  {activeCount} active creatives
                </GlassBadge>
                <GlassBadge statusColor={theme.palette.info.main}>
                  {videoCount} video banners
                </GlassBadge>
              </Stack>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.05,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  maxWidth: 760,
                }}
              >
                <GradientText>
                  Banner management with cleaner spacing and stronger balance
                </GradientText>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  maxWidth: 720,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.7,
                  display: 'none',
                }}
              >
                {filteredBanners.length} banners • Manage your app banners
              </Typography>
            </Box>
            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 720,
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.7,
              }}
            >
              The banner library now fills the page more naturally, so even a small number of
              creatives still looks polished instead of leaving awkward empty space.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                endIcon={<ArrowOutwardIcon />}
                onClick={handleOpenCreate}
                sx={{
                  px: 2.75,
                  py: 1.1,
                  borderRadius: 999,
                  minWidth: { xs: '100%', sm: 210 },
                  fontWeight: 700,
                }}
              >
                Create Banner
              </Button>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.25,
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(2, minmax(0, 1fr))',
                  },
                }}
              >
                {[
                  { label: 'Total', value: banners.length, tone: theme.palette.primary.main },
                  { label: 'Active', value: activeCount, tone: theme.palette.success.main },
                  { label: 'Linked', value: linkedCount, tone: theme.palette.info.main },
                  { label: 'Video', value: videoCount, tone: theme.palette.warning.main },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 1.6,
                      borderRadius: 3,
                      border: `1px solid ${alpha(item.tone, isDark ? 0.24 : 0.16)}`,
                      background: isDark
                        ? `linear-gradient(180deg, ${alpha(item.tone, 0.12)} 0%, rgba(15,23,42,0.72) 100%)`
                        : `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${alpha(item.tone, 0.08)} 100%)`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 800, color: item.tone }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
            p: 2.25,
            background: isDark
              ? 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.88) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(238,242,255,0.92) 100%)',
            backdropFilter: 'blur(14px)',
            borderRadius: 4,
            border: `1px solid ${alpha('#4f46e5', isDark ? 0.24 : 0.12)}`,
            alignItems: 'center',
            boxShadow: isDark
              ? '0 18px 36px rgba(2,8,23,0.24)'
              : '0 14px 28px rgba(79,70,229,0.08)',
          }}
        >
          <TextField
            placeholder="Search banners by name or link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.90)',
              },
            }}
          />

          <Box
            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { lg: 'flex-end' } }}
          >
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <Button
                key={status}
                size="small"
                variant={filterStatus === status ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus(status)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  px: 2,
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* Banners Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard sx={{ p: { xs: 2, md: 3 }, display: 'grid', gap: 2.5 }}>
          {filteredBanners.length === 0 ? (
            <EmptyState
              type={search ? 'not-found' : 'empty'}
              title={search ? 'No banners found' : 'No banners yet'}
              description={
                search ? `No results for "${search}"` : 'Create your first banner to get started'
              }
              actionLabel={!search ? 'Create Banner' : undefined}
              onAction={!search ? handleOpenCreate : undefined}
            />
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Creative Library
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                    Showing {filteredBanners.length} of {banners.length} banners
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <GlassBadge statusColor={theme.palette.success.main}>
                    {activeCount} active
                  </GlassBadge>
                  <GlassBadge statusColor={theme.palette.info.main}>
                    {linkedCount} linked
                  </GlassBadge>
                  <GlassBadge statusColor={theme.palette.warning.main}>
                    {videoCount} video
                  </GlassBadge>
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredBanners.map((banner, index) => (
                    <Box key={banner.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        style={{ height: '100%' }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4.5,
                            overflow: 'hidden',
                            boxShadow: isDark
                              ? '0 18px 36px rgba(2,8,23,0.26)'
                              : '0 12px 28px rgba(15,23,42,0.08)',
                            position: 'relative',
                            background: isDark
                              ? 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.9) 100%)'
                              : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                            border: `1px solid ${alpha(
                              banner.isActive ? theme.palette.primary.main : '#4f46e5',
                              isDark ? 0.2 : 0.08,
                            )}`,
                          }}
                        >
                          {/* Media Preview */}
                          <Box sx={{ position: 'relative', aspectRatio: '16 / 10' }}>
                            <CardMedia
                              component={banner.videoUrl ? 'video' : 'img'}
                              src={banner.videoUrl || banner.imageUrl}
                              alt={banner.name}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                backgroundColor: isDark ? 'rgba(15,23,42,0.75)' : '#f8fafc',
                              }}
                              controls={!!banner.videoUrl}
                            />
                            <Chip
                              label={banner.videoUrl ? 'Video' : 'Image'}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                background: 'rgba(15,23,42,0.68)',
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                            <Chip
                              label={banner.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                background: banner.isActive
                                  ? 'rgba(34, 197, 94, 0.9)'
                                  : 'rgba(156, 163, 175, 0.9)',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 999,
                                fontWeight: 600,
                              }}
                            >
                              Order: {banner.displayOrder}
                            </Typography>
                          </Box>

                          {/* Content */}
                          <Box sx={{ p: 2.25, display: 'grid', gap: 1.5, flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800} noWrap>
                              {banner.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={banner.targetUrl ? 'primary' : 'text.secondary'}
                              sx={{ display: 'block', mt: -0.5 }}
                              noWrap
                            >
                              {banner.targetUrl || 'No target URL provided'}
                            </Typography>

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              <Chip
                                label={getActionChipLabel(banner)}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ borderRadius: 999, height: 24, maxWidth: '100%' }}
                              />
                            </Stack>

                            {/* Actions */}
                            <Box
                              sx={{
                                mt: 'auto',
                                display: 'grid',
                                gap: 1,
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) auto',
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenEdit(banner)}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  minHeight: 40,
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color={banner.isActive ? 'warning' : 'success'}
                                startIcon={
                                  banner.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />
                                }
                                onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                                disabled={isToggling}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  minHeight: 40,
                                }}
                              >
                                {banner.isActive ? 'Hide' : 'Show'}
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteId(banner.id)}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  borderRadius: 999,
                                  minHeight: 40,
                                  minWidth: 40,
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    </Box>
                  ))}
                </AnimatePresence>
              </Box>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: isDark
              ? 'linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.94) 100%)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#4f46e5', isDark ? 0.22 : 0.1)}`,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Banner Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              label="Target URL (Optional)"
              fullWidth
              placeholder="https://..."
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              label="Display Order *"
              type="number"
              fullWidth
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
              }
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            {/* Action Type Selector */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="action-type-label">Action Type</InputLabel>
              <Select
                labelId="action-type-label"
                value={formData.actionType}
                label="Action Type"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    actionType: e.target.value as string,
                    actionValue: '',
                  });
                }}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="NONE">None (No Click Action)</MenuItem>
                <MenuItem value="CATEGORY">Category (Redirect to Category)</MenuItem>
                <MenuItem value="PRODUCT">Product (Redirect to Product Details)</MenuItem>
                <MenuItem value="OFFER">Offers Page</MenuItem>
                <MenuItem value="EXTERNAL">External Link (WebView)</MenuItem>
              </Select>
            </FormControl>

            {/* Action Value Selector */}
            {formData.actionType === 'CATEGORY' && (
              <CategorySelectorInternal
                value={formData.actionValue}
                onChange={(val) => setFormData({ ...formData, actionValue: val })}
              />
            )}

            {formData.actionType === 'PRODUCT' && (
              <ProductSelectorInternal
                value={formData.actionValue}
                onChange={(val) => setFormData({ ...formData, actionValue: val })}
              />
            )}

            {formData.actionType === 'EXTERNAL' && (
              <TextField
                label="External URL"
                value={formData.actionValue}
                onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                fullWidth
                placeholder="https://example.com"
                helperText="Full URL for external navigation"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            )}

            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Banner Image {!editingBanner && '*'}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                }}
              >
                {formData.image
                  ? formData.image.name
                  : imagePreview
                    ? 'Change Image'
                    : 'Upload Image'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mt: 2,
                  }}
                />
              )}
            </Box>

            {/* Video Upload */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Banner Video (Optional)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<VideocamIcon />}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                }}
              >
                {formData.video
                  ? formData.video.name
                  : videoPreview
                    ? 'Change Video'
                    : 'Upload Video'}
                <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
              </Button>
              {videoPreview && (
                <Box
                  component="video"
                  src={videoPreview}
                  controls
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    borderRadius: 2,
                    mt: 2,
                  }}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              isCreating ||
              isUpdating ||
              !formData.name.trim() ||
              (!editingBanner && !formData.image)
            }
            sx={{
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : editingBanner
                ? 'Update Banner'
                : 'Create Banner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Banner"
        message="Are you sure you want to permanently delete this banner? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

// --- INTERNAL SELECTORS FOR BannersPage ---

function CategorySelectorInternal({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data || [];

  return (
    <Autocomplete
      options={categories}
      getOptionLabel={(option) => option.name}
      loading={isLoading}
      value={categories.find((c) => c.id.toString() === value) || null}
      onChange={(_e, newValue) => {
        onChange(newValue ? newValue.id.toString() : '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Category"
          placeholder="Search categories..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
      )}
      fullWidth
    />
  );
}

function ProductSelectorInternal({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { data, isLoading } = useGetProductsQuery({});
  const products = data || [];

  return (
    <Autocomplete
      options={products}
      getOptionLabel={(option) => option.name}
      loading={isLoading}
      value={products.find((p) => p.id?.toString() === value) || null}
      onChange={(_e, newValue) => {
        onChange(newValue ? newValue.id?.toString() || '' : '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Product"
          placeholder="Search products..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
      )}
      fullWidth
    />
  );
}
