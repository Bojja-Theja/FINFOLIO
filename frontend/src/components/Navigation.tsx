import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Savings,
  Insights,
  AccountBalance,
  Assessment,
  PieChart,
  Shield,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown,
  AccountBalanceWallet,
  TrackChanges,
  ShowChart,
  Calculate,
  School,
  People,
  SupervisorAccount,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useCurrency, CURRENCIES, SupportedCurrency } from '@/context/CurrencyContext';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const { currency, currencyInfo, setCurrency } = useCurrency();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
    router.push('/auth/login');
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const navGroups = [
    {
      label: 'Money',
      icon: <AccountBalanceWallet sx={{ fontSize: 19 }} />,
      items: [
        { label: 'Simulated Wallet', href: '/wallet', icon: <AccountBalanceWallet sx={{ fontSize: 18 }} /> },
        { label: 'Budget Planner', href: '/budget-planner', icon: <Calculate sx={{ fontSize: 18 }} /> },
        { label: 'Savings Pulse', href: '/savings', icon: <Savings sx={{ fontSize: 18 }} /> },
        { label: 'Financial Goals', href: '/goals', icon: <TrackChanges sx={{ fontSize: 18 }} /> },
      ]
    },
    {
      label: 'Planning',
      icon: <ShowChart sx={{ fontSize: 19 }} />,
      items: [
        { label: 'Investment Portfolio', href: '/portfolio', icon: <ShowChart sx={{ fontSize: 18 }} /> },
        { label: 'Asset Allocation', href: '/allocation', icon: <PieChart sx={{ fontSize: 18 }} /> },
        { label: 'Debt Dashboard', href: '/debt-dashboard', icon: <PieChart sx={{ fontSize: 18 }} /> },
        { label: 'Emergency Monitor', href: '/emergency', icon: <Shield sx={{ fontSize: 18 }} /> },
        { label: 'Loan Advisor', href: '/loan-recommendation', icon: <AccountBalance sx={{ fontSize: 18 }} /> },
      ]
    },
    {
      label: 'Intelligence',
      icon: <Insights sx={{ fontSize: 19 }} />,
      items: [
        { label: 'Market Insights', href: '/insights', icon: <Insights sx={{ fontSize: 18 }} /> },
        { label: 'Financial Assessment', href: '/assessment', icon: <Assessment sx={{ fontSize: 18 }} /> },
        { label: 'Career Job Trainer', href: '/education?tab=career', icon: <School sx={{ fontSize: 18 }} /> },
        { label: 'Accountability Partner', href: '/accountability', icon: <SupervisorAccount sx={{ fontSize: 18 }} /> },
      ]
    },
    {
      label: 'Resources',
      icon: <School sx={{ fontSize: 19 }} />,
      items: [
        { label: 'Financial Reports', href: '/reports', icon: <Assessment sx={{ fontSize: 18 }} /> },
        { label: 'Tax Calculator', href: '/tax-calculator', icon: <Calculate sx={{ fontSize: 18 }} /> },
        { label: 'Education Hub', href: '/education', icon: <School sx={{ fontSize: 18 }} /> },
        { label: 'Community Feed', href: '/community', icon: <People sx={{ fontSize: 18 }} /> },
        { label: 'Help & Support', href: '/help', icon: <Assessment sx={{ fontSize: 18 }} /> },
      ]
    }
  ];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, groupLabel: string) => {
    setAnchorEl(event.currentTarget);
    setActiveGroup(groupLabel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveGroup(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isGroupActive = (group: typeof navGroups[0]) => {
    return group.items.some(item => router.pathname === item.href);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2, pb: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          onClick={handleDrawerToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="FINFOLIO Logo"
            sx={{ width: 28, height: 28, borderRadius: '6px', objectFit: 'cover' }}
          />
          FINFOLIO
        </Typography>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}>
          <IconButton onClick={toggleTheme} size="small" color="inherit">
            {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List sx={{ pt: 1, flexGrow: 1, overflowY: 'auto' }}>
        {isAuthenticated && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href="/dashboard"
              selected={router.pathname === '/dashboard'}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1.5,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                },
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'inherit' }}>
                <Dashboard sx={{ fontSize: 18 }} />
              </Box>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        )}

        {isAuthenticated && navGroups.map((group) => (
          <React.Fragment key={group.label}>
            <ListItem sx={{ pt: 1.5, pb: 0.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {group.label}
              </Typography>
            </ListItem>
            {group.items.map((item) => (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={router.pathname === item.href}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 1.5,
                    mx: 1,
                    py: 0.75,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'inherit' }}>
                    {item.icon}
                  </Box>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}

        {!isAuthenticated && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href="/auth/login"
                onClick={handleDrawerToggle}
                sx={{ borderRadius: 1.5, mx: 1 }}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href="/auth/register"
                onClick={handleDrawerToggle}
                sx={{ borderRadius: 1.5, mx: 1 }}
              >
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {isAuthenticated && (
        <Box sx={{ pt: 1 }}>
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}
              sx={{ borderRadius: 1.5, mx: 1, color: 'error.main' }}
            >
              <LogoutIcon sx={{ mr: 2, fontSize: 18 }} />
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
            </ListItemButton>
          </ListItem>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ py: 0.75, px: { xs: 2, md: 3 }, minHeight: '64px' }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 0,
              mr: { xs: 2, md: 3 },
              textDecoration: 'none',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '1.25rem',
              color: 'text.primary',
              letterSpacing: '-0.02em',
              transition: 'opacity 0.2s ease',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="FINFOLIO Logo"
              sx={{ width: 30, height: 30, borderRadius: '6px', objectFit: 'cover' }}
            />
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
            }}>
              FINFOLIO
            </Box>
            <Chip
              label="PRO"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.625rem',
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            />
          </Typography>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                size="small"
                label="₹ INR"
                sx={{
                  mr: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  color: 'text.primary',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              />
              <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}>
                <IconButton onClick={toggleTheme} size="small" sx={{ mr: 1 }}>
                  {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </IconButton>
              </Tooltip>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ p: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              {isAuthenticated && (
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button
                      startIcon={<Dashboard sx={{ fontSize: 18 }} />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: router.pathname === '/dashboard' ? 700 : 500,
                        color: router.pathname === '/dashboard' ? 'primary.main' : 'text.primary',
                        backgroundColor: router.pathname === '/dashboard' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.06),
                        }
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>

                  {navGroups.map((group) => {
                    const active = isGroupActive(group);
                    return (
                      <Box key={group.label}>
                        <Button
                          onClick={(e) => handleMenuOpen(e, group.label)}
                          startIcon={group.icon}
                          endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: active ? 700 : 500,
                            color: active ? 'primary.main' : 'text.primary',
                            backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.75,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            }
                          }}
                        >
                          {group.label}
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeGroup === group.label}
                          onClose={handleMenuClose}
                          sx={{ mt: 1 }}
                          slotProps={{
                            paper: {
                              sx: {
                                borderRadius: 2,
                                minWidth: 220,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'light'
                                  ? '0 10px 25px -5px rgba(0,0,0,0.1)'
                                  : '0 10px 25px -5px rgba(0,0,0,0.5)',
                                p: 0.5,
                              }
                            }
                          }}
                        >
                          {group.items.map((item) => (
                            <MenuItem
                              key={item.href}
                              component={Link}
                              href={item.href}
                              onClick={handleMenuClose}
                              selected={router.pathname === item.href}
                              sx={{
                                py: 1,
                                px: 1.5,
                                borderRadius: 1.5,
                                my: 0.25,
                                '&.Mui-selected': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) }
                                }
                              }}
                            >
                              <Box sx={{ mr: 1.5, display: 'flex', color: 'inherit' }}>{item.icon}</Box>
                              <Typography variant="body2" sx={{ fontWeight: router.pathname === item.href ? 600 : 400 }}>
                                {item.label}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {!isAuthenticated && <Box sx={{ flexGrow: 1 }} />}

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Currency Indicator (Strictly INR) */}
                <Tooltip title="FinFolio is strictly configured for Indian Rupee (₹ INR)">
                  <Chip
                    size="small"
                    label="₹ INR"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      py: 0.5,
                      px: 0.5,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  />
                </Tooltip>

                {/* Theme Mode Toggle */}
                <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}>
                  <IconButton
                    onClick={toggleTheme}
                    size="small"
                    aria-label="Toggle light/dark theme"
                    sx={{
                      p: 0.8,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                  >
                    {mode === 'dark' ? <Brightness7 sx={{ fontSize: 18 }} /> : <Brightness4 sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>

                {/* Notifications */}
                {isAuthenticated && (
                  <NotificationCenter />
                )}

                {/* User Menu or Auth Actions */}
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={handleUserMenuOpen}
                      endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                      sx={{
                        textTransform: 'none',
                        padding: '4px 10px',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        color: 'text.primary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <Avatar sx={{
                        width: 26,
                        height: 26,
                        mr: 1,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                        color: '#ffffff'
                      }}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {user?.email?.split('@')[0] || 'Account'}
                      </Typography>
                    </Button>
                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleUserMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1,
                            minWidth: 200,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.palette.mode === 'light'
                              ? '0 10px 30px rgba(0, 0, 0, 0.08)'
                              : '0 10px 30px rgba(0, 0, 0, 0.5)',
                            p: 0.5,
                          },
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Signed in as
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem onClick={handleUserMenuClose} component={Link} href="/dashboard" sx={{ borderRadius: 1.5, py: 0.75 }}>
                        <Dashboard sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">Dashboard</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleUserMenuClose} component={Link} href="/settings" sx={{ borderRadius: 1.5, py: 0.75 }}>
                        <SettingsIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">Settings</Typography>
                      </MenuItem>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, py: 0.75, color: 'error.main' }}>
                        <LogoutIcon sx={{ mr: 1.5, fontSize: 18, color: 'error.main' }} />
                        <Typography variant="body2" color="error.main" fontWeight={600}>Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      variant="text"
                      component={Link}
                      href="/auth/login"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/auth/register"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        borderRadius: 2,
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>

      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            background: theme.palette.mode === 'light' ? '#FFFFFF' : '#111827',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;