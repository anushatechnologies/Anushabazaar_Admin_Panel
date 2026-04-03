import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Paper,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
  ZoomIn as ZoomIcon,
  Person as PersonIcon,
  Schedule as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  CancelOutlined as RejectedIcon,
  FilterList as FilterIcon,
  VerifiedUser as VerifiedIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { 
  useGetPendingDocumentsQuery, 
  useGetDeliveryPersonsQuery,
  useGetDeliveryPersonDocumentsQuery,
  useApproveDocumentMutation, 
  useRejectDocumentMutation,
  useApproveDeliveryPersonMutation,
} from '../api/deliveryApi';
import { SkeletonDocumentGrid, SkeletonPageHeader } from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { GlassPageHeader, GradientText, GlassCard, GlassBadge } from '../../../components/glassmorphism/GlassComponents';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { toast } from 'react-hot-toast';
import { useAppTheme } from '@contexts/ThemeContext';

interface Document {
  id: number;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  deliveryPersonId: number;
  remarks?: string;
}

interface DeliveryPerson {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isApprovedByAdmin: boolean;
  profilePhotoUrl?: string;
}

export default function DocumentReview() {
  const { currentTheme, isDark } = useAppTheme();
  const { data: pendingData, isLoading: isPendingLoading } = useGetPendingDocumentsQuery();
  const { data: personsData, isLoading: isPersonsLoading, refetch: refetchPersons } = useGetDeliveryPersonsQuery();
  const [approveDoc, { isLoading: isApproving }] = useApproveDocumentMutation();
  const [rejectDoc, { isLoading: isRejecting }] = useRejectDocumentMutation();
  const [approvePerson, { isLoading: isApprovingPerson }] = useApproveDeliveryPersonMutation();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState('');
  const [viewImage, setViewImage] = useState<string | null>(null);

  // Fetch documents for selected person
  const { data: personDocsData, isLoading: isDocsLoading, refetch: refetchDocs } = useGetDeliveryPersonDocumentsQuery(
    selectedPersonId || 0,
    { skip: !selectedPersonId }
  );

  const deliveryPersons = Array.isArray((personsData as any)?.deliveryPersons)
    ? (personsData as any).deliveryPersons
    : Array.isArray((personsData as any)?.content)
      ? (personsData as any).content
      : Array.isArray(personsData)
        ? (personsData as any)
        : [];
  const pendingDocuments = Array.isArray((pendingData as any)?.pendingDocuments)
    ? (pendingData as any).pendingDocuments
    : Array.isArray((pendingData as any)?.content)
      ? (pendingData as any).content
      : Array.isArray(pendingData)
        ? (pendingData as any)
        : [];
  const personDocuments = Array.isArray((personDocsData as any)?.documents)
    ? (personDocsData as any).documents
    : Array.isArray((personDocsData as any)?.content)
      ? (personDocsData as any).content
      : Array.isArray(personDocsData)
        ? (personDocsData as any)
        : pendingDocuments.filter((doc: any) => doc.deliveryPersonId === selectedPersonId);

  const handleApproveDoc = async (doc: Document) => {
    try {
      await approveDoc({ documentId: doc.id, adminId: 1 }).unwrap();
      toast.success(`${doc.documentType.replace('_', ' ')} approved!`);
      refetchDocs();
    } catch (err: any) {
      toast.error(err.data?.message || 'Approval failed');
    }
  };

  const handleRejectDoc = async () => {
    if (!rejectId || !remarks.trim()) return;
    try {
      await rejectDoc({ documentId: rejectId, adminId: 1, remarks }).unwrap();
      toast.success('Document rejected');
      setRejectId(null);
      setRemarks('');
      refetchDocs();
    } catch (err: any) {
      toast.error(err.data?.message || 'Rejection failed');
    }
  };

  const handleApprovePerson = async (personId: number) => {
    try {
      await approvePerson({ personId, adminId: 1 }).unwrap();
      toast.success('Delivery person account approved successfully!');
      refetchPersons();
    } catch (err: any) {
      toast.error(err.data?.message || 'Account approval failed. Ensure all documents are approved.');
    }
  };

  const selectedPerson = useMemo(() => 
    deliveryPersons.find(p => p.id === selectedPersonId), 
    [deliveryPersons, selectedPersonId]
  );

  const allDocsApproved = useMemo(() => {
    if (!personDocuments || personDocuments.length === 0) return false;
    return personDocuments.every((d: any) => d.status === 'APPROVED');
  }, [personDocuments]);

  if (isPersonsLoading) return <Box p={4}><SkeletonPageHeader /><SkeletonDocumentGrid count={6} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: currentTheme.bg }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                <GradientText>Personnel Verification</GradientText>
              </Typography>
              <Typography color="text.secondary">Review and approve delivery partner documents</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <GlassBadge statusColor={currentTheme.warning}>
                {pendingDocuments.length} Pending Actions
              </GlassBadge>
            </Stack>
          </Box>
        </GlassPageHeader>
      </motion.div>

      <Paper elevation={0} sx={{ 
        mb: 3, borderRadius: 4, overflow: 'hidden', 
        background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`,
        backdropFilter: 'blur(10px)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { py: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="By Delivery Person" />
          <Tab icon={<Badge badgeContent={pendingDocuments.length} color="error"><PendingIcon /></Badge>} iconPosition="start" label="Pending Approval" />
        </Tabs>
      </Paper>

      <AnimatePresence mode="wait">
        {activeTab === 0 ? (
          <Grid container spacing={3} key="by-person">
            {/* Sidebar List */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <GlassCard sx={{ height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${currentTheme.border}` }}>
                  <Typography variant="h6" fontWeight={700}>Delivery Persons</Typography>
                </Box>
                <List sx={{ overflowY: 'auto', flex: 1, p: 0 }}>
                  {deliveryPersons.map((p) => (
                    <ListItemButton 
                      key={p.id} 
                      selected={selectedPersonId === p.id}
                      onClick={() => setSelectedPersonId(p.id)}
                      sx={{
                        py: 2,
                        borderBottom: `1px solid ${currentTheme.border}40`,
                        '&.Mui-selected': {
                          background: `${currentTheme.accent}15`,
                          borderLeft: `4px solid ${currentTheme.accent}`,
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={p.profilePhotoUrl} sx={{ bgcolor: currentTheme.accent }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={`${p.firstName} ${p.lastName}`} 
                        secondary={p.phoneNumber}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      {p.isApprovedByAdmin ? (
                        <VerifiedIcon sx={{ color: currentTheme.success, fontSize: 20 }} />
                      ) : (
                        <Chip size="small" label={p.approvalStatus} color="warning" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              </GlassCard>
            </Grid>

            {/* Content Area */}
            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
              {selectedPerson ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <GlassCard sx={{ minHeight: 'calc(100vh - 300px)' }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${currentTheme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56, bgcolor: currentTheme.accent }}>
                          <PersonIcon fontSize="large" />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>{selectedPerson.firstName} {selectedPerson.lastName}</Typography>
                          <Typography variant="body2" color="text.secondary">{selectedPerson.phoneNumber}</Typography>
                        </Box>
                      </Stack>
                      {!selectedPerson.isApprovedByAdmin && (
                        <Button
                          variant="contained"
                          disabled={!allDocsApproved || isApprovingPerson}
                          onClick={() => handleApprovePerson(selectedPerson.id)}
                          startIcon={isApprovingPerson ? <CircularProgress size={20} color="inherit" /> : <VerifiedIcon />}
                          sx={{ 
                            borderRadius: 3, px: 3, py: 1, fontWeight: 700,
                            background: currentTheme.accentGradient,
                            '&:disabled': { opacity: 0.5, bg: 'grey.400' }
                          }}
                        >
                          Approve Delivery Person
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Uploaded Documents</Typography>
                      {isDocsLoading ? <SkeletonDocumentGrid count={3} /> : (
                        <Grid container spacing={3}>
                          {personDocuments.length === 0 ? (
                            <Grid size={{ xs: 12 }}>
                              <Box sx={{ textAlign: 'center', py: 8 }}>
                                <ErrorIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">No documents available for this delivery person yet</Typography>
                              </Box>
                            </Grid>
                          ) : (
                            personDocuments.map((doc: any) => (
                              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc.id}>
                                <Card variant="outlined" sx={{ 
                                  borderRadius: 4, overflow: 'hidden', 
                                  borderColor: currentTheme.border,
                                  transition: '0.3s',
                                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                                }}>
                                  <Box sx={{ position: 'relative', pt: '75%', background: '#f5f5f5' }}>
                                    <Box 
                                      component="img" src={doc.documentUrl} 
                                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <IconButton 
                                      onClick={() => setViewImage(doc.documentUrl)}
                                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                                    >
                                      <ZoomIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: '60%' }}>
                                        {doc.documentType.replace('_', ' ')}
                                      </Typography>
                                      <Chip 
                                        label={doc.status} 
                                        size="small" 
                                        color={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'error' : 'warning'}
                                        sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                      #{doc.documentNumber}
                                    </Typography>
                                    
                                    {doc.status === 'PENDING' && (
                                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                        <Button 
                                          fullWidth size="small" variant="outlined" color="success"
                                          startIcon={<ApproveIcon />} onClick={() => handleApproveDoc(doc)}
                                        >
                                          Approve
                                        </Button>
                                        <Button 
                                          fullWidth size="small" variant="outlined" color="error"
                                          startIcon={<RejectIcon />} onClick={() => setRejectId(doc.id)}
                                        >
                                          Reject
                                        </Button>
                                      </Stack>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))
                          )}
                        </Grid>
                      )}
                    </Box>
                  </GlassCard>
                </motion.div>
              ) : (
                <EmptyState type="empty" title="Select Personnel" description="Pick a delivery person from the left to review their files" />
              )}
            </Grid>
          </Grid>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key="pending-all">
             <Grid container spacing={3}>
                {pendingDocuments.length === 0 ? (
                  <Grid size={{ xs: 12 }}>
                    <EmptyState type="empty" title="All Caught Up!" description="There are no documents waiting for your review." />
                  </Grid>
                ) : (
                  pendingDocuments.map((doc: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={doc.id}>
                      <GlassCard sx={{ p: 0 }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: currentTheme.accent }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>Person ID: {doc.deliveryPersonId}</Typography>
                            <Typography variant="caption" color="text.secondary">{doc.documentType.replace('_', ' ')}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ position: 'relative', pt: '60%', bgcolor: '#f0f0f0' }}>
                          <Box component="img" src={doc.documentUrl} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                          <Button 
                            fullWidth variant="contained" size="small" 
                            onClick={() => handleApproveDoc(doc)}
                            sx={{ bgcolor: currentTheme.success }}
                          >
                            Approve
                          </Button>
                          <Button 
                            fullWidth variant="outlined" size="small" color="error"
                            onClick={() => setRejectId(doc.id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </GlassCard>
                    </Grid>
                  ))
                )}
             </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onClose={() => setRejectId(null)} PaperProps={{ sx: { borderRadius: 4, bgcolor: currentTheme.cardBg, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Why are you rejecting this document?</Typography>
          <TextField 
            fullWidth multiline rows={3} placeholder="e.g. Image blurry, invalid ID number" 
            value={remarks} onChange={(e) => setRemarks(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectDoc} disabled={!remarks.trim() || isRejecting}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image View Dialog */}
      <Dialog open={!!viewImage} onClose={() => setViewImage(null)} maxWidth="lg">
        <Box sx={{ position: 'relative', p: 1, bgcolor: 'black' }}>
          <IconButton onClick={() => setViewImage(null)} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'black' } }}>
            <CloseIcon />
          </IconButton>
          <Box component="img" src={viewImage || ''} sx={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }} />
        </Box>
      </Dialog>
    </Box>
  );
}
