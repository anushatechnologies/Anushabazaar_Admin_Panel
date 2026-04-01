import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Stack,
  TextField,
} from '@mui/material';

const TermsAndPayments = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState({
    section1: `In order to access the services of the Platform, You will have to register
and create an account on the Platform by providing required details.
Anusha Bazaar may collect personal information such as name, email,
age, photograph, address, mobile number, contact details, demographic
information and transaction details including financial information.`,

    section2: `You are solely responsible for the information provided. You must ensure
that your account information is accurate and updated. If any information
is found to be incorrect, Anusha Bazaar reserves the right to refuse services
or suspend access without prior notice.`,

    section3: `Confidentiality of your account credentials shall be your responsibility.
Anusha Bazaar disclaims any liability for losses due to unauthorized access.`,

    payments1: `All payments shall be made in Indian Rupees only. Accepted payment
methods may include credit/debit card, net banking, UPI, cash on delivery,
or other RBI-approved methods as displayed on the Platform.`,

    payments2: `Anusha Bazaar may use third-party payment gateways to process payments.
You agree to comply with the terms of such third-party providers.`,

    payments3: `You confirm that you are authorized to use the provided payment details
and are solely responsible for transactions made.`,

    payments4: `The payment facility is not a banking service but only a facilitator
providing electronic payment processing.`,
  });

  const handleChange = (key: string, value: string) => {
    setContent({ ...content, [key]: value });
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
                onClick={() => setIsEditing(false)}
                sx={{ borderColor: 'var(--border-soft)', color: 'var(--text-color)' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsEditing(false)}
                sx={{ backgroundColor: 'var(--highlight-color)' }}
              >
                Save
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
