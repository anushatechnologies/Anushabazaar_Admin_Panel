import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetProductsQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductGalleryImageMutation,
} from '../api/productApi';
import { ProductRequest } from '../api/productApi';
import { Product } from '../../category/types/index';
import ProductForm, { PendingGalleryUpload } from './ProductForm';
import { toast } from '../../../components/toast/ToastContainer';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Box,
  Tooltip,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { GlassPageHeader, GradientText, GlassCard } from '../../../components/glassmorphism/GlassComponents';
import { SkeletonPageHeader, SkeletonTable } from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { useAppTheme } from '@contexts/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function ProductList() {
  const { currentTheme, isDark } = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const { handleError } = useErrorHandler();

  const [debouncedSearch, setDebouncedSearch] = useState(searchKeyword);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchKeyword), 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Using RTK Query hooks
  const { data: allProducts, isLoading: productsLoading, isError: isAllError, error: allError } = useGetProductsQuery({});
  const { data: searchedProducts, isLoading: searchLoading, isError: isSearchError, error: searchError } = useSearchProductsQuery(debouncedSearch, {
    skip: debouncedSearch.trim().length === 0,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [addProductGalleryImage] = useAddProductGalleryImageMutation();

  const loading = productsLoading || searchLoading;
  const isError = isAllError || isSearchError;
  const error = allError || searchError;
  const products = debouncedSearch.trim().length > 0 ? (searchedProducts || []) : (allProducts || []);

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const handleSave = async (data: ProductRequest, imageFile?: File, galleryUploads: PendingGalleryUpload[] = []) => {
    try {
      let productId = editingProduct?.id;

      if (editingProduct) {
        const updatedProduct = await updateProduct({ id: editingProduct.id, product: data, image: imageFile }).unwrap();
        productId = updatedProduct?.id ?? editingProduct.id;
        toast.success('Product updated successfully');
      } else {
        const createdProduct = await createProduct({ product: data, image: imageFile }).unwrap();
        productId = createdProduct?.id;
        toast.success('Product created successfully');
      }

      if (productId && galleryUploads.length) {
        await Promise.all(
          galleryUploads.map((item) =>
            addProductGalleryImage({
              productId,
              image: item.file,
              displayOrder: item.displayOrder,
            }).unwrap()
          )
        );
        toast.success('Gallery images uploaded successfully');
      }

      setSearchKeyword('');
      setShowModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save product');
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete === null) return;
    try {
      await deleteProduct(productToDelete).unwrap();
      toast.success('Product deleted successfully');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete product');
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setShowModal(true);
  };

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentData = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading && !products.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError && !products.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <EmptyState
          type="error"
          title="Failed to load products"
          description="There was an error loading the products. Please try again."
          secondaryActionLabel="Retry"
          onSecondaryAction={() => window.location.reload()}
        />
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2 } 
          }}>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                <GradientText>Products</GradientText>
              </Typography>
              <Typography 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {products.length} products • Manage your product catalog
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              disabled={isCreating || isUpdating}
              fullWidth={false}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                textTransform: 'none',
                fontWeight: 600,
                background: currentTheme.accentGradient,
                boxShadow: isDark 
                  ? '0 4px 15px rgba(0, 245, 255, 0.4), 0 0 30px rgba(0, 245, 255, 0.2)' 
                  : currentTheme.shadow,
                py: { xs: 1, sm: 1.2 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: '140px' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: isDark 
                    ? '0 6px 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.3)' 
                    : currentTheme.hoverShadow,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Add Product
            </Button>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
            mb: { xs: 2, sm: 3 },
            p: { xs: 1.5, sm: 2 },
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: 2, sm: 3 },
            border: `1px solid ${currentTheme.border}`,
            boxShadow: currentTheme.shadow,
          }}
        >
          <TextField
            placeholder="Search products..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: currentTheme.accent }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 250, md: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, sm: 3 },
                background: currentTheme.inputBg,
                color: currentTheme.text,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '& fieldset': {
                  borderColor: currentTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: currentTheme.accent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: currentTheme.accent,
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: currentTheme.textSecondary,
              },
            }}
          />
        </Box>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard>
          {products.length === 0 ? (
            <EmptyState
              type={searchKeyword ? 'not-found' : 'empty'}
              title={searchKeyword ? 'No products found' : 'No products yet'}
              description={
                searchKeyword
                  ? `No results for "${searchKeyword}". Try a different search term.`
                  : 'Create your first product to get started.'
              }
              actionLabel={!searchKeyword ? 'Add Product' : undefined}
              onAction={!searchKeyword ? handleAddNew : undefined}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Image</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Variants</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>SubCategory</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Store</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Active</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Trending</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Best Seller</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: currentTheme.text }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {currentData.map((p, index) => (
                          <TableRow
                            key={p.id}
                            hover
                            component={motion.tr}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <TableCell>
                              {p.imageUrl ? (
                                <Avatar
                                  src={p.imageUrl}
                                  alt={p.name}
                                  variant="rounded"
                                  sx={{ width: 48, height: 48, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1,
                                    background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <ImageNotSupportedIcon color="disabled" />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600} sx={{ color: currentTheme.text }}>{p.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={p.variants?.map((v: any) => v.name).join(', ') || 'No variants'}>
                                <Chip
                                  label={`${p.variants?.length || 0} variant${p.variants?.length !== 1 ? 's' : ''}`}
                                  size="small"
                                  sx={{
                                    background: currentTheme.chipBg,
                                    color: currentTheme.accent,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    border: `1px solid ${currentTheme.border}`,
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: currentTheme.textSecondary }}>
                                {p.categoryName || p.categoryId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: currentTheme.textSecondary }}>
                                {p.subCategoryName || p.subCategoryId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: currentTheme.textSecondary }}>
                                {p.storeName || p.storeId || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={p.isActive ? 'Yes' : 'No'}
                                size="small"
                                sx={{
                                  background: p.isActive
                                    ? isDark ? 'rgba(0, 255, 157, 0.2)' : 'rgba(34, 197, 94, 0.15)'
                                    : isDark ? 'rgba(255, 71, 87, 0.2)' : 'rgba(156, 163, 175, 0.15)',
                                  color: p.isActive ? currentTheme.success : currentTheme.error,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={p.isTrending ? 'Yes' : 'No'}
                                size="small"
                                sx={{
                                  background: p.isTrending
                                    ? isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(59, 130, 246, 0.15)'
                                    : isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                  color: p.isTrending ? currentTheme.info : currentTheme.textSecondary,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={p.bestSeller ? 'Yes' : 'No'}
                                size="small"
                                sx={{
                                  background: p.bestSeller
                                    ? isDark ? 'rgba(255, 0, 255, 0.2)' : 'rgba(168, 85, 247, 0.15)'
                                    : isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                  color: p.bestSeller ? (isDark ? '#ff00ff' : '#9333ea') : currentTheme.textSecondary,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={() => handleEdit(p)}
                                    size="small"
                                    sx={{
                                      color: currentTheme.accent,
                                      background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                      '&:hover': { 
                                        background: isDark ? 'rgba(0, 245, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        boxShadow: isDark ? '0 0 10px rgba(0, 245, 255, 0.5)' : 'none',
                                      },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => {
                                      setProductToDelete(p.id);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    size="small"
                                    disabled={isDeleting && productToDelete === p.id}
                                    sx={{
                                      color: currentTheme.error,
                                      background: isDark ? 'rgba(255, 71, 87, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                      '&:hover': { 
                                        background: isDark ? 'rgba(255, 71, 87, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        boxShadow: isDark ? '0 0 10px rgba(255, 71, 87, 0.5)' : 'none',
                                      },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card View */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <AnimatePresence mode="popLayout">
                  {currentData.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 3,
                          background: currentTheme.cardBg,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${currentTheme.border}`,
                          boxShadow: currentTheme.shadow,
                          transition: 'all 0.3s ease',
                          '&:hover': isDark ? {
                            boxShadow: '0 8px 32px rgba(0, 245, 255, 0.3)',
                            border: '1px solid rgba(0, 245, 255, 0.4)',
                          } : {},
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          {p.imageUrl ? (
                            <Avatar
                              src={p.imageUrl}
                              alt={p.name}
                              variant="rounded"
                              sx={{ width: 64, height: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <ImageNotSupportedIcon color="disabled" />
                            </Box>
                          )}
                          <Box flex={1}>
                            <Typography fontWeight={700} fontSize="1rem" mb={0.5} sx={{ color: currentTheme.text }}>
                              {p.name}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                              <Chip
                                label={p.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                  background: p.isActive
                                    ? isDark ? 'rgba(0, 255, 157, 0.2)' : 'rgba(34, 197, 94, 0.15)'
                                    : isDark ? 'rgba(255, 71, 87, 0.2)' : 'rgba(156, 163, 175, 0.15)',
                                  color: p.isActive ? currentTheme.success : currentTheme.error,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  fontSize: '0.7rem',
                                }}
                              />
                              {p.isTrending && (
                                <Chip
                                  label="Trending"
                                  size="small"
                                  sx={{
                                    background: isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                                    color: currentTheme.info,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              )}
                              {p.bestSeller && (
                                <Chip
                                  label="Best Seller"
                                  size="small"
                                  sx={{
                                    background: isDark ? 'rgba(255, 0, 255, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                                    color: isDark ? '#ff00ff' : '#9333ea',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                              Category
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: currentTheme.text }}>
                              {p.categoryName || p.categoryId}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                              SubCategory
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: currentTheme.text }}>
                              {p.subCategoryName || p.subCategoryId}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                              Store
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: currentTheme.text }}>
                              {p.storeName || p.storeId || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                              Variants
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: currentTheme.text }}>
                              {p.variants?.length || 0}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => handleEdit(p)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              borderColor: currentTheme.border,
                              color: currentTheme.accent,
                              '&:hover': {
                                borderColor: currentTheme.accent,
                                background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                              },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => {
                              setProductToDelete(p.id);
                              setDeleteConfirmOpen(true);
                            }}
                            disabled={isDeleting && productToDelete === p.id}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>

              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: { xs: 2, sm: 3 }, 
                  pb: { xs: 1, sm: 2 },
                  px: { xs: 1, sm: 0 }
                }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 }
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.border}`,
            boxShadow: currentTheme.shadow,
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' },
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} component="span" sx={{ color: currentTheme.text }}>
            {editingProduct ? 'Edit Product' : 'Create Product'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: currentTheme.border }}>
          <ProductForm
            initialData={editingProduct || undefined}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will also delete all its variants and cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
      />
    </Box>
  );
}
