import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Stack,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useGetPolicyQuery, useUpdatePolicyMutation } from '../../settings/api/policyApi';

const PoliciesPage = () => {
  const { data, isLoading } = useGetPolicyQuery('RETURNS_REFUNDS');
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState({
    cancellationAndRefund: '',
    taxes: '',
    cancellation: '',
    returns: '',
    returnPolicy: '',
    replacement: '',
    refundProcess: '',
    shipping: '',
  });

  useEffect(() => {
    if (data?.policy?.content) {
      try {
        const parsed = JSON.parse(data.policy.content);
        setContent(parsed);
      } catch (e) {
        // Fallback for raw text if needed, but we'll try to keep it as JSON
        setContent((prev) => ({ ...prev, returns: data.policy.content }));
      }
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePolicy({
        type: 'RETURNS_REFUNDS',
        content: JSON.stringify(content),
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save policy', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Box
        sx={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: { xs: 3, md: 5 },
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {/* CANCELLATION & REFUND POLICY */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Cancellation & Refund Policy
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            value={content.cancellationAndRefund}
            onChange={(e) => setContent({ ...content, cancellationAndRefund: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.cancellationAndRefund}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* TAXES */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Taxes on Your Order
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={content.taxes}
            onChange={(e) => setContent({ ...content, taxes: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.taxes}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* ORDER CANCELLATION */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Order Cancellation
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            value={content.cancellation}
            onChange={(e) => setContent({ ...content, cancellation: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.cancellation}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* RETURNS & REFUNDS */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Returns & Refunds</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={15}
            value={content.returns}
            onChange={(e) => setContent({ ...content, returns: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.returns}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* RETURN POLICY */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Return Policy</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={content.returnPolicy}
            onChange={(e) => setContent({ ...content, returnPolicy: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
            {content.returnPolicy}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* REPLACEMENT */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Replacement / Exchange
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={content.replacement}
            onChange={(e) => setContent({ ...content, replacement: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
            {content.replacement}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* REFUND PROCESS */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Refund Process</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={content.refundProcess}
            onChange={(e) => setContent({ ...content, refundProcess: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.refundProcess}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* SHIPPING */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Shipping Policy</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={content.shipping}
            onChange={(e) => setContent({ ...content, shipping: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
            {content.shipping}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                disabled={isUpdating}
                onClick={() => setIsEditing(false)}
                sx={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={isUpdating}
                onClick={handleSave}
                sx={{ backgroundColor: 'var(--highlight-color)', minWidth: 100 }}
              >
                {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ backgroundColor: 'var(--highlight-color)' }}
            >
              Edit Policies
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default PoliciesPage;
