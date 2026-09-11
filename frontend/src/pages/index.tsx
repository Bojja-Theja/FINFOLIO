'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme,
  Avatar,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Security,
  TrendingDown,
  AccountBalanceWallet,
  Psychology,
  ArrowForward,
  Shield,
  BarChart,
  Bolt,
  Check,
  Star
} from '@mui/icons-material';

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index?: number }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 4,
      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.5) 100%)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: `${slideInUp} 0.6s ease-out forwards`,
      animationDelay: `${(index || 0) * 0.1}s`,
      '&:hover': {
        transform: 'translateY(-12px)',
        boxShadow: (theme) => `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
        borderColor: 'primary.main',
      },
    }}
  >
    <CardContent sx={{ p: 4 }}>
      <Box sx={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(0, 122, 247, 0.1), rgba(108, 99, 255, 0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.main',
        mb: 2,
        fontSize: 28
      }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="700" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);


const StatBox = ({ number, label, icon }: { number: string, label: string, icon?: React.ReactNode }) => (
  <Box sx={{ textAlign: 'center', p: 3 }}>
    <Box sx={{ fontSize: 32, mb: 1, color: 'primary.main' }}>
      {icon}
    </Box>
    <Typography variant="h5" fontWeight="800" sx={{
      background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {number}
    </Typography>
    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mt: 0.5 }}>
      {label}
    </Typography>
  </Box>
);

export default function Home() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>CapStack | The Smart Financial Safety Net</title>
        <meta name="description" content="AI-powered financial safety net for unstable markets. Automate savings, monitor spending, survive financially with AI insights." />
      </Head>

      <Box sx={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.7) 100%)',
        pt: { xs: 8, md: 16 },
        pb: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Chip
                    icon={<Bolt sx={{ fontSize: 16 }} />}
                    label="AI-Powered Financial Defense"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    }}
                  />
                </Box>

                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="900"
                  sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' } }}
                >
                  Build Your Safety Net
                  <Box component="span" sx={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Before the Market Shifts
                  </Box>
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  In an era of layoffs and inflation, CapStack acts as your personal Financial Data Scientist. We automate your emergency funds, block risky spending, and stabilize your future.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/onboarding"
                    endIcon={<ArrowForward />}
                    sx={{ background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)' }}
                  >
                    Start My Audit
                  </Button>
                  <Button variant="outlined" size="large" href="#how-it-works">
                    How It Works
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Box sx={{
                width: '100%',
                height: 400,
                background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Typography variant="h4" fontWeight="bold">CAPSTACK DEMO</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 12 }} id="how-it-works">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<TrendingDown />}
                title="Automated Spending Blocks"
                description="Our algorithms detect weak control over money flow and automatically block discretionary spending."
                index={0}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<Psychology />}
                title="AI Financial Scientist"
                description="We analyze global layoff trends and inflation data to adjust your 'Survival Ratio'."
                index={1}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<AccountBalanceWallet />}
                title="Full Traceability"
                description="End-to-end tracking of every rupee. No scattered platforms."
                index={2}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
