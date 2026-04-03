import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { toast } from '../../../components/toast/ToastContainer';
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
  Banner,
} from '../api/bannersApi';
import { useGetCategoriesQuery } from '../../category/components/api/categoryApi';
import { useGetProductsQuery } from '../../products/api/productApi';
import { 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Autocomplete,
  CircularProgress
} from '@mui/material';

interface BannerFormProps {
  initialData?: Banner | null;
  onClose: () => void;
}

export default function BannerForm({ initialData, onClose }: BannerFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetUrl, setTargetUrl] = useState(initialData?.targetUrl || '');
  const [actionType, setActionType] = useState(initialData?.actionType || 'NONE');
  const [actionValue, setActionValue] = useState(initialData?.actionValue || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [videoPreview, setVideoPreview] = useState<string | null>(initialData?.videoUrl || null);
  const [submitting, setSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Banner name is required');
      return;
    }

    if (!imageFile && !videoFile && !imagePreview && !videoPreview) {
      toast.error('Please upload an image or video');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('targetUrl', targetUrl.trim());
      formData.append('actionType', actionType);
      formData.append('actionValue', actionValue);
      formData.append('displayOrder', displayOrder.toString());
      formData.append('isActive', isActive.toString());

      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (videoFile) {
        formData.append('video', videoFile);
      }

      if (initialData?.id) {
        await updateBanner({ id: initialData.id, formData }).unwrap();
        toast.success('Banner updated successfully');
      } else {
        await createBanner(formData).unwrap();
        toast.success('Banner created successfully');
      }

      onClose();
    } catch (err) {
      toast.error(initialData?.id ? 'Failed to update banner' : 'Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: { xs: 1, sm: 2 },
        maxWidth: '100%',
        px: { xs: 0.5, sm: 1, md: 2 },
      }}
    >
      <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Banner Name */}
        <TextField
          label="Banner Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          autoFocus
          placeholder="e.g., Summer Sale 2024"
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
          }}
        />

        {/* Target URL */}
        <TextField
          label="Target URL"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          fullWidth
          placeholder="e.g., /category/electronics or https://example.com"
          helperText="Where users go when they click the banner"
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            },
          }}
        />
 
        {/* Action Type Selector */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="action-type-label">Action Type</InputLabel>
          <Select
            labelId="action-type-label"
            value={actionType}
            label="Action Type"
            onChange={(e) => {
              setActionType(e.target.value);
              setActionValue(''); // Reset value when type changes
            }}
            sx={{ borderRadius: { xs: 1.5, sm: 2 } }}
          >
            <MenuItem value="NONE">None (No Click Action)</MenuItem>
            <MenuItem value="CATEGORY">Category (Redirect to Category)</MenuItem>
            <MenuItem value="PRODUCT">Product (Redirect to Product Details)</MenuItem>
            <MenuItem value="OFFER">Offers Page</MenuItem>
            <MenuItem value="EXTERNAL">External Link (WebView)</MenuItem>
          </Select>
        </FormControl>

        {/* Action Value Selector */}
        {actionType === 'CATEGORY' && (
          <CategorySelector 
            value={actionValue} 
            onChange={setActionValue} 
          />
        )}

        {actionType === 'PRODUCT' && (
          <ProductSelector 
            value={actionValue} 
            onChange={setActionValue} 
          />
        )}

        {actionType === 'EXTERNAL' && (
          <TextField
            label="External URL"
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            fullWidth
            placeholder="https://example.com"
            helperText="Full URL for external navigation"
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: { xs: 1.5, sm: 2 },
              },
            }}
          />
        )}

        {/* Display Order */}
        <TextField
          label="Display Order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          fullWidth
          helperText="Lower numbers appear first (0, 1, 2, ...)"
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            },
          }}
        />

        {/* Active Status */}
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Active (visible to customers)
            </Typography>
          }
        />

        {/* Image Upload */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ImageIcon sx={{ color: '#667eea', fontSize: { xs: 20, sm: 24 } }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }}
            >
              Banner Image
            </Typography>
            {imagePreview && (
              <Chip
                label="Selected"
                size="small"
                color="success"
                sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={imageInputRef}
            id="banner-image"
          />

          {imagePreview ? (
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Banner preview"
                sx={{
                  width: '100%',
                  height: { xs: 120, sm: 150, md: 180 },
                  objectFit: 'cover',
                  borderRadius: { xs: 1.5, sm: 2 },
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  width: 28,
                  height: 28,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <label htmlFor="banner-image" style={{ display: 'block', width: '100%' }}>
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Click to upload image
              </Button>
            </label>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 1,
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            Recommended: 1200x600px, Max 10MB (JPG, PNG, WebP)
          </Typography>
        </Paper>

        {/* Video Upload */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <VideoIcon sx={{ color: '#8b5cf6', fontSize: { xs: 20, sm: 24 } }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }}
            >
              Banner Video (Optional)
            </Typography>
            {videoPreview && (
              <Chip
                label="Selected"
                size="small"
                color="success"
                sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: 'none' }}
            ref={videoInputRef}
            id="banner-video"
          />

          {videoPreview ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                component="video"
                src={videoPreview}
                controls
                sx={{
                  width: '100%',
                  height: { xs: 120, sm: 150, md: 180 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  objectFit: 'cover',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveVideo}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  width: 28,
                  height: 28,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <label htmlFor="banner-video" style={{ display: 'block', width: '100%' }}>
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Click to upload video
              </Button>
            </label>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 1,
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            Optional: Max 50MB (MP4, WebM). Video takes priority over image.
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ mt: { xs: 2, sm: 3 } }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            fullWidth
            variant="outlined"
            sx={{
              py: { xs: 1, sm: 1.2 },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              py: { xs: 1, sm: 1.2 },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              order: { xs: 1, sm: 2 },
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102,126,234,0.6)',
              },
            }}
          >
            {submitting
              ? initialData?.id
                ? 'Updating...'
                : 'Creating...'
              : initialData?.id
              ? 'Update Banner'
              : 'Create Banner'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// --- SUB-COMPONENTS ---

function CategorySelector({ value, onChange }: { value: string; onChange: (val: string) => void }) {
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
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: { xs: 1.5, sm: 2 },
            },
          }}
        />
      )}
      fullWidth
      sx={{ mb: 2 }}
    />
  );
}

function ProductSelector({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const { data, isLoading } = useGetProductsQuery({}); // Fetch all products for simplicity
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
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: { xs: 1.5, sm: 2 },
            },
          }}
        />
      )}
      fullWidth
      sx={{ mb: 2 }}
    />
  );
}
