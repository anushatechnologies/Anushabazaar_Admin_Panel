import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAllSubCategoriesQuery,
  useGetSubCategoriesByCategoryQuery,
  useHardDeleteSubCategoryMutation,
} from '../api/subCategoryApi';
import { useGetCategoriesQuery } from '../api/categoryApi';
import SubCategoryForm from './SubCategoryForm';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Link,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from '@mui/icons-material';
import { GlassPageHeader, GradientText, GlassCard } from '../../../../components/glassmorphism/GlassComponents';
import { SkeletonPageHeader, SkeletonTable } from '../../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../../components/empty-state/EmptyState';
import { useAppTheme } from '@contexts/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function SubCategoryList() {
  const { currentTheme, isDark } = useAppTheme();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categoryId ? parseInt(categoryId) : 0
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { handleError } = useErrorHandler();

  // RTK Query hooks
  const { data: categoriesData, isError: isCatError, error: catError } = useGetCategoriesQuery();
  const categories = categoriesData || [];

  const { 
    data: allSubCategories, 
    isLoading: allLoading, 
    isError: isAllError, 
    error: allError 
  } = useGetAllSubCategoriesQuery(undefined, {
    skip: !!selectedCategoryId,
  });
  const { 
    data: catSubCategories, 
    isLoading: catLoading, 
    isError: isCatSubError, 
    error: catSubError 
  } = useGetSubCategoriesByCategoryQuery(selectedCategoryId, {
    skip: !selectedCategoryId,
  });

  const [hardDeleteSubCategory, { isLoading: isDeleting }] = useHardDeleteSubCategoryMutation();

  const loading = allLoading || catLoading;
  const isError = isAllError || isCatSubError || isCatError;
  const error = allError || catSubError || catError;
  const subCategories = selectedCategoryId ? (catSubCategories || []) : (allSubCategories || []);

  const filteredSubCategories = subCategories.filter(sc =>
    searchKeyword
      ? sc.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (sc.description && sc.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      : true
  );

  useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const totalPages = Math.ceil(filteredSubCategories.length / ITEMS_PER_PAGE);
  const currentData = filteredSubCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSave = () => {
    setShowModal(false);
    setEditingSub(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await hardDeleteSubCategory(id).unwrap();
      toast.success('SubCategory deleted permanently');
      setConfirmId(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete subcategory');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleAddNew = () => {
    setEditingSub(null);
    setShowModal(true);
  };

  const handleEdit = (sc: any) => {
    setEditingSub(sc);
    setShowModal(true);
  };

  if (loading && !filteredSubCategories.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError && !filteredSubCategories.length) {
    return (
      <Box sx={{ p: 4, background: currentTheme.bg, minHeight: '100vh' }}>
        <EmptyState
          type="error"
          title="Failed to load subcategories"
          description="There was an error loading the subcategories. Please try again."
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <GradientText>SubCategories</GradientText>
              </Typography>
              <Typography color="text.secondary">
                {filteredSubCategories.length} subcategories • Manage your product subcategories
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: currentTheme.textSecondary }}>Category</InputLabel>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    const catId = Number(e.target.value);
                    setSelectedCategoryId(catId);
                    navigate(catId ? `/subcategories/${catId}` : '/subcategories');
                  }}
                  label="Category"
                  sx={{ 
                    borderRadius: 3, 
                    background: currentTheme.inputBg,
                    color: currentTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: currentTheme.border,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: currentTheme.accent,
                    },
                  }}
                >
                  <MenuItem value={0}>All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                disabled={!selectedCategoryId || isDeleting}
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
                Add SubCategory
              </Button>
            </Box>
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
            placeholder="Search subcategories by name or description..."
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
          {filteredSubCategories.length === 0 ? (
            <EmptyState
              type={searchKeyword ? 'not-found' : 'empty'}
              title={searchKeyword ? 'No subcategories found' : 'No subcategories yet'}
              description={
                searchKeyword
                  ? `No results for "${searchKeyword}". Try a different search term.`
                  : selectedCategoryId
                  ? 'Create your first subcategory for this category.'
                  : 'Select a category to create subcategories.'
              }
              actionLabel={selectedCategoryId && !searchKeyword ? 'Add SubCategory' : undefined}
              onAction={selectedCategoryId && !searchKeyword ? handleAddNew : undefined}
            />
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Image</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Discount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: currentTheme.text }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: currentTheme.text }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {currentData.map((sc, index) => (
                        <TableRow
                          key={sc.id}
                          hover
                          component={motion.tr}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {sc.imageUrl ? (
                                <Avatar
                                  src={sc.imageUrl}
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
                              {sc.videoUrl && (
                                <Link href={sc.videoUrl} target="_blank" rel="noopener" title="View video">
                                  <VideoFileIcon fontSize="small" color="action" />
                                </Link>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600} sx={{ color: currentTheme.text }}>{sc.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: currentTheme.textSecondary, maxWidth: 200 }} noWrap>
                              {sc.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sc.displayOrder}
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
                            {sc.discount > 0 ? (
                              <Chip
                                label={`${sc.discount}%`}
                                size="small"
                                sx={{ 
                                  fontWeight: 600, 
                                  borderRadius: 2,
                                  background: isDark ? 'rgba(0, 255, 157, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                                  color: currentTheme.success,
                                }}
                              />
                            ) : (
                              <Typography sx={{ color: currentTheme.textSecondary }}>—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sc.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                background: sc.isActive
                                  ? isDark ? 'rgba(0, 255, 157, 0.2)' : 'rgba(34, 197, 94, 0.15)'
                                  : isDark ? 'rgba(255, 71, 87, 0.2)' : 'rgba(156, 163, 175, 0.15)',
                                color: sc.isActive ? currentTheme.success : currentTheme.error,
                                fontWeight: 600,
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEdit(sc)}
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
                                  onClick={() => setConfirmId(sc.id)}
                                  size="small"
                                  disabled={isDeleting && confirmId === sc.id}
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

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
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
          setEditingSub(null);
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
            {editingSub ? 'Edit SubCategory' : 'Create SubCategory'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: currentTheme.border }}>
          <SubCategoryForm
            initialData={editingSub || undefined}
            categoryId={selectedCategoryId}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingSub(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete SubCategory"
        message="Are you sure you want to permanently delete this subcategory? This action cannot be undone."
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </Box>
  );
}
