import React, { useState } from 'react';
import { 
  Box, Typography, Card, Button, Stack, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel, Switch
} from '@mui/material';
import ReusableTable from '../../../components/common/ReusableTable';
import { useGetAdminBannersQuery, useCreateBannerMutation } from '../api/bannersApi';
import toast from 'react-hot-toast';

export default function BannersList() {
  const { data, isLoading, refetch } = useGetAdminBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
    displayOrder: 1
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | undefined>();

  const bannerList: any[] = Array.isArray(data) ? data : (data?.banners || data?.data || data?.content || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async () => {
    try {
      await createBanner({
        banner: {
          name: formData.name,
          isActive: formData.isActive,
          displayOrder: Number(formData.displayOrder)
        },
        image: imageFile || undefined,
        video: videoFile || undefined
      }).unwrap();
      toast.success('Banner created successfully');
      setOpen(false);
      setFormData({ name: '', isActive: true, displayOrder: 1 });
      setImageFile(null); setImagePreview(undefined);
      setVideoFile(null); setVideoPreview(undefined);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create banner');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Marketing Banners</Typography>
          <Typography color="text.secondary">Manage promotional banners for the app</Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Banner
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <ReusableTable
          columns={[
            { 
              header: 'Image', 
              key: 'imageUrl',
              render: (row: any) => (
                <Box
                  component="img"
                  src={row.imageUrl}
                  alt={row.name}
                  sx={{ width: 100, height: 50, objectFit: 'cover', borderRadius: 1 }}
                />
              )
            },
            { header: 'Name', key: 'name' },
            { header: 'Order', key: 'displayOrder' },
            { 
              header: 'Status', 
              key: 'isActive',
              render: (row: any) => (
                <Chip 
                  label={row.isActive ? 'Active' : 'Inactive'} 
                  color={row.isActive ? 'success' : 'default'}
                  size="small"
                />
              )
            }
          ]}
          data={bannerList}
          loading={isLoading}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Banner</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            name="name" label="Banner Name" fullWidth required
            value={formData.name} onChange={handleChange}
          />
          <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
            <Button variant="outlined" component="label">
              Upload Image *
              <input type="file" hidden accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} />
            </Button>
            {imagePreview && (
              <Box mt={2}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 150, objectFit: 'contain' }} />
                <Button size="small" color="error" onClick={() => { setImageFile(null); setImagePreview(undefined); }}>Remove Image</Button>
              </Box>
            )}
          </Box>
          <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
            <Button variant="outlined" component="label">
              Upload Video (Optional)
              <input type="file" hidden accept="video/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoFile(file);
                  setVideoPreview(URL.createObjectURL(file));
                }
              }} />
            </Button>
            {videoPreview && (
              <Box mt={2}>
                <video src={videoPreview} controls autoPlay style={{ width: '100%', maxHeight: 150, objectFit: 'contain' }} />
                <Button size="small" color="error" onClick={() => { setVideoFile(null); setVideoPreview(undefined); }}>Remove Video</Button>
              </Box>
            )}
          </Box>
          <TextField 
            name="displayOrder" label="Display Order" type="number" fullWidth
            value={formData.displayOrder} onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Switch name="isActive" checked={formData.isActive} onChange={handleChange} />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={isCreating || !formData.name || !imageFile}>
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
