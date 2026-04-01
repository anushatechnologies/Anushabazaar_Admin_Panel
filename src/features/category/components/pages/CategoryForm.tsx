import { useState } from 'react';
import { motion } from 'framer-motion';
import { CategoryRequest } from '../api/categoryApi';
import { toast } from '../../../../components/toast/ToastContainer';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
  Box,
  IconButton,
  Paper,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';

type Props = {
  initialData?: CategoryRequest & { id?: number; imageUrl?: string };
  onSave: (data: CategoryRequest, imageFile?: File) => void;
  onClose: () => void;
};

export default function CategoryForm({ initialData, onSave, onClose }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setUploading(true);
    try {
      await onSave(
        {
          name: name.trim(),
          description: description.trim(),
          displayOrder,
          isActive,
          discount,
          imageUrl: initialData?.imageUrl,
          videoUrl: initialData?.videoUrl,
        },
        imageFile || undefined,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TextField
            label="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Display Order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography color="text.secondary">#</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              label="Discount (%)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography color="text.secondary">%</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                sx={{
                  color: '#6366f1',
                  '&.Mui-checked': {
                    color: '#6366f1',
                  },
                }}
              />
            }
            label={
              <Typography fontWeight={500}>
                Active Category
              </Typography>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: imagePreview ? 'primary.main' : 'divider',
              background: imagePreview ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
              transition: 'all 0.3s ease',
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="category-image"
            />
            
            {imagePreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(undefined);
                  }}
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    bgcolor: 'error.main',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <label htmlFor="category-image" style={{ cursor: 'pointer' }}>
                <Box sx={{ py: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                    }}
                  >
                    <CloudUploadIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary">
                    Click to upload image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG up to 5MB
                  </Typography>
                </Box>
              </label>
            )}
            
            {imagePreview && (
              <label htmlFor="category-image">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  startIcon={<ImageIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Change Image
                </Button>
              </label>
            )}
          </Paper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              {uploading ? 'Saving...' : initialData?.id ? 'Update Category' : 'Create Category'}
            </Button>
          </Stack>
        </motion.div>
      </Stack>
    </Box>
  );
}
