import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import AIChatbot from './AIChatbot';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <AIChatbot />
    </Box>
  );
};

export default Layout;
