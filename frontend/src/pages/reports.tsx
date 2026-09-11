import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Download, PictureAsPdf, TableChart, CalendarToday } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Layout from '../components/Layout';

const Reports = () => {
    const monthlyData = [
        { month: 'Jan', income: 75000, expenses: 52000, savings: 23000 },
        { month: 'Feb', income: 75000, expenses: 48000, savings: 27000 },
        { month: 'Mar', income: 80000, expenses: 55000, savings: 25000 },
        { month: 'Apr', income: 75000, expenses: 50000, savings: 25000 },
        { month: 'May', income: 85000, expenses: 58000, savings: 27000 },
        { month: 'Jun', income: 75000, expenses: 51000, savings: 24000 },
    ];

    const transactions = [
        { id: 1, date: '2025-06-15', category: 'Salary', amount: 75000, type: 'income' },
        { id: 2, date: '2025-06-10', category: 'Rent', amount: -25000, type: 'expense' },
        { id: 3, date: '2025-06-08', category: 'Groceries', amount: -8000, type: 'expense' },
        { id: 4, date: '2025-06-05', category: 'Investment', amount: -15000, type: 'expense' },
        { id: 5, date: '2025-06-01', category: 'Freelance', amount: 10000, type: 'income' },
    ];

    const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
        // Export functionality would be implemented here
        console.log(`Exporting as ${format}`);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    📊 Reports & Analytics
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleExport('pdf')}
                    >
                        Export PDF
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={() => handleExport('csv')}
                    >
                        Export CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleExport('excel')}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
                        }}
                    >
                        Export Excel
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Income (6 months)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ₹{monthlyData.reduce((sum, m) => sum + m.income, 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Expenses (6 months)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ₹{monthlyData.reduce((sum, m) => sum + m.expenses, 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Savings (6 months)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ₹{monthlyData.reduce((sum, m) => sum + m.savings, 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Income vs Expenses Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Income vs Expenses (6 Months)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="income" fill="#10b981" name="Income" />
                                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Savings Trend */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Savings Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="savings" stroke="#667eea" strokeWidth={3} name="Savings" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Recent Transactions
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{transaction.category}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.type.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: transaction.type === 'income' ? '#10b981' : '#ef4444',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: transaction.amount > 0 ? '#10b981' : '#ef4444',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Report Summary */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                📈 Financial Summary
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Your average monthly income is ₹{Math.round(monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length).toLocaleString()}.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Your average monthly expenses are ₹{Math.round(monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length).toLocaleString()}.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • You&apos;re saving an average of ₹{Math.round(monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length).toLocaleString()} per month ({((monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.reduce((sum, m) => sum + m.income, 0)) * 100).toFixed(1)}% of income).
                                </Typography>
                                <Typography variant="body2">
                                    • Your savings rate is excellent! You&apos;re in the top 20% of users.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Reports;
