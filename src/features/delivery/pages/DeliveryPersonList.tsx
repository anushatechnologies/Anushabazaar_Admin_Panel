import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Chip, 
  Avatar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Paper,
  TextField,
} from '@mui/material';
import {
  People as PeopleIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon,
  PersonAdd as AddPersonIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import ReusableTable from '../../../components/common/ReusableTable';
import { useGetDeliveryPersonsQuery, 
  useGetPendingDeliveryPersonsQuery,
  useGetPersonnelDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  DeliveryPerson,
  DeliveryDocument
} from '../api/deliveryApi';
import { useNavigate } from 'react-router-dom';
import { SkeletonTable, SkeletonPageHeader, SkeletonDocumentCard } from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { GlassPageHeader, GradientText, GlassCard } from '../../../components/glassmorphism/GlassComponents';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { toast } from '../../../components/toast/ToastContainer';

export default function DeliveryPersonList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [selectedPersonName, setSelectedPersonName] = useState<string>('');
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<number | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const { handleError } = useErrorHandler();
  
  const { data: allData, isLoading: isAllLoading, isError: isAllError, error: allError } = useGetDeliveryPersonsQuery();
  const { data: pendingData, isLoading: isPendingLoading, isError: isPendingError, error: pendingError } = useGetPendingDeliveryPersonsQuery();
  
  const { data: documentsData, isLoading: isDocsLoading } = useGetPersonnelDocumentsQuery(
    selectedPersonId!,
    { skip: !selectedPersonId }
  );
  
  const [approveDoc] = useApproveDocumentMutation();
  const [rejectDoc] = useRejectDocumentMutation();

  React.useEffect(() => {
    if (isAllError && allError) {
      handleError(allError);
    }
    if (isPendingError && pendingError) {
      handleError(pendingError);
    }
  }, [isAllError, allError, isPendingError, pendingError, handleError]);

  const deliveryPersons = tab === 'all' 
    ? allData?.deliveryPersons || [] 
    : pendingData?.deliveryPersons || [];

  const isLoading = tab === 'all' ? isAllLoading : isPendingLoading;
  const isError = tab === 'all' ? isAllError : isPendingError;

  const handleTabChange = (event: React.MouseEvent<HTMLElement>, newTab: 'all' | 'pending') => {
    if (newTab !== null) {
      setTab(newTab);
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/admin/delivery/persons/${id}`);
  };

  const handleViewDocuments = (id: number, name: string) => {
    setSelectedPersonId(id);
    setSelectedPersonName(name);
    setDocumentModalOpen(true);
  };

  const handleCloseDocumentModal = () => {
    setDocumentModalOpen(false);
    setSelectedPersonId(null);
    setSelectedPersonName('');
    setRejectDocId(null);
    setRejectRemarks('');
  };

  const handleApproveDocument = async (docId: number) => {
    try {
      await approveDoc({ documentId: docId, adminId: 1 }).unwrap();
      toast.success('Document approved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve document');
    }
  };

  const handleRejectDocument = async () => {
    if (!rejectDocId || !rejectRemarks.trim()) return;
    try {
      await rejectDoc({ documentId: rejectDocId, adminId: 1, remarks: rejectRemarks }).unwrap();
      toast.success('Document rejected');
      setRejectDocId(null);
      setRejectRemarks('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
      case 'PENDING': return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
      case 'REJECTED': return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
      default: return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
    }
  };

  const columns = [
    { 
      header: 'Name', 
      key: 'firstName',
      render: (row: DeliveryPerson) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={row.profilePhotoUrl}
            sx={{ 
              bgcolor: 'primary.main',
              background: getStatusGradient(row.approvalStatus),
              width: 44,
              height: 44,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {row.firstName?.[0]}{row.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email || 'No email'}
            </Typography>
          </Box>
        </Stack>
      )
    },
    { 
      header: 'Phone', 
      key: 'phoneNumber',
      render: (row: DeliveryPerson) => (
        <Typography variant="body2">
          {row.phoneNumber || 'N/A'}
        </Typography>
      )
    },
    { 
      header: 'Status', 
      key: 'approvalStatus',
      render: (row: DeliveryPerson) => (
        <Chip 
          label={row.approvalStatus} 
          size="small"
          sx={{
            background: `${getStatusGradient(row.approvalStatus)}20`,
            color: getStatusColor(row.approvalStatus) === 'success' ? '#16a34a' :
                   getStatusColor(row.approvalStatus) === 'warning' ? '#d97706' :
                   getStatusColor(row.approvalStatus) === 'error' ? '#dc2626' : '#6b7280',
            fontWeight: 600,
            borderRadius: 2,
            px: 1,
          }}
        />
      )
    },
    { 
      header: 'Verified', 
      key: 'verified',
      render: (row: DeliveryPerson) => (
        <Chip 
          label={row.verified ? 'Verified' : 'Unverified'} 
          size="small"
          sx={{
            background: row.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            color: row.verified ? '#16a34a' : '#6b7280',
            fontWeight: 500,
            borderRadius: 2,
          }}
        />
      )
    },
    { 
      header: 'Joined', 
      key: 'createdAt',
      render: (row: DeliveryPerson) => (
        <Typography variant="body2" color="text.secondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'N/A'}
        </Typography>
      )
    },
    {
      header: 'Documents',
      key: 'documents',
      render: (row: DeliveryPerson) => (
        <Button
          size="small"
          variant="outlined"
          color="info"
          startIcon={<DescriptionIcon />}
          onClick={() => handleViewDocuments(row.id, `${row.firstName} ${row.lastName}`)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderWidth: 1.5,
          }}
        >
          View Docs
        </Button>
      )
    },
    {
      header: 'Actions',
      key: 'id',
      render: (row: DeliveryPerson) => (
        <Button 
          size="small" 
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => handleViewDetails(row.id)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderWidth: 1.5,
          }}
        >
          View
        </Button>
      )
    }
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonTable />
      </Box>
    );
  }

  if (isError && !deliveryPersons.length) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Failed to load delivery persons"
          description="There was an error loading the delivery persons data. Please try again."
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
                <GradientText>Delivery Persons</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Manage and approve delivery persons ({deliveryPersons.length} total)
              </Typography>
            </Box>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={tab}
          exclusive
          onChange={handleTabChange}
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 0.5,
            '& .MuiToggleButton-root': {
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              border: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              },
            },
          }}
        >
          <ToggleButton value="all">
            <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
            All Staff
          </ToggleButton>
          <ToggleButton value="pending">
            <PendingIcon sx={{ mr: 1, fontSize: 20 }} />
            Pending Approval
            {pendingData?.deliveryPersons?.length > 0 && (
              <Chip
                size="small"
                label={pendingData?.deliveryPersons?.length}
                sx={{
                  ml: 1,
                  height: 20,
                  minWidth: 20,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: tab === 'pending' ? 'rgba(255,255,255,0.3)' : '#f59e0b',
                  color: tab === 'pending' ? 'white' : 'white',
                }}
              />
            )}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard>
          {deliveryPersons.length === 0 ? (
            <EmptyState
              type="empty"
              title={tab === 'pending' ? 'No pending approvals' : 'No delivery persons'}
              description={tab === 'pending' 
                ? 'All delivery persons have been approved.' 
                : 'No delivery persons found.'}
            />
          ) : (
            <ReusableTable
              columns={columns}
              data={deliveryPersons}
              loading={isLoading}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
            />
          )}
        </GlassCard>
      </motion.div>

      {/* Document Modal */}
      <Dialog
        open={documentModalOpen}
        onClose={handleCloseDocumentModal}
        maxWidth="md"
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
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Documents - {selectedPersonName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: #{selectedPersonId}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDocumentModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isDocsLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                  <SkeletonDocumentCard />
                </Grid>
              ))}
            </Grid>
          ) : documentsData?.documents?.length === 0 ? (
            <EmptyState
              type="empty"
              title="No documents"
              description="This delivery person has not uploaded any documents yet."
            />
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence mode="popLayout">
                {documentsData?.documents?.map((doc: DeliveryDocument, index: number) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={doc.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}
                      >
                        <Box sx={{ position: 'relative', height: 160 }}>
                          <Box
                            component="img"
                            src={doc.documentUrl}
                            alt={doc.documentType}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <Chip
                            label={doc.status}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              background:
                                doc.status === 'APPROVED'
                                  ? 'rgba(34, 197, 94, 0.9)'
                                  : doc.status === 'REJECTED'
                                  ? 'rgba(239, 68, 68, 0.9)'
                                  : 'rgba(245, 158, 11, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {doc.documentType.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            #{doc.documentNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>

                          {doc.status === 'PENDING' && (
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApproveDocument(doc.id)}
                                sx={{
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setRejectDocId(doc.id)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderWidth: 2,
                                }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDocumentModal}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Document Dialog */}
      <Dialog
        open={!!rejectDocId}
        onClose={() => setRejectDocId(null)}
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
          <Typography variant="h6" fontWeight={700}>
            Reject Document
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this document.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., Image is blurry, document expired..."
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setRejectDocId(null)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectDocument}
            disabled={!rejectRemarks.trim()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
