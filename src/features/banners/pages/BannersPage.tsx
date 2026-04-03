import { useState, useMemo, useEffect } from 'react';
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
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useGetBannersQuery, useCreateBannerMutation, useToggleBannerStatusMutation, useDeleteBannerMutation, useUpdateBannerMutation, Banner } from '../api/bannerApi';
import { GlassPageHeader, GradientText, GlassCard } from '../../../components/glassmorphism/GlassComponents';
import { SkeletonPageHeader, SkeletonTable } from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { toast } from '../../../components/toast/ToastContainer';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useGetCategoriesQuery } from '../../category/components/api/categoryApi';
import { useGetProductsQuery } from '../../products/api/productApi';
import { 
  MenuItem, 
  Select, 
  Autocomplete,
  CircularProgress
} from '@mui/material';

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
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const banners = data?.banners || [];

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      const matchesSearch = banner.name.toLowerCase().includes(search.toLowerCase()) ||
        (banner.targetUrl && banner.targetUrl.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filterStatus === 'all' ? true :
        filterStatus === 'active' ? banner.isActive : !banner.isActive;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [banners, search, filterStatus]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <GradientText>Banner Management</GradientText>
              </Typography>
              <Typography color="text.secondary">
                {filteredBanners.length} banners • Manage your app banners
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              Create Banner
            </Button>
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
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
            p: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            alignItems: 'center',
          }}
        >
          <TextField
            placeholder="Search banners..."
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
              flex: 1,
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'white',
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <Button
                key={status}
                size="small"
                variant={filterStatus === status ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus(status)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
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
        <GlassCard>
          {filteredBanners.length === 0 ? (
            <EmptyState
              type={search ? 'not-found' : 'empty'}
              title={search ? 'No banners found' : 'No banners yet'}
              description={search ? `No results for "${search}"` : 'Create your first banner to get started'}
              actionLabel={!search ? 'Create Banner' : undefined}
              onAction={!search ? handleOpenCreate : undefined}
            />
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence mode="popLayout">
                {filteredBanners.map((banner, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={banner.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          position: 'relative',
                        }}
                      >
                        {/* Media Preview */}
                        <Box sx={{ position: 'relative', height: 180 }}>
                          <CardMedia
                            component={banner.videoUrl ? 'video' : 'img'}
                            src={banner.videoUrl || banner.imageUrl}
                            alt={banner.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            controls={!!banner.videoUrl}
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
                              borderRadius: 1,
                              fontWeight: 600,
                            }}
                          >
                            Order: {banner.displayOrder}
                          </Typography>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {banner.name}
                          </Typography>
                          {banner.targetUrl && (
                            <Typography
                              variant="caption"
                              color="primary"
                              sx={{ display: 'block', mt: 0.5 }}
                              noWrap
                            >
                              {banner.targetUrl}
                            </Typography>
                          )}

                          {banner.actionType && banner.actionType !== 'NONE' && (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`${banner.actionType}: ${banner.actionValue || 'N/A'}`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ borderRadius: 1, height: 20, fontSize: '0.65rem' }}
                              />
                            </Box>
                          )}

                          {/* Actions */}
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEdit(banner)}
                              sx={{
                                flex: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color={banner.isActive ? 'warning' : 'success'}
                              startIcon={banner.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                              disabled={isToggling}
                              sx={{
                                flex: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
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
                                borderRadius: 2,
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
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
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
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
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
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
                  setFormData({ ...formData, actionType: e.target.value as string, actionValue: '' });
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
                {formData.image ? formData.image.name : imagePreview ? 'Change Image' : 'Upload Image'}
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
                {formData.video ? formData.video.name : videoPreview ? 'Change Video' : 'Upload Video'}
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
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating || !formData.name.trim() || (!editingBanner && !formData.image)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {isCreating || isUpdating ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
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

function CategorySelectorInternal({ value, onChange }: { value: string; onChange: (val: string) => void }) {
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

function ProductSelectorInternal({ value, onChange }: { value: string; onChange: (val: string) => void }) {
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
