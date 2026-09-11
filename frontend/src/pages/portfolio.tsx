import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import Layout from '../components/Layout';

interface Asset {
    id: string;
    name: string;
    type: 'stocks' | 'bonds' | 'mutual_funds' | 'gold' | 'real_estate' | 'crypto';
    value: number;
    invested: number;
    returns: number;
    returnsPercent: number;
    allocation: number;
}

const Portfolio = () => {
    const [assets] = useState<Asset[]>([
        { id: '1', name: 'Nifty 50 Index Fund', type: 'mutual_funds', value: 450000, invested: 400000, returns: 50000, returnsPercent: 12.5, allocation: 30 },
        { id: '2', name: 'Tech Stocks', type: 'stocks', value: 320000, invested: 280000, returns: 40000, returnsPercent: 14.3, allocation: 21 },
        { id: '3', name: 'Government Bonds', type: 'bonds', value: 250000, invested: 245000, returns: 5000, returnsPercent: 2.0, allocation: 17 },
        { id: '4', name: 'Gold ETF', type: 'gold', value: 180000, invested: 170000, returns: 10000, returnsPercent: 5.9, allocation: 12 },
        { id: '5', name: 'Real Estate Fund', type: 'real_estate', value: 200000, invested: 190000, returns: 10000, returnsPercent: 5.3, allocation: 13 },
        { id: '6', name: 'Cryptocurrency', type: 'crypto', value: 100000, invested: 115000, returns: -15000, returnsPercent: -13.0, allocation: 7 },
    ]);

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalInvested = assets.reduce((sum, asset) => sum + asset.invested, 0);
    const totalReturns = totalValue - totalInvested;
    const totalReturnsPercent = (totalReturns / totalInvested) * 100;

    const assetColors: Record<string, string> = {
        stocks: '#3b82f6',
        bonds: '#10b981',
        mutual_funds: '#f59e0b',
        gold: '#eab308',
        real_estate: '#8b5cf6',
        crypto: '#ec4899',
    };

    const pieData = assets.map(asset => ({
        name: asset.name,
        value: asset.value,
        color: assetColors[asset.type],
    }));

    const performanceData = [
        { month: 'Jan', value: 1200000 },
        { month: 'Feb', value: 1250000 },
        { month: 'Mar', value: 1280000 },
        { month: 'Apr', value: 1320000 },
        { month: 'May', value: 1400000 },
        { month: 'Jun', value: 1500000 },
    ];

    const getAssetIcon = (type: string) => {
        const icons: Record<string, string> = {
            stocks: '📈',
            bonds: '📊',
            mutual_funds: '💼',
            gold: '🥇',
            real_estate: '🏢',
            crypto: '₿',
        };
        return icons[type] || '💰';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                📊 Investment Portfolio
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Portfolio Value</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{(totalValue / 100000).toFixed(1)}L</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Invested</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{(totalInvested / 100000).toFixed(1)}L</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: totalReturns >= 0 ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Returns</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    ₹{Math.abs(totalReturns / 1000).toFixed(0)}K
                                </Typography>
                                {totalReturns >= 0 ? <TrendingUp /> : <TrendingDown />}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Return Rate</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {totalReturnsPercent >= 0 ? '+' : ''}{totalReturnsPercent.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Asset Allocation */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Asset Allocation
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name.split(' ')[0]}: ${((value / totalValue) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Performance Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Portfolio Performance (6 Months)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`} />
                                    <Area type="monotone" dataKey="value" stroke="#667eea" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Holdings Table */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Holdings
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Current Value</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Invested</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Returns</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Return %</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Allocation</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assets.map((asset) => (
                                            <TableRow key={asset.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <span style={{ fontSize: '1.5rem' }}>{getAssetIcon(asset.type)}</span>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {asset.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={asset.type.replace('_', ' ').toUpperCase()}
                                                        size="small"
                                                        sx={{ backgroundColor: assetColors[asset.type], color: 'white', fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">₹{asset.value.toLocaleString()}</TableCell>
                                                <TableCell align="right">₹{asset.invested.toLocaleString()}</TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: asset.returns >= 0 ? '#10b981' : '#ef4444',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {asset.returns >= 0 ? '+' : ''}₹{asset.returns.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: asset.returnsPercent >= 0 ? '#10b981' : '#ef4444',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {asset.returnsPercent >= 0 ? '+' : ''}{asset.returnsPercent.toFixed(1)}%
                                                        </Typography>
                                                        {asset.returnsPercent >= 0 ? (
                                                            <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                                                        ) : (
                                                            <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">{asset.allocation}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Rebalancing Recommendations */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                🎯 Rebalancing Recommendations
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Your portfolio is well-diversified with a healthy mix of equity (51%) and debt (29%).
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Consider reducing cryptocurrency allocation from 7% to 5% and moving funds to bonds for stability.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Your equity allocation is slightly high for moderate risk tolerance. Consider rebalancing to 45% equity.
                                </Typography>
                                <Typography variant="body2">
                                    • Overall portfolio performance is excellent at +{totalReturnsPercent.toFixed(1)}% - you&apos;re beating the market benchmark by 2.3%!
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Portfolio;
