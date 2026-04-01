import React from 'react';
import { Box, Card, CardContent, Typography, Divider } from '@mui/material';

const PoliciesPage = () => {
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
        {/* TAXES */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Taxes on Your Order
        </Typography>

        <Typography
          sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
        >
          {`In respect of the order placed by you on the Anusha Bazaar Platform, documents like order summary, tax invoices, etc. as mandated per the applicable law and common business practices shall be issued. Your order may have the following components and corresponding documents:

• Sale of goods – Tax invoice cum bill of supply issued by/on behalf of the relevant seller;
• Supply of services – Tax invoice issued by/on behalf of the relevant service provider.
• For Third Party Offerings, Tax Invoice/bill of supply shall be issued on behalf of the relevant Third Party Seller.
• The above documents can be seen on the order summary page once the goods have been delivered to you.

You acknowledge and agree that entitlement to any GST benefits shall be subject to GST terms and submission of valid GST number. Not all products/services are eligible for GST invoice.`}
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* ORDER CANCELLATION */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Order Cancellation
        </Typography>

        <Typography
          sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
        >
          {`You acknowledge that cancellation or attempted cancellation may amount to breach of Terms and shall be permitted subject to acceptance by Anusha Bazaar.

Orders may be cancelled by Anusha Bazaar if:
(a) fraudulent transaction suspected
(b) violation of Terms
(c) product unavailability
(d) technical or logistical issues

Refunds for such cancellations will be initiated within approximately 72 hours.

Anusha Bazaar reserves the right to cancel orders and initiate refunds in the form of credit/cashback/coupon/promotional codes.

We reserve the right to deny access to fraudulent or non-complying users.`}
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* RETURNS & REFUNDS */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Returns & Refunds</Typography>

        <Typography
          sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
        >
          {`Products once delivered/services once fulfilled are non-returnable except:

(a) damaged, defective, expired, or incorrectly delivered
(b) if the product policy expressly permits return

No refunds will be permitted due to:
• incorrect location provided
• unresponsive customer
• building restrictions

For digital goods (gift cards/vouchers), no return/refund applies.

All refunds for permitted returns and cancellations will be processed within 7 working days.

Refunds for COD purchases will be issued via promotional codes (valid 30 days).

Refunds cannot be transferred back to another payment method once initiated.

All refunds shall be made in Indian Rupees only.`}
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* RETURN POLICY */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Return Policy</Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          We have a 7-day return policy, which means you have 7 days after receiving your item to
          request a return.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* REPLACEMENT */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>
          Replacement / Exchange
        </Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          After inspecting the returned/damaged items we shall provide replacement / exchange within
          7–10 business days.
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* REFUND PROCESS */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Refund Process</Typography>

        <Typography
          sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4, whiteSpace: 'pre-line' }}
        >
          {`We will notify you once we’ve received and inspected your return.

If approved, you’ll be automatically refunded and credited on your original payment method within 7 business days.

If more than 15 business days have passed since approval, contact:
anushabazaar4@gmail.com`}
        </Typography>

        <Divider sx={{ my: 4, borderColor: 'var(--border-soft)' }} />

        {/* SHIPPING */}
        <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 3 }}>Shipping Policy</Typography>

        <Typography sx={{ fontSize: '15px', lineHeight: 1.8, opacity: 0.8, mb: 4 }}>
          Products will get shipped and delivered in 6 to 8 days.
        </Typography>
      </Box>
    </Box>
  );
};

export default PoliciesPage;
