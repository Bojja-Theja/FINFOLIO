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
  CheckCircle,
  ArrowForward,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axiosClient';

export default function Register() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', pin: '' });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin.length !== 4) {
      setError('Please choose an exact 4-digit security PIN (e.g. 1234).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      const { token, user } = response.data;

      const userData = user
        ? {
            id: user.id?.toString() || '1',
            email: user.email || formData.email,
            name: user.name || formData.name,
            isGuest: user.isGuest || false
          }
        : {
            id: '1',
            email: formData.email,
            name: formData.name,
            isGuest: false
          };

      login(token, userData);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
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

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'success.main',
            bgcolor: alpha(theme.palette.success.main, 0.04)
          }}
        >
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="900">
            Account Created!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your encrypted vault is ready. Redirecting to your financial command center...
          </Typography>
          <CircularProgress size={32} color="success" />
        </Paper>
      </Container>
    );
  }

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
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join FinFolio to safeguard your salary, audit layoff runway, and master career resilience
          </Typography>
        </Box>

        {/* Feature Badges */}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
          <Chip
            size="small"
            label="🇮🇳 Indian Rupee Native"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
          />
          <Chip
            size="small"
            icon={<Shield sx={{ fontSize: 14 }} />}
            label="Layoff Runway Shield"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.08), color: 'info.main' }}
          />
          <Chip
            size="small"
            icon={<Lock sx={{ fontSize: 14 }} />}
            label="Local PIN Encrypted"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main' }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            placeholder="Rahul Sharma"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="rahul.sharma@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="pin"
            label="Create 4-Digit PIN"
            type={showPin ? 'text' : 'password'}
            id="pin"
            inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={formData.pin}
            onChange={handleChange}
            disabled={loading}
            helperText={
              formData.pin.length === 4
                ? '✓ 4-digit PIN configured'
                : `${formData.pin.length}/4 digits entered (numbers only)`
            }
            FormHelperTextProps={{
              sx: { color: formData.pin.length === 4 ? 'success.main' : 'text.secondary', fontWeight: 600 }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {formData.pin.length === 4 && <CheckCircle color="success" sx={{ mr: 1, fontSize: 18 }} />}
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
            disabled={loading}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '1rem',
              mb: 2
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account & Launch Command Center'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={handleGuestLogin}
            disabled={loading}
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
            Explore First as Guest (No Signup)
          </Button>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/auth/login" sx={{ fontWeight: 700, textDecoration: 'none', color: 'primary.main' }}>
                Sign In
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
              ⚡ Run 360° Financial Assessment without account →
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}