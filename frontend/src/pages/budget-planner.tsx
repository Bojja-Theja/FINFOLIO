import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, LinearProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Layout from '../components/Layout';
import axios from 'axios';

interface BudgetCategory {
    id: string;
    name: string;
    allocated: number;
    spent: number;
    color: string;
}

const BudgetPlanner = () => {
    const [totalIncome, setTotalIncome] = useState(75000);
    const [categories, setCategories] = useState<BudgetCategory[]>([
        { id: '1', name: 'Housing', allocated: 25000, spent: 22000, color: '#3b82f6' },
        { id: '2', name: 'Food', allocated: 15000, spent: 14500, color: '#10b981' },
        { id: '3', name: 'Transportation', allocated: 8000, spent: 7200, color: '#f59e0b' },
        { id: '4', name: 'Entertainment', allocated: 5000, spent: 5800, color: '#8b5cf6' },
        { id: '5', name: 'Savings', allocated: 15000, spent: 15000, color: '#06b6d4' },
        { id: '6', name: 'Other', allocated: 7000, spent: 4500, color: '#ec4899' },
    ]);

    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const remaining = totalIncome - totalAllocated;

    const pieData = categories.map(cat => ({
        name: cat.name,
        value: cat.allocated,
    }));

    const comparisonData = categories.map(cat => ({
        name: cat.name,
        allocated: cat.allocated,
        spent: cat.spent,
    }));

    const handleCategoryUpdate = (id: string, field: 'allocated' | 'spent', value: number) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, [field]: value } : cat
        ));
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                💰 Budget Planner
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Monthly Income</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{totalIncome.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Allocated</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{totalAllocated.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Spent</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{totalSpent.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: remaining >= 0 ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Remaining</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{remaining.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {remaining < 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    ⚠️ You&apos;ve over-allocated your budget by ₹{Math.abs(remaining).toLocaleString()}. Consider adjusting your categories.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Budget Allocation Pie Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Budget Allocation
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={categories[index]?.color || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Budget vs Actual Comparison */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Budget vs Actual
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={comparisonData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                                    <Bar dataKey="spent" fill="#10b981" name="Spent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Details */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Category Details
                            </Typography>
                            <Grid container spacing={2}>
                                {categories.map((category) => {
                                    const percentSpent = (category.spent / category.allocated) * 100;
                                    const isOverBudget = category.spent > category.allocated;

                                    return (
                                        <Grid item xs={12} key={category.id}>
                                            <Box sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {category.name}
                                                    </Typography>
                                                    <Typography variant="body2" color={isOverBudget ? 'error' : 'textSecondary'}>
                                                        ₹{category.spent.toLocaleString()} / ₹{category.allocated.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(percentSpent, 100)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: '#e5e7eb',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: isOverBudget ? '#ef4444' : category.color,
                                                        },
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {percentSpent.toFixed(1)}% used
                                                    </Typography>
                                                    <Typography variant="caption" color={isOverBudget ? 'error' : 'success.main'}>
                                                        {isOverBudget ? 'Over budget' : `₹${(category.allocated - category.spent).toLocaleString()} remaining`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* AI Recommendations */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                🤖 AI Budget Recommendations
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Your entertainment spending is 16% over budget. Consider reducing by ₹800 to stay on track.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • You&apos;re saving 20% of your income - excellent! This puts you in the top 25% of users.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Based on your spending patterns, consider allocating ₹2,000 more to transportation for next month.
                                </Typography>
                                <Typography variant="body2">
                                    • You have ₹{remaining.toLocaleString()} unallocated. Consider adding this to your emergency fund.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default BudgetPlanner;
