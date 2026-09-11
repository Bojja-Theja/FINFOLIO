import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CreditScoreProps {
    score?: number;
}

const CreditScoreTracker: React.FC<CreditScoreProps> = ({ score = 750 }) => {
    const getScoreRating = (score: number) => {
        if (score >= 800) return { rating: 'Excellent', color: '#10b981' };
        if (score >= 740) return { rating: 'Very Good', color: '#3b82f6' };
        if (score >= 670) return { rating: 'Good', color: '#f59e0b' };
        if (score >= 580) return { rating: 'Fair', color: '#f97316' };
        return { rating: 'Poor', color: '#ef4444' };
    };

    const scoreData = [
        { month: 'Aug', score: 720 },
        { month: 'Sep', score: 725 },
        { month: 'Oct', score: 735 },
        { month: 'Nov', score: 742 },
        { month: 'Dec', score: 745 },
        { month: 'Jan', score: 750 },
    ];

    const factors = [
        { name: 'Payment History', impact: 'Excellent', percentage: 100, color: '#10b981' },
        { name: 'Credit Utilization', impact: 'Good', percentage: 35, color: '#3b82f6' },
        { name: 'Credit Age', impact: 'Fair', percentage: 60, color: '#f59e0b' },
        { name: 'Credit Mix', impact: 'Good', percentage: 70, color: '#3b82f6' },
        { name: 'New Credit', impact: 'Excellent', percentage: 90, color: '#10b981' },
    ];

    const { rating, color } = getScoreRating(score);
    const previousScore = scoreData[scoreData.length - 2]?.score ?? score;
    const scoreChange = score - previousScore;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    💳 Credit Score Tracker
                </Typography>

                {/* Score Display */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: `conic-gradient(${color} ${(score / 850) * 100}%, #e5e7eb ${(score / 850) * 100}%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                width: 170,
                                height: 170,
                                borderRadius: '50%',
                                backgroundColor: 'background.paper',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 700, color }}>
                                {score}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                out of 850
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Chip label={rating} sx={{ backgroundColor: color, color: 'white', fontWeight: 600 }} />
                        <Chip
                            label={`${scoreChange > 0 ? '+' : ''}${scoreChange} pts`}
                            icon={scoreChange > 0 ? <TrendingUp /> : <TrendingDown />}
                            size="small"
                            sx={{
                                backgroundColor: scoreChange > 0 ? '#dcfce7' : '#fee2e2',
                                color: scoreChange > 0 ? '#10b981' : '#ef4444',
                            }}
                        />
                    </Box>
                </Box>

                {/* Score History */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Score History (6 Months)
                    </Typography>
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={scoreData}>
                            <XAxis dataKey="month" />
                            <YAxis domain={[680, 780]} hide />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>

                {/* Score Factors */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Score Factors
                    </Typography>
                    {factors.map((factor, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">{factor.name}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: factor.color }}>
                                    {factor.impact}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={factor.percentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#e5e7eb',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: factor.color,
                                    },
                                }}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Recommendations */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#eff6ff', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Info sx={{ color: '#3b82f6', mr: 1, mt: 0.5 }} />
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Tips to Improve Your Score
                            </Typography>
                            <Typography variant="caption" color="textSecondary" component="div">
                                • Keep credit utilization below 30%
                            </Typography>
                            <Typography variant="caption" color="textSecondary" component="div">
                                • Pay all bills on time
                            </Typography>
                            <Typography variant="caption" color="textSecondary" component="div">
                                • Avoid opening too many new accounts
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CreditScoreTracker;
