import React from 'react';
import { Box, Button } from '@mui/material';

const LoanSummaryAppBarRight: React.FC = () => {
  return (
    <>
      <Box>
        <Button variant="outlined" size="small">
          Add Loan
        </Button>
      </Box>
    </>
  );
};

export default LoanSummaryAppBarRight;
