import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useGetPolicyQuery, useUpdatePolicyMutation } from '../../settings/api/policyApi';

const TermsAndPayments = () => {
  const { data, isLoading } = useGetPolicyQuery('PRIVACY_POLICY');
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState({
    section1: '',
    section2: '',
    section3: '',
    payments1: '',
    payments2: '',
    payments3: '',
    payments4: '',
  });

  useEffect(() => {
    if (data?.policy?.content) {
      try {
        const parsed = JSON.parse(data.policy.content);
        setContent(parsed);
      } catch (e) {
        // If not JSON, it might be legacy or raw text, but for this feature we'll expect JSON
        console.error('Failed to parse policy content', e);
      }
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setContent({ ...content, [key]: value });
  };

  const handleSave = async () => {
    try {
      await updatePolicy({
        type: 'PRIVACY_POLICY',
        content: JSON.stringify(content),
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save policy', error);
    }
  };

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
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          User Account, Password and Security
        </Typography>

        <Divider sx={{ mb: 4, borderColor: 'var(--border-soft)' }} />

        {/* Section 1 */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          1.1 Account Registration
        </Typography>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={5}
            value={content.section1}
            onChange={(e) => handleChange('section1', e.target.value)}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.section1}
          </Typography>
        )}

        {/* Section 2 */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          1.2 Accuracy of Information
        </Typography>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={5}
            value={content.section2}
            onChange={(e) => handleChange('section2', e.target.value)}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.section2}
          </Typography>
        )}

        {/* Section 3 */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          1.3 Account Confidentiality
        </Typography>

        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={content.section3}
            onChange={(e) => handleChange('section3', e.target.value)}
            sx={{ mb: 4, backgroundColor: 'var(--bg-color)' }}
          />
        ) : (
          <Typography
            sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
          >
            {content.section3}
          </Typography>
        )}

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Payments Section */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Payments Facility and Related Information
        </Typography>

        {['payments1', 'payments2', 'payments3', 'payments4'].map((key) =>
          isEditing ? (
            <TextField
              key={key}
              fullWidth
              multiline
              rows={4}
              value={(content as any)[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              sx={{ mb: 3, backgroundColor: 'var(--bg-color)' }}
            />
          ) : (
            <Typography
              key={key}
              sx={{
                fontSize: '15px',
                lineHeight: 1.8,
                opacity: 0.8,
                mb: 3,
                whiteSpace: 'pre-line',
              }}
            >
              {(content as any)[key]}
            </Typography>
          ),
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

export default TermsAndPayments;
