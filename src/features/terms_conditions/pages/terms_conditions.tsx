import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Button, Stack, TextField, CircularProgress } from '@mui/material';
import { useGetPolicyQuery, useUpdatePolicyMutation } from '../../settings/api/policyApi';

const TermsOfUse = () => {
  const { data, isLoading } = useGetPolicyQuery('TERMS_CONDITIONS');
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState({
    introduction: '',
    access: '',
    partners: '',
    comments: '',
    law: '',
  });

  useEffect(() => {
    if (data?.policy?.content) {
      try {
        const parsed = JSON.parse(data.policy.content);
        setContent(parsed);
      } catch (e) {
        setContent(prev => ({ ...prev, introduction: data.policy.content }));
      }
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePolicy({
        type: 'TERMS_CONDITIONS',
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
        {/* Main Title */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>1. Terms of Use</Typography>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            value={content.introduction}
            onChange={(e) => setContent({ ...content, introduction: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.introduction}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Section 2 */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>2. Access to Services</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            value={content.access}
            onChange={(e) => setContent({ ...content, access: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.access}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Delivery Partners */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>Delivery Partners</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={content.partners}
            onChange={(e) => setContent({ ...content, partners: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
            {content.partners}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Customer Comments */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          Customer Comments, Reviews & Ratings
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={8}
            value={content.comments}
            onChange={(e) => setContent({ ...content, comments: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.comments}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Governing Law */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>Governing Law</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={content.law}
            onChange={(e) => setContent({ ...content, law: e.target.value })}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
            {content.law}
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

export default TermsOfUse;
