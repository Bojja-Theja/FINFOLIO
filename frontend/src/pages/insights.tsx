'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Grid,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  Stack,
  Divider,
  Tabs,
  Tab
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import {
  Warning,
  Info,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
// Navigation is provided globally by _app.tsx
import api from '@/utils/axiosClient';

interface Alert {
  id: string;
  type: string;
  priority: string;
  category: string;
  title: string;
  message: string;
  actionable: boolean;
  timestamp: string;
}

interface Insight {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

interface InsightsData {
  alerts: Alert[];
  insights: Insight[];
  summary: {
    criticalCount: number;
    warningCount: number;
    opportunityCount: number;
    achievementsCount: number;
  };
  trends: {
    spendingTrend: string;
    savingsTrend: string;
    healthTrend: string;
  };
}

export default function Insights() {
  const { user } = useAuth();
  const isGuest = !user || user.isGuest;
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/finance/insights`);
      setData(response.data);
    } catch (err) {
      const e: any = err;
      if (e?.response?.status === 401) {
        setError('Please sign in');
      } else {
        console.error('Failed to fetch insights:', err);
        // Fallback to mock data
        setData({
          alerts: [
            {
              id: '1',
              type: 'warning',
              priority: 'high',
              category: 'savings',
              title: 'Low Emergency Fund',
              message: 'Your emergency fund covers only 1.8 months of expenses. Aim for 6 months.',
              actionable: true,
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'info',
              priority: 'medium',
              category: 'budget',
              title: 'Spending Trend',
              message: 'Your monthly expenses have increased by 8% compared to last quarter.',
              actionable: false,
              timestamp: new Date().toISOString()
            }
          ],
          insights: [
            {
              id: '1',
              type: 'opportunity',
              category: 'investment',
              title: 'SIP Investment Opportunity',
              description: 'Based on your risk profile, consider increasing SIP investments by 20%.',
              impact: 'high',
              confidence: 0.85
            },
            {
              id: '2',
              type: 'risk',
              category: 'debt',
              title: 'Debt Management',
              description: 'Your debt-to-income ratio is 23%. Consider debt consolidation.',
              impact: 'medium',
              confidence: 0.75
            }
          ],
          summary: {
            criticalCount: 1,
            warningCount: 1,
            opportunityCount: 1,
            achievementsCount: 0
          },
          trends: {
            spendingTrend: 'increasing',
            savingsTrend: 'stable',
            healthTrend: 'improving'
          }
        });
        setError(null); // Clear error since we have fallback data
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="info" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <CheckCircle color="success" />;
      case 'opportunity': return <TrendingUp color="primary" />;
      case 'risk': return <Warning color="error" />;
      default: return <Lightbulb color="warning" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading your financial insights...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity={error === 'Please sign in' ? 'warning' : 'error'} sx={{ mb: 4 }}>
            <AlertTitle>{error === 'Please sign in' ? 'Authentication Required' : 'Connection Error'}</AlertTitle>
            <Typography>{error}</Typography>
            {error !== 'Please sign in' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Make sure the backend API is running on {process.env.NEXT_PUBLIC_BACKEND_URL}
              </Typography>
            )}
          </Alert>
          <Box textAlign="center">
            {error === 'Please sign in' ? (
              <Button variant="contained" href="/auth/login">
                Sign In
              </Button>
            ) : (
              <Button variant="contained" onClick={fetchInsights}>
                Retry
              </Button>
            )}
          </Box>
        </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Financial Insights & Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            AI-powered analysis of your financial health, trends, and personalized recommendations
          </Typography>

          {/* Guest notification banner */}
          {isGuest && (
            <Alert 
              severity="warning" 
              icon={<Warning />}
              sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  href="/auth/register"
                  variant="contained"
                >
                  Create Account
                </Button>
              }
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Demo Mode &ndash; Create an Account for Personalized Insights
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  You&apos;re viewing demo financial insights. Sign up to get personalized analysis of your actual financial data.
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Summary Cards */}
          <GridTyped container spacing={3} sx={{ mb: 4 }}>
            <GridTyped item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{data.summary.criticalCount}</Typography>
                <Typography variant="body2">Critical Alerts</Typography>
              </Paper>
            </GridTyped>
            <GridTyped item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{data.summary.warningCount}</Typography>
                <Typography variant="body2">Warnings</Typography>
              </Paper>
            </GridTyped>
            <GridTyped item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{data.summary.opportunityCount}</Typography>
                <Typography variant="body2">Opportunities</Typography>
              </Paper>
            </GridTyped>
            <GridTyped item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{data.summary.achievementsCount}</Typography>
                <Typography variant="body2">Achievements</Typography>
              </Paper>
            </GridTyped>
          </GridTyped>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`Alerts (${data.alerts.length})`} />
            <Tab label={`Insights (${data.insights.length})`} />
            <Tab label="Trends" />
          </Tabs>

          {/* Alerts Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active Alerts & Notifications
                </Typography>
                <Button startIcon={<Refresh />} onClick={fetchInsights} size="small">
                  Refresh
                </Button>
              </Box>

              {data.alerts.length === 0 ? (
                <Alert severity="success">
                  <AlertTitle>All Clear!</AlertTitle>
                  No active alerts at this time. Your finances are in good shape!
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {data.alerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={getAlertColor(alert.type) as any}
                      icon={getAlertIcon(alert.type)}
                      action={
                        alert.actionable && (
                          <Button color="inherit" size="small">
                            Take Action
                          </Button>
                        )
                      }
                    >
                      <AlertTitle sx={{ fontWeight: 'bold' }}>{alert.title}</AlertTitle>
                      {alert.message}
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Insights Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  AI-Generated Insights & Recommendations
                </Typography>
                <Button startIcon={<Refresh />} onClick={fetchInsights} size="small">
                  Refresh
                </Button>
              </Box>

              {data.insights.length === 0 ? (
                <Alert severity="info">
                  <AlertTitle>No Insights Available</AlertTitle>
                  Insights will be generated as you use the platform more.
                </Alert>
              ) : (
                <GridTyped container spacing={3}>
                  {data.insights.map((insight) => (
                    <GridTyped item xs={12} md={6} key={insight.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {getInsightIcon(insight.type)}
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                              {insight.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {insight.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={`${insight.impact} Impact`}
                              size="small"
                              color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(insight.confidence * 100)}% confidence
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </GridTyped>
                  ))}
                </GridTyped>
              )}
            </Box>
          )}

          {/* Trends Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Financial Trends Analysis
              </Typography>

              <GridTyped container spacing={3}>
                <GridTyped item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Spending Trend</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {data.trends.spendingTrend === 'increasing' ? (
                          <TrendingUp color="error" sx={{ mr: 1 }} />
                        ) : data.trends.spendingTrend === 'decreasing' ? (
                          <TrendingDown color="success" sx={{ mr: 1 }} />
                        ) : (
                          <Info color="info" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {data.trends.spendingTrend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </GridTyped>

                <GridTyped item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Savings Trend</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {data.trends.savingsTrend === 'improving' ? (
                          <TrendingUp color="success" sx={{ mr: 1 }} />
                        ) : data.trends.savingsTrend === 'declining' ? (
                          <TrendingDown color="error" sx={{ mr: 1 }} />
                        ) : (
                          <Info color="info" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {data.trends.savingsTrend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </GridTyped>

                <GridTyped item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Health Trend</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {data.trends.healthTrend === 'improving' ? (
                          <TrendingUp color="success" sx={{ mr: 1 }} />
                        ) : data.trends.healthTrend === 'declining' ? (
                          <TrendingDown color="error" sx={{ mr: 1 }} />
                        ) : (
                          <Info color="info" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {data.trends.healthTrend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </GridTyped>
              </GridTyped>
            </Box>
          )}
        </Paper>
      </Container>
  );
}