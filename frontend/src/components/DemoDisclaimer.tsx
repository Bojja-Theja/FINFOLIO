import React from 'react';
import { Alert, AlertTitle, Typography, Box } from '@mui/material';
import { Info } from '@mui/icons-material';

const DemoDisclaimer: React.FC = () => {
  return (
    <Alert
      severity="info"
      icon={<Info />}
      sx={{
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <AlertTitle>🎓 Educational Demo - Not Financial Advice</AlertTitle>
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This application uses synthetic data and AI simulations for educational purposes only.
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          ⚠️ No real money, medical advice, or real-world financial execution.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
          Features include Monte Carlo simulations, AI insights, and benchmarking with dummy datasets.
        </Typography>
      </Box>
    </Alert>
  );
};

export default DemoDisclaimer;