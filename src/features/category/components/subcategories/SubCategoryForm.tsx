import { useState, type ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material';
import { useCreateSubCategoryMutation, useUpdateSubCategoryMutation } from '../api/subCategoryApi';
import { toast } from '../../../../components/toast/ToastContainer';

import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

interface Props {
  initialData?: any;
  categoryId: number;
  onSave: () => void;
  onClose: () => void;
}

export default function SubCategoryForm({ initialData, categoryId, onSave, onClose }: Props) {
  const initialFormData = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    displayOrder: initialData?.displayOrder || 0,
    discount: initialData?.discount || 0,
    imageUrl: initialData?.imageUrl || '',
    videoUrl: initialData?.videoUrl || '',
    isActive: initialData?.isActive ?? true,
  };
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [formData, setFormData] = useState(initialFormData);

  const [createSubCategory, { isLoading: isCreating }] = useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] = useUpdateSubCategoryMutation();

  const isEdit = Boolean(initialData);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'displayOrder' || name === 'discount' ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        displayOrder: formData.displayOrder,
        discount: formData.discount,
        categoryId,
        isActive: formData.isActive,
        // Always send existing imageUrl so backend preserves it when no new file is uploaded
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
      };

      if (isEdit) {
        await updateSubCategory({
          id: initialData.id,
          subCategory: payload as any,
          image: imageFile || undefined,
        }).unwrap();
        toast.success('SubCategory updated successfully');
      } else {
        await createSubCategory({
          subCategory: payload as any,
          image: imageFile || undefined,
        }).unwrap();
        toast.success('SubCategory created successfully');
      }

      onSave();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Box mt={1}>
      <Stack spacing={2}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />

        <TextField
          label="Display Order"
          name="displayOrder"
          type="number"
          value={formData.displayOrder}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Discount (%)"
          name="discount"
          type="number"
          value={formData.discount}
          onChange={handleChange}
          fullWidth
        />

        <Box
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
            id="subcategory-image"
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
            <label htmlFor="subcategory-image" style={{ cursor: 'pointer' }}>
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
              </Box>
            </label>
          )}

          {imagePreview && (
            <label htmlFor="subcategory-image">
              <Button
                variant="outlined"
                component="span"
                size="small"
                startIcon={<ImageIcon />}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Change Image
              </Button>
            </label>
          )}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.checked,
                })
              }
            />
          }
          label="Active"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
