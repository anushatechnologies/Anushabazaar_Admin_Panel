import { useState, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetCategoriesQuery,
  useSearchCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useHardDeleteCategoryMutation,
  Category,
  CategoryRequest,
} from '../api/categoryApi';
import CategoryForm from './CategoryForm';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { toast } from '../../../../components/toast/ToastContainer';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
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
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from '@mui/icons-material';
import {
  GlassPageHeader,
  GradientText,
  GlassCard,
} from '../../../../components/glassmorphism/GlassComponents';
import {
  SkeletonPageHeader,
  SkeletonTable,
} from '../../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../../components/empty-state/EmptyState';
import { useAppTheme } from '@contexts/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function CategoryList() {
  const { currentTheme, isDark } = useAppTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const { handleError } = useErrorHandler();

  const [debouncedSearch, setDebouncedSearch] = useState(searchKeyword);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchKeyword), 250);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Using RTK Query hooks
  const {
    data: allCategories,
    isLoading: categoriesLoading,
    isError: isAllError,
    error: allError,
  } = useGetCategoriesQuery(undefined, {
    skip: debouncedSearch.trim().length > 0,
  });
  const {
    data: searchedCategories,
    isLoading: searchLoading,
    isError: isSearchError,
    error: searchError,
  } = useSearchCategoriesQuery(debouncedSearch, {
    skip: debouncedSearch.trim().length === 0,
  });

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [hardDeleteCategory, { isLoading: isDeleting }] = useHardDeleteCategoryMutation();

  const loading = categoriesLoading || searchLoading;
  const isError = isAllError || isSearchError;
  const error = allError || searchError;
  const categories =
    debouncedSearch.trim().length > 0 ? searchedCategories || [] : allCategories || [];

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const handleSave = async (data: CategoryRequest, imageFile?: File) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: data, image: imageFile }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory({ data: data, image: imageFile }).unwrap();
        toast.success('Category created successfully');
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hardDeleteCategory(id).unwrap();
      toast.success('Category deleted permanently');
      setConfirmId(null);
    } catch (err: any) {
      const status = err?.status;
      if (status === 403) {
        toast.error('Access denied (403). Please login with an admin or super admin account.');
      } else if (status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(err?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const currentData = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading && !categories.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError && !categories.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <EmptyState
          type="error"
          title="Failed to load categories"
          description={
            error
              ? `Error: ${JSON.stringify(error)}`
              : 'There was an error loading the categories. Please try again.'
          }
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <GradientText>Categories</GradientText>
              </Typography>
              <Typography color="text.secondary">
                {categories.length} categories • Manage your product categories
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              disabled={isCreating || isUpdating}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                background: currentTheme.accentGradient,
                boxShadow: isDark
                  ? '0 4px 15px rgba(0, 245, 255, 0.4), 0 0 30px rgba(0, 245, 255, 0.2)'
                  : currentTheme.shadow,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: isDark
                    ? '0 6px 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.3)'
                    : currentTheme.hoverShadow,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Add Category
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
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
            p: 2,
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${currentTheme.border}`,
            boxShadow: currentTheme.shadow,
          }}
        >
          <TextField
            placeholder="Search categories by name or description..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: currentTheme.accent }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: currentTheme.inputBg,
                color: currentTheme.text,
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
          {categories.length === 0 ? (
            <EmptyState
              type={searchKeyword ? 'not-found' : 'empty'}
              title={searchKeyword ? 'No categories found' : 'No categories yet'}
              description={
                searchKeyword
                  ? `No results for "${searchKeyword}". Try a different search term.`
                  : 'Create your first category to get started.'
              }
              actionLabel={!searchKeyword ? 'Add Category' : undefined}
              onAction={!searchKeyword ? handleAddNew : undefined}
            />
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ boxShadow: 'none', background: 'transparent' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Image
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Order
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Discount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: currentTheme.text }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {currentData.map((cat, index) => (
                        <TableRow
                          key={cat.id}
                          hover
                          component={motion.tr}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell>
                            {cat.imageUrl ? (
                              <Avatar
                                src={cat.imageUrl}
                                alt={cat.name}
                                variant="rounded"
                                sx={{
                                  width: 48,
                                  height: 48,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
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
                            <Typography fontWeight={600} sx={{ color: currentTheme.text }}>
                              {cat.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{ color: currentTheme.textSecondary, maxWidth: 200 }}
                              noWrap
                            >
                              {cat.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cat.displayOrder}
                              size="small"
                              sx={{
                                background: currentTheme.chipBg,
                                color: currentTheme.accent,
                                fontWeight: 600,
                                borderRadius: 2,
                                border: `1px solid ${currentTheme.border}`,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {cat.discount > 0 ? (
                              <Chip
                                label={`${cat.discount}%`}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  background: isDark
                                    ? 'rgba(0, 255, 157, 0.2)'
                                    : 'rgba(34, 197, 94, 0.15)',
                                  color: currentTheme.success,
                                }}
                              />
                            ) : (
                              <Typography sx={{ color: currentTheme.textSecondary }}>—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cat.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                background: cat.isActive
                                  ? isDark
                                    ? 'rgba(0, 255, 157, 0.2)'
                                    : 'rgba(34, 197, 94, 0.15)'
                                  : isDark
                                    ? 'rgba(255, 71, 87, 0.2)'
                                    : 'rgba(156, 163, 175, 0.15)',
                                color: cat.isActive ? currentTheme.success : currentTheme.error,
                                fontWeight: 600,
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEdit(cat)}
                                  size="small"
                                  sx={{
                                    color: currentTheme.accent,
                                    background: isDark
                                      ? 'rgba(0, 245, 255, 0.1)'
                                      : 'rgba(99, 102, 241, 0.1)',
                                    '&:hover': {
                                      background: isDark
                                        ? 'rgba(0, 245, 255, 0.2)'
                                        : 'rgba(99, 102, 241, 0.2)',
                                      boxShadow: isDark
                                        ? '0 0 10px rgba(0, 245, 255, 0.5)'
                                        : 'none',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => setConfirmId(cat.id)}
                                  size="small"
                                  disabled={isDeleting && confirmId === cat.id}
                                  sx={{
                                    color: currentTheme.error,
                                    background: isDark
                                      ? 'rgba(255, 71, 87, 0.1)'
                                      : 'rgba(239, 68, 68, 0.1)',
                                    '&:hover': {
                                      background: isDark
                                        ? 'rgba(255, 71, 87, 0.2)'
                                        : 'rgba(239, 68, 68, 0.2)',
                                      boxShadow: isDark
                                        ? '0 0 10px rgba(255, 71, 87, 0.5)'
                                        : 'none',
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

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handleChangePage}
                    color="primary"
                    shape="rounded"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
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
          setEditingCategory(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.border}`,
            boxShadow: currentTheme.shadow,
          },
        }}
      >
        <DialogTitle component="div">
          <Typography variant="h6" fontWeight={700} sx={{ color: currentTheme.text }}>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: currentTheme.border }}>
          <CategoryForm
            initialData={editingCategory || undefined}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete Category"
        message="Are you sure you want to permanently delete this category? This action cannot be undone."
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </Box>
  );
}
