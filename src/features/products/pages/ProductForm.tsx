import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { Close, Delete, PhotoLibrary, Upload } from '@mui/icons-material';
import { useGetStoreTypesQuery } from '../../store_type/api/storeapi';
import { useGetCategoriesQuery } from '../../category/components/api/categoryApi';
import { useGetSubCategoriesByCategoryQuery } from '../../category/components/api/subCategoryApi';
import {
  ProductGalleryImage,
  ProductRequest,
  useDeleteProductGalleryImageMutation,
  useGetProductByIdQuery,
  useUpdateProductGalleryImageMutation,
  VariantRequest,
} from '../api/productApi';
import VariantForm from '../components/VariantForm';
import toast from 'react-hot-toast';

export type PendingGalleryUpload = {
  file: File;
  previewUrl: string;
  displayOrder: number;
};

type Props = {
  initialData?: any;
  onSave: (
    data: ProductRequest,
    imageFile?: File,
    videoFile?: File,
    galleryUploads?: PendingGalleryUpload[],
  ) => Promise<void> | void;
  onClose: () => void;
};

export default function ProductForm({ initialData, onSave, onClose }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending ?? false);
  const [bestSeller, setBestSeller] = useState(initialData?.bestSeller ?? false);
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder || 0);
  const [categoryId, setCategoryId] = useState<number>(initialData?.categoryId || 0);
  const [subCategoryId, setSubCategoryId] = useState<number>(initialData?.subCategoryId || 0);
  const [storeId, setStoreId] = useState<number>(initialData?.storeId ?? 0);
  const [variants, setVariants] = useState<VariantRequest[]>(() => {
    if (initialData?.variants?.length) {
      return initialData.variants.map((v: any) => ({
        name: v.name || '',
        sku: v.sku || '',
        price: Number(v.price || 0),
        discountPrice: v.discountPrice,
        stock: Number(v.stock || 0),
        isActive: v.isActive ?? true,
        displayOrder: Number(v.displayOrder || 1),
      }));
    }
    return [
      {
        name: '',
        sku: '',
        price: 0,
        discountPrice: undefined,
        stock: 0,
        isActive: true,
        displayOrder: 1,
      },
    ];
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | undefined>(initialData?.videoUrl);
  const [pendingGalleryUploads, setPendingGalleryUploads] = useState<PendingGalleryUpload[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const pendingGalleryUrlsRef = useRef<string[]>([]);
  const videoPreviewRef = useRef<string | undefined>(initialData?.videoUrl);

  const { data: storesData, isLoading: storesLoading } = useGetStoreTypesQuery({});
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: subCategoriesData, isFetching: loadingSubs } = useGetSubCategoriesByCategoryQuery(
    categoryId,
    { skip: !categoryId },
  );
  const { data: productDetail } = useGetProductByIdQuery(initialData?.id, {
    skip: !initialData?.id,
  });
  const [updateProductGalleryImage, { isLoading: updatingGallery }] =
    useUpdateProductGalleryImageMutation();
  const [deleteProductGalleryImage, { isLoading: deletingGallery }] =
    useDeleteProductGalleryImageMutation();

  const stores =
    storesData && 'content' in (storesData as any)
      ? (storesData as any).content
      : Array.isArray(storesData)
        ? storesData
        : [];
  const categories = categoriesData || [];
  const subCategories = subCategoriesData || [];

  const existingGalleryImages: ProductGalleryImage[] = useMemo(() => {
    const detail = productDetail as any;
    return (
      detail?.images ||
      detail?.galleryImages ||
      initialData?.images ||
      initialData?.galleryImages ||
      []
    );
  }, [initialData, productDetail]);

  useEffect(() => {
    pendingGalleryUrlsRef.current = pendingGalleryUploads.map((item) => item.previewUrl);
  }, [pendingGalleryUploads]);

  useEffect(() => {
    videoPreviewRef.current = videoPreview;
  }, [videoPreview]);

  useEffect(() => {
    return () => {
      pendingGalleryUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      if (videoPreviewRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewRef.current);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGallerySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextUploads = files.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      displayOrder: existingGalleryImages.length + pendingGalleryUploads.length + index + 1,
    }));

    setPendingGalleryUploads((current) => [...current, ...nextUploads]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handlePendingGalleryOrderChange = (index: number, displayOrder: number) => {
    setPendingGalleryUploads((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, displayOrder } : item)),
    );
  };

  const removePendingGalleryUpload = (index: number) => {
    setPendingGalleryUploads((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleUpdateExistingGalleryOrder = async (imageId: number, displayOrder: number) => {
    try {
      await updateProductGalleryImage({ imageId, displayOrder }).unwrap();
      toast.success('Gallery image updated');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update gallery image');
    }
  };

  const handleDeleteExistingGallery = async (imageId: number) => {
    try {
      await deleteProductGalleryImage(imageId).unwrap();
      toast.success('Gallery image removed');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to remove gallery image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim()) return toast.error('Product name is required');
    if (!categoryId) return toast.error('Please select a category');
    if (!subCategoryId) return toast.error('Please select a subcategory');
    if (!storeId) return toast.error('Please select a store');
    if (!variants.length) return toast.error('At least one variant is required');

    for (let index = 0; index < variants.length; index += 1) {
      const variant = variants[index];
      if (!variant.name.trim()) return toast.error(`Variant ${index + 1}: Name is required`);
      if (!variant.sku.trim()) return toast.error(`Variant ${index + 1}: SKU is required`);
      if (variant.price <= 0)
        return toast.error(`Variant ${index + 1}: Price must be greater than 0`);
      if (variant.stock < 0) return toast.error(`Variant ${index + 1}: Stock cannot be negative`);
    }

    if (!initialData?.id && !imageFile) {
      return toast.error('Please select a main product image');
    }

    const productData: ProductRequest = {
      name: name.trim(),
      description: description.trim(),
      isActive,
      isTrending,
      bestSeller,
      displayOrder,
      categoryId,
      subCategoryId,
      storeId,
      variants,
    };

    setSubmitting(true);
    try {
      await onSave(
        productData,
        imageFile || undefined,
        videoFile || undefined,
        pendingGalleryUploads,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderImageCard = (key: string | number, content: React.ReactNode) => (
    <Paper
      key={key}
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 3, display: 'grid', gap: 1.25, minWidth: 170 }}
    >
      <Box sx={{ display: 'grid', gap: 1.25 }}>{content}</Box>
    </Paper>
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, px: 1, py: 1 }}>
      <Stack spacing={2.5}>
        <TextField
          label="Product Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
        />

        <FormControl fullWidth disabled={categoriesLoading}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={
              categories.some((category: any) => Number(category.id) === categoryId)
                ? categoryId
                : ''
            }
            onChange={(e) => setCategoryId(Number(e.target.value))}
            label="Category *"
          >
            <MenuItem value="">{categoriesLoading ? 'Loading...' : 'Select a category'}</MenuItem>
            {categories.map((category: any) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!categoryId || loadingSubs}>
          <InputLabel>SubCategory *</InputLabel>
          <Select
            value={
              subCategories.some((subCategory: any) => Number(subCategory.id) === subCategoryId)
                ? subCategoryId
                : ''
            }
            onChange={(e) => setSubCategoryId(Number(e.target.value))}
            label="SubCategory *"
          >
            <MenuItem value="">{loadingSubs ? 'Loading...' : 'Select a subcategory'}</MenuItem>
            {subCategories.map((subCategory: any) => (
              <MenuItem key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={storesLoading}>
          <InputLabel>Store *</InputLabel>
          <Select
            value={stores.some((store: any) => Number(store.id) === storeId) ? storeId : ''}
            onChange={(e) => setStoreId(Number(e.target.value))}
            label="Store *"
          >
            <MenuItem value="">{storesLoading ? 'Loading stores...' : 'Select a store'}</MenuItem>
            {stores.map((store: any) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Display Order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          fullWidth
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <FormControlLabel
            control={
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} />
            }
            label="Best Seller"
          />
          <FormControlLabel
            control={
              <Checkbox checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
            }
            label="Trending"
          />
        </Stack>

        <VariantForm variants={variants} onChange={setVariants} />

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'grid', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Main thumbnail
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is the primary image shown in the product list and product card.
              </Typography>
            </Box>
            <Chip
              label={imagePreview ? 'Image selected' : 'No image selected'}
              color={imagePreview ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="product-image"
          />
          <label htmlFor="product-image">
            <Button component="span" variant="outlined" startIcon={<Upload />}>
              {imagePreview ? 'Replace main image' : 'Upload main image'}
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ position: 'relative', width: 144 }}>
              <img
                src={imagePreview}
                alt="Main preview"
                style={{ width: 144, height: 144, objectFit: 'cover', borderRadius: 16 }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(undefined);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(15,23,42,0.8)',
                  color: '#fff',
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'grid', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Product video
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optional. Upload a short product video to show in the product details.
              </Typography>
            </Box>
            <Chip
              label={videoPreview ? 'Video ready' : 'Optional'}
              color={videoPreview ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: 'none' }}
            id="product-video"
          />
          <label htmlFor="product-video">
            <Button component="span" variant="outlined" startIcon={<Upload />}>
              {videoPreview ? 'Replace product video' : 'Upload product video'}
            </Button>
          </label>
          {initialData?.videoUrl && !videoFile && (
            <Typography variant="caption" color="text.secondary">
              Current video is already saved. Upload a new file only if you want to replace it.
            </Typography>
          )}
          {videoPreview && (
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 280 }}>
              <Box
                component="video"
                src={videoPreview}
                controls
                sx={{ width: '100%', maxHeight: 220, borderRadius: 2, backgroundColor: '#000' }}
              />
              {videoFile && (
                <IconButton
                  size="small"
                  onClick={() => {
                    if (videoPreview?.startsWith('blob:')) {
                      URL.revokeObjectURL(videoPreview);
                    }
                    setVideoFile(null);
                    setVideoPreview(initialData?.videoUrl);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(15,23,42,0.8)',
                    color: '#fff',
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'grid', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Gallery manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add secondary product images here. Each image has its own remove button, and you can
                change the display order.
              </Typography>
            </Box>
            <Chip
              icon={<PhotoLibrary fontSize="small" />}
              label={`${existingGalleryImages.length + pendingGalleryUploads.length} image${existingGalleryImages.length + pendingGalleryUploads.length === 1 ? '' : 's'}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <input
              multiple
              type="file"
              accept="image/*"
              onChange={handleGallerySelection}
              style={{ display: 'none' }}
              id="gallery-images"
            />
            <label htmlFor="gallery-images">
              <Button component="span" variant="outlined" startIcon={<Upload />}>
                Add images to gallery
              </Button>
            </label>
          </Box>

          {!!existingGalleryImages.length && (
            <>
              <Typography variant="subtitle2" fontWeight={700}>
                Existing gallery images
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {existingGalleryImages.map((image) =>
                  renderImageCard(
                    image.id,
                    <>
                      <img
                        src={image.imageUrl}
                        alt="Gallery"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }}
                      />
                      <TextField
                        size="small"
                        label="Display Order"
                        type="number"
                        defaultValue={image.displayOrder}
                        onBlur={(e) =>
                          handleUpdateExistingGalleryOrder(image.id, Number(e.target.value))
                        }
                      />
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={deletingGallery ? <CircularProgress size={14} /> : <Delete />}
                        onClick={() => handleDeleteExistingGallery(image.id)}
                        disabled={deletingGallery || updatingGallery}
                      >
                        Delete this image
                      </Button>
                    </>,
                  ),
                )}
              </Box>
              <Divider />
            </>
          )}

          {!!pendingGalleryUploads.length && (
            <>
              <Typography variant="subtitle2" fontWeight={700}>
                New images to upload
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {pendingGalleryUploads.map((item, index) =>
                  renderImageCard(
                    `${item.file.name}-${index}`,
                    <>
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }}
                      />
                      <TextField
                        size="small"
                        label="Display Order"
                        type="number"
                        value={item.displayOrder}
                        onChange={(e) =>
                          handlePendingGalleryOrderChange(index, Number(e.target.value))
                        }
                      />
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => removePendingGalleryUpload(index)}
                      >
                        Remove before save
                      </Button>
                    </>,
                  ),
                )}
              </Box>
            </>
          )}

          {!existingGalleryImages.length && !pendingGalleryUploads.length && (
            <Typography variant="body2" color="text.secondary">
              No gallery images yet. Use "Add images to gallery" to upload more product photos.
            </Typography>
          )}
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting || storesLoading}>
            {submitting ? 'Saving...' : initialData?.id ? 'Update Product' : 'Create Product'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
