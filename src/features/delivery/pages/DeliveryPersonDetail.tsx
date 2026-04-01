import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Chip, 
  Button, 
  Divider, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetDeliveryPersonByIdQuery, 
  useGetPersonnelDocumentsQuery,
  useApproveProfilePhotoMutation,
  useRejectProfilePhotoMutation,
  useRequestProfilePhotoReuploadMutation,
  useUpdateDeliveryPersonStatusMutation,
  useApproveDeliveryPersonMutation
} from '../api/deliveryApi';
import { ArrowBack as ArrowBackIcon, CheckCircle, Cancel, Refresh, PowerSettingsNew } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function DeliveryPersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: personnelResponse, isLoading: isPersonnelLoading } = useGetDeliveryPersonByIdQuery(Number(id));
  const { data: docs, isLoading: isDocsLoading } = useGetPersonnelDocumentsQuery(Number(id));
  
  const personnel = personnelResponse?.deliveryPerson;
  const documents = Array.isArray((docs as any)?.documents)
    ? (docs as any).documents
    : Array.isArray((docs as any)?.content)
      ? (docs as any).content
      : Array.isArray(docs)
        ? (docs as any)
        : [];

  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
  const [selectedDocumentName, setSelectedDocumentName] = useState('');

  // Mutations
  const [approvePhoto, { isLoading: isApprovingPhoto }] = useApproveProfilePhotoMutation();
  const [rejectPhoto, { isLoading: isRejectingPhoto }] = useRejectProfilePhotoMutation();
  const [requestReupload, { isLoading: isRequestingReupload }] = useRequestProfilePhotoReuploadMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDeliveryPersonStatusMutation();
  const [approveApplication, { isLoading: isApprovingApp }] = useApproveDeliveryPersonMutation();

  // Photo Reject/Reupload Dialog
  const [photoActionOpen, setPhotoActionOpen] = useState(false);
  const [photoActionType, setPhotoActionType] = useState<'reject' | 'reupload' | null>(null);
  const [photoRemarks, setPhotoRemarks] = useState('');

  const handleViewDocument = (doc: any) => {
    setSelectedDocumentUrl(doc.documentUrl);
    setSelectedDocumentName(doc.documentType);
    setDocumentViewerOpen(true);
  };

  const handleApprovePhoto = async () => {
    try {
      await approvePhoto({ personId: Number(id), adminId: 1 }).unwrap();
      toast.success('Profile photo approved');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve photo');
    }
  };

  const submitPhotoAction = async () => {
    try {
      if (photoActionType === 'reject') {
        await rejectPhoto({ personId: Number(id), adminId: 1, remarks: photoRemarks }).unwrap();
        toast.success('Profile photo rejected');
      } else {
        await requestReupload({ personId: Number(id), adminId: 1, remarks: photoRemarks }).unwrap();
        toast.success('Re-upload requested');
      }
      setPhotoActionOpen(false);
      setPhotoRemarks('');
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${photoActionType} photo`);
    }
  };

  const handleToggleStatus = async () => {
    if (!personnel) return;
    try {
      await updateStatus({ personId: Number(id), isActive: !personnel.isActive }).unwrap();
      toast.success(`Account ${!personnel.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  const handleApproveApplication = async () => {
    try {
      await approveApplication({ personId: Number(id), adminId: 1 }).unwrap();
      toast.success('Delivery person application fully approved!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve application');
    }
  };

  if (isPersonnelLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>Back</Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar 
              src={personnel?.profilePhotoUrl}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {personnel?.firstName?.[0]}
            </Avatar>
            <Typography variant="h5" fontWeight={700}>{personnel?.firstName} {personnel?.lastName}</Typography>
            <Chip 
              label={personnel?.isActive ? 'Active' : 'Inactive'} 
              color={personnel?.isActive ? 'success' : 'error'}
              sx={{ mt: 1, mr: 1 }}
            />
            <Chip 
              label={personnel?.approvalStatus} 
              color={personnel?.approvalStatus === 'APPROVED' ? 'success' : 'warning'}
              sx={{ mt: 1 }}
            />

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {personnel?.approvalStatus === 'PENDING' && (
                <Button 
                  variant="contained"
                  color="warning"
                  fullWidth
                  startIcon={<CheckCircle />}
                  onClick={handleApproveApplication}
                  disabled={isApprovingApp}
                >
                  Approve Application
                </Button>
              )}

              <Button 
                variant={personnel?.isActive ? "outlined" : "contained"}
                color={personnel?.isActive ? "error" : "success"}
                fullWidth
                startIcon={<PowerSettingsNew />}
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
              >
                {personnel?.isActive ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle2" gutterBottom>Profile Photo Status</Typography>
            <Chip 
              label={personnel?.profilePhotoStatus || 'UNKNOWN'}
              size="small"
              color={
                personnel?.profilePhotoStatus === 'APPROVED' ? 'success' :
                personnel?.profilePhotoStatus === 'PENDING' ? 'warning' : 'error'
              }
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={1}>
              {personnel?.profilePhotoStatus !== 'APPROVED' && (
                <Grid size={{xs: 12}}>
                  <Button 
                    fullWidth size="small" variant="contained" color="success"
                    startIcon={<CheckCircle />} onClick={handleApprovePhoto}
                    disabled={isApprovingPhoto}
                  >
                    Approve Photo
                  </Button>
                </Grid>
              )}
              {personnel?.profilePhotoStatus !== 'REJECTED' && (
                <Grid size={{xs: 6}}>
                  <Button 
                    fullWidth size="small" variant="outlined" color="error"
                    startIcon={<Cancel />} 
                    onClick={() => { setPhotoActionType('reject'); setPhotoActionOpen(true); }}
                  >
                    Reject
                  </Button>
                </Grid>
              )}
              {personnel?.profilePhotoStatus !== 'NEEDS_REUPLOAD' && (
                <Grid size={{xs: 6}}>
                  <Button 
                    fullWidth size="small" variant="outlined" color="warning"
                    startIcon={<Refresh />} 
                    onClick={() => { setPhotoActionType('reupload'); setPhotoActionOpen(true); }}
                  >
                    Reupload
                  </Button>
                </Grid>
              )}
            </Grid>
            
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{personnel?.email || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">Vehicle Type</Typography>
                <Typography variant="body1">{personnel?.vehicleType || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">Vehicle Model</Typography>
                <Typography variant="body1">{personnel?.vehicleModel || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">Rating</Typography>
                <Typography variant="body1">⭐ {personnel?.rating || '0.0'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Verification Documents</Typography>
            <Divider sx={{ mb: 2 }} />
            {isDocsLoading ? <CircularProgress size={24} /> : (
              <Grid container spacing={2}>
                {documents.map((doc: any) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={doc.id}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="subtitle2">{doc.documentType}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">Number: {doc.documentNumber}</Typography>
                      <Button 
                        size="small" 
                        variant="text" 
                        onClick={() => handleViewDocument(doc)}
                        sx={{ mt: 1 }}
                      >
                        View Document
                      </Button>
                    </Box>
                  </Grid>
                ))}
                {!documents.length && <Alert severity="info">No documents uploaded yet.</Alert>}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={documentViewerOpen} onClose={() => setDocumentViewerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedDocumentName} Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          {selectedDocumentUrl ? (
            <Box 
              component="img"
              src={selectedDocumentUrl}
              alt="Document Viewer"
              sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 2 }}
            />
          ) : (
            <Typography>No document available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentViewerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Action Dialog */}
      <Dialog open={photoActionOpen} onClose={() => setPhotoActionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {photoActionType === 'reject' ? 'Reject Profile Photo' : 'Request Photo Re-upload'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason/remark for the delivery person:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            fullWidth
            multiline
            rows={3}
            value={photoRemarks}
            onChange={(e) => setPhotoRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoActionOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitPhotoAction} 
            color={photoActionType === 'reject' ? 'error' : 'warning'}
            variant="contained"
            disabled={!photoRemarks.trim() || isRejectingPhoto || isRequestingReupload}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
