import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const TermsOfUse = () => {
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

        {/* Body Text */}
        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          1.1. The websites http://Anushabazaar.com (“Website”) and mobile application ‘Anusha
          Bazaar’ (App) (collectively referred to as the “Platform”) are owned and operated by
          Anusha Bazaar Marketplace Private Limited, incorporated under the Indian Companies Act,
          2013, with its registered office at 2nd Floor, JayaPrakash Nagar Colony, Yellareddyguda,
          Ameerpet, Hyderabad-500073.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          1.2. These Terms govern your use of the Platform. By accessing the Platform, you agree to
          be bound by these Terms and other applicable policies including cancellation, refund and
          privacy policies.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          1.3. If you do not agree with these Terms, you must discontinue use of the Platform.
          Continued access signifies your acceptance.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          1.4. Anusha Bazaar reserves the right to modify these Terms at any time. Continued use
          after modification constitutes acceptance of the updated Terms.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Section 2 */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          2. Access to Services
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          2.1. Anusha Bazaar facilitates transactions between Users and Sellers across select
          serviceable areas in India.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          2.2. Users are granted a limited, non-exclusive, non-transferable, revocable right to
          access the Platform for purchasing Products and Services.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          2.3. This access does not permit resale or commercial use of the Platform content.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          2.4. Products may be ranked organically based on user preferences and engagement metrics.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          2.5. Anusha Bazaar acts solely as a marketplace facilitator and does not take ownership of
          Products.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Delivery Partners */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>Delivery Partners</Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          Delivery services are provided by independent contractors on a principal-to-principal
          basis. Anusha Bazaar is not liable for the actions or omissions of delivery partners.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Customer Comments */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          Customer Comments, Reviews & Ratings
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          Comments include reviews, ratings, feedback, images, and other user content submitted on
          the Platform.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          By submitting Comments, you grant Anusha Bazaar a worldwide, royalty-free license to use
          and display such content.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          Comments must not contain unlawful, abusive, or misleading content.
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          Anusha Bazaar reserves the right to remove any content that violates these Terms.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* Governing Law */}
        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>Governing Law</Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          These Terms shall be governed in accordance with the laws of Hyderabad, India.
        </Typography>
      </Box>
    </Box>
  );
};

export default TermsOfUse;
