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
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axiosClient';

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', pin: '' });
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;

      // Prefer user object returned from backend, fallback to form data
      const userData = user
        ? {
          id: user.id?.toString() || "1",
          email: user.email || formData.email,
          name: user.name || "User",
          isGuest: user.isGuest || false
        }
        : {
          id: "1",
          email: formData.email,
          name: "User",
          isGuest: false
        };

      // Use the new login method with token and user data
      login(token, userData);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
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
        id: user.id?.toString() || "0",
        email: user.email || null,
        name: user.name || "Guest User",
        isGuest: user.isGuest || true
      };

      // Use the login method with token and user data
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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Sign in to your CAPSTACK account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2, mb: 3, py: 1.5 }}
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Continue as Guest'}
        </Button>

        <Typography variant="body2" align="center" sx={{ mb: 2 }}>or sign in with your account</Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address (Optional)"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            name="pin"
            label="4-Digit PIN (Optional)"
            type="password"
            id="pin"
            inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={formData.pin}
            onChange={handleChange}
            disabled={loading}
            helperText="Required for advanced features"
          />
          <Button
            type="submit"
            fullWidth
            variant="outlined"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/auth/register" variant="body2">
              <p>Create an account for advanced features</p>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}