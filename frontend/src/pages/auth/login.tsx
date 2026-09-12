'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  Link,
  useTheme,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
  Divider,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Shield,
  Bolt,
  ArrowForward,
  CheckCircle,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axiosClient';

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', pin: '' });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For PIN, only allow 4 digits
    if (name === 'pin') {
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLoginSubmit = async (credentials: { email: string; pin: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      // Prefer user object returned from backend, fallback to form data
      const userData = user
        ? {
            id: user.id?.toString() || '1',
            email: user.email || credentials.email,
            name: user.name || 'User',
            isGuest: user.isGuest || false
          }
        : {
            id: '1',
            email: credentials.email,
            name: 'User',
            isGuest: false
          };

      // Store in auth context
      login(token, userData);

      // Check for redirect query param or go to dashboard
      const redirectUrl = (router.query.redirect as string) || '/dashboard';
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.pin) {
      setError('Please provide your email address or use 1-Click Demo Login.');
      return;
    }
    await handleLoginSubmit(formData);
  };

  const handleQuickDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    const demoCredentials = { email: 'demo@finfolio.com', pin: '1234' };
    setFormData(demoCredentials);
    await handleLoginSubmit(demoCredentials);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/guest');
      const { token, user } = response.data;

      const userData = {
        id: user.id?.toString() || '0',
        email: user.email || null,
        name: user.name || 'Guest User',
        isGuest: user.isGuest || true
      };

      login(token, userData);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err.response?.data?.error || err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.5)'
            : '0 20px 40px rgba(15, 23, 42, 0.08)',
          background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff'
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="FINFOLIO Logo"
              sx={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover' }}
            />
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.02em', color: 'primary.main' }}>
              FINFOLIO
            </Typography>
          </Stack>

          <Typography variant="h4" component="h1" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to access your financial resilience center &amp; AI advisor
          </Typography>
        </Box>

        {/* Feature Highlights Banner */}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
          <Chip
            size="small"
            label="🇮🇳 Strictly INR (₹)"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
          />
          <Chip
            size="small"
            icon={<Lock sx={{ fontSize: 14 }} />}
            label="4-Digit PIN Security"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main' }}
          />
          <Chip
            size="small"
            label="🛡️ Layoff Runway Defense"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.08), color: 'info.main' }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 1-CLICK DEMO LOGIN BUTTON */}
        <Button
          fullWidth
          variant="contained"
          color="warning"
          size="large"
          startIcon={demoLoading ? <CircularProgress size={20} color="inherit" /> : <Bolt />}
          onClick={handleQuickDemoLogin}
          disabled={loading || demoLoading}
          sx={{
            py: 1.4,
            borderRadius: 2.5,
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
            mb: 2.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            }
          }}
        >
          {demoLoading ? 'Logging into Demo...' : '⚡ Quick Demo Login (demo@finfolio.com)'}
        </Button>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>
            OR SIGN IN WITH YOUR ACCOUNT
          </Typography>
        </Divider>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || demoLoading}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            name="pin"
            label="4-Digit PIN"
            type={showPin ? 'text' : 'password'}
            id="pin"
            inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={formData.pin}
            onChange={handleChange}
            disabled={loading || demoLoading}
            helperText="Enter your 4-digit security PIN (Demo account: 1234)"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle PIN visibility"
                    onClick={() => setShowPin(!showPin)}
                    edge="end"
                    size="small"
                  >
                    {showPin ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            disabled={loading || demoLoading}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '1rem',
              mb: 2
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={handleGuestLogin}
            disabled={loading || demoLoading}
            sx={{
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.9rem',
              borderColor: 'divider',
              color: 'text.secondary',
              mb: 3,
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Continue as Guest (Instant Session)
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* Bottom Actions */}
          <Stack spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" sx={{ fontWeight: 700, textDecoration: 'none', color: 'primary.main' }}>
                Create Account
              </Link>
            </Typography>

            <Button
              size="small"
              component={Link}
              href="/assessment"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.82rem',
                '&:hover': { color: 'primary.main' }
              }}
            >
              ⚡ Want to check runway first? Run 360° Assessment →
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}