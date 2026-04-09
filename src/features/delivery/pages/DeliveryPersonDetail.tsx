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
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import {
  useGetDeliveryPersonByIdQuery,
  useGetPersonnelDocumentsQuery,
  useApproveProfilePhotoMutation,
  useRejectProfilePhotoMutation,
  useRequestProfilePhotoReuploadMutation,
  useUpdateDeliveryPersonStatusMutation,
  useApproveDeliveryPersonMutation,
  useUpdateDeliveryPersonDetailsMutation,
} from '../api/deliveryApi';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle,
  Cancel,
  Refresh,
  PowerSettingsNew,
  LockOutlined,
  EditOutlined,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function DeliveryPersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adminId = useAppSelector((state) => state.auth.user?.id ?? 0);

  const { data: personnelResponse, isLoading: isPersonnelLoading } = useGetDeliveryPersonByIdQuery(
    Number(id),
    { pollingInterval: 5000 },
  );
  const { data: docs, isLoading: isDocsLoading } = useGetPersonnelDocumentsQuery(Number(id), {
    pollingInterval: 5000,
  });

  const personnel = personnelResponse?.deliveryPerson;
  const onboardingStatus = personnelResponse?.onboardingStatus;
  const accountActive = Boolean(personnel?.approvalStatus === 'APPROVED');
  const documents = Array.isArray((docs as any)?.documents)
    ? (docs as any).documents
    : Array.isArray((docs as any)?.content)
      ? (docs as any).content
      : Array.isArray(docs)
        ? (docs as any)
        : [];
  const onboardingIssues = onboardingStatus
    ? ([
        !onboardingStatus.personalInfoCompleted && 'personal info',
        !onboardingStatus.vehicleCompleted && 'vehicle details',
        !onboardingStatus.bankCompleted && 'bank details',
        !onboardingStatus.profilePhotoApproved && 'profile photo approval',
        ...onboardingStatus.missingApprovedDocuments.map((code: string) =>
          code.replace(/_/g, ' ').toLowerCase(),
        ),
      ].filter(Boolean) as string[])
    : [];

  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
  const [selectedDocumentName, setSelectedDocumentName] = useState('');

  // Mutations
  const [approvePhoto, { isLoading: isApprovingPhoto }] = useApproveProfilePhotoMutation();
  const [rejectPhoto, { isLoading: isRejectingPhoto }] = useRejectProfilePhotoMutation();
  const [requestReupload, { isLoading: isRequestingReupload }] =
    useRequestProfilePhotoReuploadMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDeliveryPersonStatusMutation();
  const [approveApplication, { isLoading: isApprovingApp }] = useApproveDeliveryPersonMutation();
  const [updateDetails, { isLoading: isUpdatingDetails }] =
    useUpdateDeliveryPersonDetailsMutation();

  // Photo Reject/Reupload Dialog
  const [photoActionOpen, setPhotoActionOpen] = useState(false);
  const [photoActionType, setPhotoActionType] = useState<'reject' | 'reupload' | null>(null);
  const [photoRemarks, setPhotoRemarks] = useState('');

  // Edit Personal Info Dialog
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editVehicleType, setEditVehicleType] = useState('');
  const [editVehicleModel, setEditVehicleModel] = useState('');
  const [editRegNumber, setEditRegNumber] = useState('');

  // Edit Bank Info Dialog
  const [editBankOpen, setEditBankOpen] = useState(false);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editIfscCode, setEditIfscCode] = useState('');

  const openEditPersonal = () => {
    setEditVehicleType(personnel?.vehicleType || 'BIKE');
    setEditVehicleModel(personnel?.vehicleModel || '');
    setEditRegNumber(personnel?.registrationNumber || '');
    setEditPersonalOpen(true);
  };

  const openEditBank = () => {
    setEditAccountName(personnel?.accountName || '');
    setEditAccountNumber(personnel?.accountNumber || '');
    setEditBankName(personnel?.bankName || '');
    setEditIfscCode(personnel?.ifscCode || '');
    setEditBankOpen(true);
  };

  const handleSavePersonal = async () => {
    try {
      await updateDetails({
        personId: Number(id),
        vehicleType: editVehicleType,
        vehicleModel: editVehicleModel,
        registrationNumber: editRegNumber,
      }).unwrap();
      toast.success('Personal details updated');
      setEditPersonalOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message || 'Update failed');
    }
  };

  const handleSaveBank = async () => {
    try {
      await updateDetails({
        personId: Number(id),
        accountName: editAccountName,
        accountNumber: editAccountNumber,
        bankName: editBankName,
        ifscCode: editIfscCode,
      }).unwrap();
      toast.success('Bank details updated');
      setEditBankOpen(false);
    } catch (e: any) {
      toast.error(e?.data?.message || 'Update failed');
    }
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocumentUrl(doc.documentUrl);
    setSelectedDocumentName(doc.documentType);
    setDocumentViewerOpen(true);
  };

  const handleApprovePhoto = async () => {
    try {
      await approvePhoto({ personId: Number(id), adminId }).unwrap();
      toast.success('Profile photo approved');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve photo');
    }
  };

  const submitPhotoAction = async () => {
    try {
      if (photoActionType === 'reject') {
        await rejectPhoto({ personId: Number(id), adminId, remarks: photoRemarks }).unwrap();
        toast.success('Profile photo rejected');
      } else {
        await requestReupload({ personId: Number(id), adminId, remarks: photoRemarks }).unwrap();
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
      await updateStatus({ personId: Number(id), isActive: !personnel.isOnline }).unwrap();
      toast.success(`Rider marked ${!personnel.isOnline ? 'online' : 'offline'}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  const handleApproveApplication = async () => {
    try {
      await approveApplication({ personId: Number(id), adminId }).unwrap();
      toast.success('Delivery person application fully approved!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve application');
    }
  };

  if (isPersonnelLoading)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            }}
          />
          <Typography variant="caption" color="success.main" fontWeight={700}>
            Live — refreshes every 5 s
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar
              src={personnel?.profilePhotoUrl}
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {personnel?.firstName?.[0]}
            </Avatar>
            <Typography variant="h5" fontWeight={700}>
              {personnel?.firstName} {personnel?.lastName}
            </Typography>

            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                ACCOUNT STATUS
              </Typography>
              <Chip
                label={accountActive ? 'ACTIVE' : 'INACTIVE'}
                color={accountActive ? 'success' : 'error'}
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                ONLINE STATUS
              </Typography>
              <Chip
                label={personnel?.isOnline ? 'ONLINE' : 'OFFLINE'}
                color={personnel?.isOnline ? 'success' : 'default'}
                variant={personnel?.isOnline ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                APPROVAL STATUS
              </Typography>
              <Chip
                label={personnel?.approvalStatus}
                color={
                  personnel?.approvalStatus === 'APPROVED'
                    ? 'success'
                    : personnel?.approvalStatus === 'REJECTED'
                      ? 'error'
                      : 'warning'
                }
                variant="filled"
                sx={{ fontWeight: 800, px: 2, height: 32 }}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {personnel?.approvalStatus === 'PENDING' && (
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  startIcon={<CheckCircle />}
                  onClick={handleApproveApplication}
                  disabled={isApprovingApp || !onboardingStatus?.readyForFinalApproval}
                >
                  Approve Application
                </Button>
              )}

              <Button
                variant={personnel?.isOnline ? 'outlined' : 'contained'}
                color={personnel?.isOnline ? 'warning' : 'success'}
                fullWidth
                startIcon={<PowerSettingsNew />}
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
              >
                {personnel?.isOnline ? 'Mark Offline' : 'Mark Online'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" gutterBottom>
              Profile Photo Status
            </Typography>
            <Chip
              label={personnel?.profilePhotoStatus || 'UNKNOWN'}
              size="small"
              color={
                personnel?.profilePhotoStatus === 'APPROVED'
                  ? 'success'
                  : personnel?.profilePhotoStatus === 'PENDING'
                    ? 'warning'
                    : 'error'
              }
              sx={{ mb: 2 }}
            />

            <Grid container spacing={1}>
              {personnel?.profilePhotoStatus !== 'APPROVED' && (
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleApprovePhoto}
                    disabled={isApprovingPhoto}
                  >
                    Approve Photo
                  </Button>
                </Grid>
              )}
              {personnel?.profilePhotoStatus !== 'REJECTED' && (
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setPhotoActionType('reject');
                      setPhotoActionOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </Grid>
              )}
              {personnel?.profilePhotoStatus !== 'NEEDS_REUPLOAD' && (
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setPhotoActionType('reupload');
                      setPhotoActionOpen(true);
                    }}
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
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Onboarding Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {onboardingStatus ? (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Step
                    </Typography>
                    <Typography variant="body1">{onboardingStatus.currentStep}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion
                    </Typography>
                    <Typography variant="body1">{onboardingStatus.completionPercent}%</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Required Docs Approved
                    </Typography>
                    <Typography variant="body1">
                      {onboardingStatus.approvedRequiredDocumentCount}/
                      {onboardingStatus.requiredDocumentCount}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ready For Approval
                    </Typography>
                    <Typography variant="body1">
                      {onboardingStatus.readyForFinalApproval ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                </Grid>

                {!onboardingStatus.readyForFinalApproval && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Missing or pending required items: {onboardingIssues.join(', ') || 'None'}
                  </Alert>
                )}

                {!!onboardingStatus.optionalDocuments?.length && (
                  <Alert severity="warning">
                    Optional documents: {onboardingStatus.optionalDocuments.join(', ')}. Insurance
                    does not block final approval.
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="info">Onboarding summary not available.</Alert>
            )}
          </Paper>

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 4,
              border: personnel?.approvalStatus === 'APPROVED' ? '1px solid #4caf50' : undefined,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Personal Information
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                {personnel?.approvalStatus === 'APPROVED' && (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}
                  >
                    <LockOutlined fontSize="small" />
                    <Typography variant="caption" fontWeight={700} color="success.main">
                      LOCKED
                    </Typography>
                  </Box>
                )}
                <Button
                  size="small"
                  startIcon={<EditOutlined />}
                  onClick={openEditPersonal}
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Edit
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{personnel?.email || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle Type
                </Typography>
                <Typography variant="body1">{personnel?.vehicleType || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle Model
                </Typography>
                <Typography variant="body1">{personnel?.vehicleModel || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <Typography variant="body1">⭐ {personnel?.rating || '0.0'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 4,
              border: personnel?.approvalStatus === 'APPROVED' ? '1px solid #4caf50' : undefined,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Bank Account Information
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                {personnel?.approvalStatus === 'APPROVED' && (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}
                  >
                    <LockOutlined fontSize="small" />
                    <Typography variant="caption" fontWeight={700} color="success.main">
                      LOCKED
                    </Typography>
                  </Box>
                )}
                <Button
                  size="small"
                  startIcon={<EditOutlined />}
                  onClick={openEditBank}
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Edit
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Holder
                </Typography>
                <Typography variant="body1">{personnel?.accountName || 'Not Set'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Bank Name
                </Typography>
                <Typography variant="body1">{personnel?.bankName || 'Not Set'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Number
                </Typography>
                <Typography variant="body1">{personnel?.accountNumber || 'Not Set'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  IFSC Code
                </Typography>
                <Typography variant="body1">{personnel?.ifscCode || 'Not Set'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Verification Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {isDocsLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Grid container spacing={2}>
                {documents.map((doc: any) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={doc.id}>
                    <Box
                      sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Typography variant="subtitle2">{doc.documentType}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Number: {doc.documentNumber || 'Not provided'}
                      </Typography>
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

      <Dialog
        open={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        maxWidth="md"
        fullWidth
      >
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

      {/* Edit Personal Info Dialog */}
      <Dialog
        open={editPersonalOpen}
        onClose={() => setEditPersonalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Vehicle & Personal Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={editVehicleType}
              label="Vehicle Type"
              onChange={(e) => setEditVehicleType(e.target.value)}
            >
              {['BIKE', 'SCOOTY', 'EV', 'AUTO', 'HEAVY'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Vehicle Model"
            size="small"
            fullWidth
            value={editVehicleModel}
            onChange={(e) => setEditVehicleModel(e.target.value)}
          />
          <TextField
            label="Registration Number"
            size="small"
            fullWidth
            value={editRegNumber}
            onChange={(e) => setEditRegNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPersonalOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePersonal} variant="contained" disabled={isUpdatingDetails}>
            {isUpdatingDetails ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Bank Info Dialog */}
      <Dialog open={editBankOpen} onClose={() => setEditBankOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bank Account Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Account Holder Name"
            size="small"
            fullWidth
            value={editAccountName}
            onChange={(e) => setEditAccountName(e.target.value)}
          />
          <TextField
            label="Bank Name"
            size="small"
            fullWidth
            value={editBankName}
            onChange={(e) => setEditBankName(e.target.value)}
          />
          <TextField
            label="Account Number"
            size="small"
            fullWidth
            value={editAccountNumber}
            onChange={(e) => setEditAccountNumber(e.target.value)}
          />
          <TextField
            label="IFSC Code"
            size="small"
            fullWidth
            value={editIfscCode}
            onChange={(e) => setEditIfscCode(e.target.value)}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBankOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveBank} variant="contained" disabled={isUpdatingDetails}>
            {isUpdatingDetails ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Action Dialog */}
      <Dialog
        open={photoActionOpen}
        onClose={() => setPhotoActionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
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
