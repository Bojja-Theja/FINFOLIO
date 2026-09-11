import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, Grid, Avatar } from '@mui/material';
import { EmojiEvents, LocalFireDepartment, Star, TrendingUp, CheckCircle } from '@mui/icons-material';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    progress?: number;
    requirement?: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    date: string;
}

const Gamification: React.FC = () => {
    const [level, setLevel] = useState(5);
    const [points, setPoints] = useState(1250);
    const [streak, setStreak] = useState(12);
    const pointsToNextLevel = 1500;

    const badges: Badge[] = [
        {
            id: 'first-budget',
            name: 'Budget Master',
            description: 'Created your first budget',
            icon: '💰',
            earned: true,
        },
        {
            id: 'savings-goal',
            name: 'Goal Setter',
            description: 'Set your first savings goal',
            icon: '🎯',
            earned: true,
        },
        {
            id: 'streak-7',
            name: 'Week Warrior',
            description: 'Logged in for 7 days straight',
            icon: '🔥',
            earned: true,
        },
        {
            id: 'investment',
            name: 'Investor',
            description: 'Made your first investment',
            icon: '📈',
            earned: true,
        },
        {
            id: 'debt-free',
            name: 'Debt Destroyer',
            description: 'Paid off a debt',
            icon: '💪',
            earned: false,
            progress: 65,
            requirement: 100,
        },
        {
            id: 'emergency-fund',
            name: 'Safety Net',
            description: 'Build 6-month emergency fund',
            icon: '🛡️',
            earned: false,
            progress: 40,
            requirement: 100,
        },
        {
            id: 'tax-saver',
            name: 'Tax Ninja',
            description: 'Maximize tax deductions',
            icon: '🥷',
            earned: false,
            progress: 80,
            requirement: 100,
        },
        {
            id: 'millionaire',
            name: 'Crorepati',
            description: 'Reach ₹1 Crore net worth',
            icon: '👑',
            earned: false,
            progress: 25,
            requirement: 100,
        },
    ];

    const recentAchievements: Achievement[] = [
        {
            id: '1',
            title: 'Streak Master',
            description: 'Maintained a 10-day login streak',
            points: 100,
            date: '2024-02-05',
        },
        {
            id: '2',
            title: 'Budget Pro',
            description: 'Stayed under budget for 3 months',
            points: 150,
            date: '2024-02-01',
        },
        {
            id: '3',
            title: 'Early Bird',
            description: 'Paid all bills before due date',
            points: 50,
            date: '2024-01-28',
        },
    ];

    const levelProgress = (points / pointsToNextLevel) * 100;

    return (
        <Box>
            {/* Level & Progress */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Level {level}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Financial Enthusiast
                            </Typography>
                        </Box>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 32 }}>
                            <EmojiEvents />
                        </Avatar>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Progress to Level {level + 1}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {points} / {pointsToNextLevel} XP
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={levelProgress}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'white',
                                },
                            }}
                        />
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <LocalFireDepartment sx={{ fontSize: 32, mb: 0.5 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {streak}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Day Streak
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Star sx={{ fontSize: 32, mb: 0.5 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {points}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Total Points
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <CheckCircle sx={{ fontSize: 32, mb: 0.5 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {badges.filter(b => b.earned).length}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Badges Earned
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Badges */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                        🏆 Badges & Achievements
                    </Typography>
                    <Grid container spacing={2}>
                        {badges.map((badge) => (
                            <Grid item xs={6} sm={4} md={3} key={badge.id}>
                                <Card
                                    sx={{
                                        textAlign: 'center',
                                        p: 2,
                                        opacity: badge.earned ? 1 : 0.5,
                                        border: badge.earned ? '2px solid #667eea' : '2px solid transparent',
                                        position: 'relative',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-4px)',
                                            transition: 'all 0.3s',
                                        },
                                    }}
                                >
                                    <Typography sx={{ fontSize: 48, mb: 1 }}>{badge.icon}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {badge.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                                        {badge.description}
                                    </Typography>

                                    {!badge.earned && badge.progress !== undefined && (
                                        <Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={badge.progress}
                                                sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                                            />
                                            <Typography variant="caption" color="textSecondary">
                                                {badge.progress}% Complete
                                            </Typography>
                                        </Box>
                                    )}

                                    {badge.earned && (
                                        <Chip
                                            label="Earned"
                                            size="small"
                                            sx={{
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                fontWeight: 600,
                                                mt: 1,
                                            }}
                                        />
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        🎉 Recent Achievements
                    </Typography>
                    {recentAchievements.map((achievement) => (
                        <Box
                            key={achievement.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                mb: 2,
                                backgroundColor: '#f9fafb',
                                borderRadius: 2,
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>
                                <TrendingUp />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {achievement.title}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {achievement.description}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Chip
                                    label={`+${achievement.points} XP`}
                                    size="small"
                                    sx={{ backgroundColor: '#dcfce7', color: '#10b981', fontWeight: 600 }}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {new Date(achievement.date).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Gamification;
