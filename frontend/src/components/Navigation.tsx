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
  alpha
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
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
const Navigation = () => {
  const theme = useTheme();
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
      label: 'Planning',
      icon: <Assessment sx={{ fontSize: 20 }} />,
      items: [
        { label: 'Assessment', href: '/assessment', icon: <Assessment sx={{ fontSize: 18 }} /> },
        { label: 'Budget Planner', href: '/budget-planner', icon: <AccountBalanceWallet sx={{ fontSize: 18 }} /> },
        { label: 'Financial Goals', href: '/goals', icon: <TrackChanges sx={{ fontSize: 18 }} /> },
        { label: 'Tax Calculator', href: '/tax-calculator', icon: <Calculate sx={{ fontSize: 18 }} /> },
        { label: 'Loan Advisor', href: '/loan-recommendation', icon: <AccountBalance sx={{ fontSize: 18 }} /> },
        { label: 'Financial Reports', href: '/reports', icon: <Assessment sx={{ fontSize: 18 }} /> },
      ]
    },
    {
      label: 'Assets',
      icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
      items: [
        { label: 'Simulated Wallet', href: '/wallet', icon: <AccountBalanceWallet sx={{ fontSize: 18 }} /> },
        { label: 'Accountability', href: '/accountability', icon: <SupervisorAccount sx={{ fontSize: 18 }} /> },
        { label: 'Savings Pulse', href: '/savings', icon: <Savings sx={{ fontSize: 18 }} /> },
        { label: 'Portfolio', href: '/portfolio', icon: <ShowChart sx={{ fontSize: 18 }} /> },
        { label: 'Debt Dashboard', href: '/debt-dashboard', icon: <PieChart sx={{ fontSize: 18 }} /> },
        { label: 'Asset Allocation', href: '/allocation', icon: <PieChart sx={{ fontSize: 18 }} /> },
        { label: 'Emergency Monitor', href: '/emergency', icon: <Shield sx={{ fontSize: 18 }} /> },
      ]
    },
    {
      label: 'Resources',
      icon: <School sx={{ fontSize: 20 }} />,
      items: [
        { label: 'Market Insights', href: '/insights', icon: <Insights sx={{ fontSize: 18 }} /> },
        { label: 'Education Hub', href: '/education', icon: <School sx={{ fontSize: 18 }} /> },
        { label: 'Community Feed', href: '/community', icon: <People sx={{ fontSize: 18 }} /> },
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

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 800,
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="FinFolio"
            sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
          FinFolio
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {isAuthenticated && navGroups.map((group) => (
          <React.Fragment key={group.label}>
            <ListItem sx={{ py: 1, px: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="700">
                {group.label}
              </Typography>
            </ListItem>
            {group.items.map((item) => (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={router.pathname === item.href}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                  }}
                >
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'inherit' }}>
                    {item.icon}
                  </Box>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1, mx: 2 }} />
          </React.Fragment>
        ))}
        {!isAuthenticated && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href="/auth/login"
                onClick={handleDrawerToggle}
                sx={{ borderRadius: 1, mx: 1 }}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href="/auth/register"
                onClick={handleDrawerToggle}
                sx={{ borderRadius: 1, mx: 1 }}
              >
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      {isAuthenticated && (
        <>
          <Divider sx={{ my: 2 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}
              sx={{ borderRadius: 1, mx: 1, color: 'error.main' }}
            >
              <LogoutIcon sx={{ mr: 2 }} />
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.5) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 0,
              mr: { xs: 2, md: 4 },
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '1.4rem',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="FinFolio Logo"
              sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', mr: 0.5 }}
            />
            FinFolio
          </Typography>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'rotate(90deg)' } }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              {isAuthenticated && (
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button
                      startIcon={<Dashboard sx={{ fontSize: 20 }} />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: (router.pathname === '/dashboard' ? 'primary.main' : 'text.primary'),
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>

                  {navGroups.map((group) => (
                    <Box key={group.label}>
                      <Button
                        onClick={(e) => handleMenuOpen(e, group.label)}
                        startIcon={group.icon}
                        endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: 'text.primary',
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
                              minWidth: 200,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
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
                              px: 2,
                              borderRadius: 1,
                              mx: 0.5,
                              '&.Mui-selected': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) }
                              }
                            }}
                          >
                            <Box sx={{ mr: 2, display: 'flex', color: 'inherit' }}>{item.icon}</Box>
                            <Typography variant="body2">{item.label}</Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={handleUserMenuOpen}
                      endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
                      sx={{
                        textTransform: 'none',
                        padding: '6px 12px',
                        borderRadius: 2,
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        color: (theme) => theme.palette.text.primary,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                        },
                      }}
                    >
                      <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.9rem', background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)' }}>
                        {user?.email?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.email || 'User'}
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
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                          },
                        },
                      }}
                    >
                      <MenuItem disabled sx={{ py: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleUserMenuClose} component={Link} href="/dashboard">
                        <Dashboard sx={{ mr: 1, fontSize: 20 }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem onClick={handleUserMenuClose} component={Link} href="/settings">
                        <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                        Settings
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                        <Typography color="error.main">Logout</Typography>
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
                        fontWeight: 500,
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
                      }}
                    >
                      Register
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
            background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.5) 100%)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;