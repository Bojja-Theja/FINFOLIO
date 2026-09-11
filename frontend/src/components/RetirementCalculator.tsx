import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Grid, Slider, Button } from '@mui/material';
import { TrendingUp, AccountBalance } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RetirementCalculator: React.FC = () => {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [currentSavings, setCurrentSavings] = useState(500000);
    const [monthlyContribution, setMonthlyContribution] = useState(10000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [monthlyExpenseAfterRetirement, setMonthlyExpenseAfterRetirement] = useState(50000);

    const calculateRetirement = () => {
        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;
        const monthlyRate = expectedReturn / 100 / 12;

        // Future value of current savings
        const futureValueCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement);

        // Future value of monthly contributions
        const futureValueContributions =
            monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);

        const totalRetirementCorpus = futureValueCurrentSavings + futureValueContributions;

        // Calculate how long the corpus will last
        const yearsCorpusWillLast = totalRetirementCorpus / (monthlyExpenseAfterRetirement * 12);

        return {
            totalCorpus: totalRetirementCorpus,
            yearsToRetirement,
            yearsCorpusWillLast,
            monthlyPension: (totalRetirementCorpus * (expectedReturn / 100 / 12)) / (1 - Math.pow(1 + expectedReturn / 100 / 12, -300)), // 25 years
        };
    };

    const results = calculateRetirement();

    // Generate projection data
    const projectionData: { age: number; corpus: number }[] = [];
    for (let year = 0; year <= retirementAge - currentAge; year++) {
        const age = currentAge + year;
        const months = year * 12;
        const monthlyRate = expectedReturn / 100 / 12;
        const futureValueCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);
        const futureValueContributions =
            months > 0 ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) : 0;
        const total = futureValueCurrentSavings + futureValueContributions;

        projectionData.push({
            age,
            corpus: Math.round(total),
        });
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccountBalance sx={{ mr: 1, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Retirement Planning Calculator
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Input Section */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" gutterBottom>
                                Current Age: {currentAge}
                            </Typography>
                            <Slider
                                value={currentAge}
                                onChange={(_, value) => setCurrentAge(value as number)}
                                min={18}
                                max={65}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" gutterBottom>
                                Retirement Age: {retirementAge}
                            </Typography>
                            <Slider
                                value={retirementAge}
                                onChange={(_, value) => setRetirementAge(value as number)}
                                min={currentAge + 1}
                                max={75}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Current Savings"
                            type="number"
                            value={currentSavings}
                            onChange={(e) => setCurrentSavings(Number(e.target.value))}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Monthly Contribution"
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                            }}
                        />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" gutterBottom>
                                Expected Annual Return: {expectedReturn}%
                            </Typography>
                            <Slider
                                value={expectedReturn}
                                onChange={(_, value) => setExpectedReturn(value as number)}
                                min={4}
                                max={15}
                                step={0.5}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Monthly Expense After Retirement"
                            type="number"
                            value={monthlyExpenseAfterRetirement}
                            onChange={(e) => setMonthlyExpenseAfterRetirement(Number(e.target.value))}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                            }}
                        />
                    </Grid>

                    {/* Results Section */}
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        p: 3,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: 2,
                                        color: 'white',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                        Retirement Corpus
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                                        ₹{(results.totalCorpus / 10000000).toFixed(2)} Cr
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                        at age {retirementAge}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ p: 2, backgroundColor: '#dcfce7', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Years to Retirement
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        {results.yearsToRetirement}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ p: 2, backgroundColor: '#dbeafe', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Corpus Will Last
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                                        {results.yearsCorpusWillLast.toFixed(0)} yrs
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Estimated Monthly Pension
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                                        ₹{Math.round(results.monthlyPension).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        for 25 years
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Projection Chart */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Corpus Growth Projection
                            </Typography>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={projectionData}>
                                    <XAxis dataKey="age" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => value ? `₹${(value / 10000000).toFixed(2)} Cr` : '₹0'} />
                                    <Line type="monotone" dataKey="corpus" stroke="#667eea" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>

                {/* Recommendations */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#eff6ff', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        💡 Recommendations
                    </Typography>
                    <Typography variant="caption" color="textSecondary" component="div">
                        • Increase monthly contribution by ₹{Math.round(monthlyContribution * 0.1).toLocaleString()} to retire 2 years earlier
                    </Typography>
                    <Typography variant="caption" color="textSecondary" component="div">
                        • Consider diversifying investments to achieve {expectedReturn}% returns
                    </Typography>
                    <Typography variant="caption" color="textSecondary" component="div">
                        • Review and adjust your plan annually to stay on track
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RetirementCalculator;
