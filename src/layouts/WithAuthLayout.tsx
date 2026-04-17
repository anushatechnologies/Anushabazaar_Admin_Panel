import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '@layouts/DashboardLayout';
import { Box } from '@mui/material';
import GlobalOrderNotifier from '@features/orders/components/GlobalOrderNotifier';

const WithAuthLayout: React.FC = () => {
  return (
    <DashboardLayout>
      <GlobalOrderNotifier />
      <Box style={{ width: '100%', overflowX: 'auto' }}>
        <Outlet />
      </Box>
    </DashboardLayout>
  );
};

export default WithAuthLayout;
