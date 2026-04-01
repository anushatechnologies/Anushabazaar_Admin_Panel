import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
} from '../api/subCategoryApi';
import { toast } from '../../../../components/toast/ToastContainer';

interface Props {
  initialData?: any;
  categoryId: number;
  onSave: () => void;
  onClose: () => void;
}

export default function SubCategoryForm({
  initialData,
  categoryId,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    discount: 0,
    imageUrl: '',
    videoUrl: '',
    isActive: true,
  });

  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubCategoryMutation();

  const isEdit = Boolean(initialData);

  // Load edit data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        displayOrder: initialData.displayOrder || 0,
        discount: initialData.discount || 0,
        imageUrl: initialData.imageUrl || '',
        videoUrl: initialData.videoUrl || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === 'displayOrder' || name === 'discount'
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        categoryId,
      };

      if (isEdit) {
        await updateSubCategory({
          id: initialData.id,
          body: payload,
        }).unwrap();
        toast.success('SubCategory updated successfully');
      } else {
        await createSubCategory(payload).unwrap();
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

        <TextField
          label="Image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Video URL"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          fullWidth
        />

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

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}