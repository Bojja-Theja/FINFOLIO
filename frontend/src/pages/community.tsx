import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Button, TextField, Chip, IconButton, Divider } from '@mui/material';
import { ThumbUp, Comment, Share, TrendingUp, EmojiEvents, People, Add } from '@mui/icons-material';
import Layout from '../components/Layout';

interface Post {
    id: number;
    author: string;
    avatar: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    category: string;
}

interface LeaderboardUser {
    rank: number;
    name: string;
    avatar: string;
    score: number;
    badge: string;
}

const Community = () => {
    const [newPost, setNewPost] = useState('');

    const posts: Post[] = [
        {
            id: 1,
            author: 'Priya Sharma',
            avatar: 'PS',
            timestamp: '2 hours ago',
            content: 'Just paid off my credit card debt using the avalanche method! 🎉 Feeling so relieved. Thanks to this community for the motivation!',
            likes: 24,
            comments: 8,
            category: 'Success Story',
        },
        {
            id: 2,
            author: 'Rahul Kumar',
            avatar: 'RK',
            timestamp: '5 hours ago',
            content: 'Question: Should I invest in index funds or actively managed mutual funds? Looking for advice from experienced investors.',
            likes: 12,
            comments: 15,
            category: 'Question',
        },
        {
            id: 3,
            author: 'Anita Desai',
            avatar: 'AD',
            timestamp: '1 day ago',
            content: 'Tip: I automated my savings by setting up a recurring transfer of 20% of my salary to a separate savings account. Game changer! 💰',
            likes: 45,
            comments: 12,
            category: 'Tip',
        },
        {
            id: 4,
            author: 'Vikram Singh',
            avatar: 'VS',
            timestamp: '2 days ago',
            content: 'Reached my first ₹1 lakh in emergency fund today! Started with just ₹5000 six months ago. Consistency is key! 🚀',
            likes: 67,
            comments: 20,
            category: 'Milestone',
        },
    ];

    const leaderboard: LeaderboardUser[] = [
        { rank: 1, name: 'Amit Patel', avatar: 'AP', score: 2450, badge: '🏆 Gold' },
        { rank: 2, name: 'Sneha Reddy', avatar: 'SR', score: 2280, badge: '🥈 Silver' },
        { rank: 3, name: 'Karan Mehta', avatar: 'KM', score: 2150, badge: '🥉 Bronze' },
        { rank: 4, name: 'Divya Iyer', avatar: 'DI', score: 1980, badge: '⭐ Rising Star' },
        { rank: 5, name: 'Rohit Verma', avatar: 'RV', score: 1850, badge: '⭐ Rising Star' },
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Success Story':
                return '#10b981';
            case 'Question':
                return '#3b82f6';
            case 'Tip':
                return '#f59e0b';
            case 'Milestone':
                return '#8b5cf6';
            default:
                return '#6b7280';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                👥 Community
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Connect with others, share your journey, and learn from the community
            </Typography>

            <Grid container spacing={3}>
                {/* Main Feed */}
                <Grid item xs={12} md={8}>
                    {/* Create Post */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Share with the Community
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Share your success, ask a question, or give advice..."
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip label="Success Story" size="small" clickable />
                                    <Chip label="Question" size="small" clickable />
                                    <Chip label="Tip" size="small" clickable />
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    }}
                                >
                                    Post
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Posts Feed */}
                    {posts.map((post) => (
                        <Card key={post.id} sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>{post.avatar}</Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {post.author}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {post.timestamp}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={post.category}
                                        size="small"
                                        sx={{
                                            backgroundColor: getCategoryColor(post.category),
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>

                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {post.content}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Button
                                        startIcon={<ThumbUp />}
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {post.likes} Likes
                                    </Button>
                                    <Button
                                        startIcon={<Comment />}
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {post.comments} Comments
                                    </Button>
                                    <Button
                                        startIcon={<Share />}
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Share
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    {/* Community Stats */}
                    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <People sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Community Stats
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        12.5K
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Members
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        850
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Active Today
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        3.2K
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Posts
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        15K
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Comments
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Leaderboard */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEvents sx={{ mr: 1, color: '#f59e0b' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Top Contributors
                                </Typography>
                            </Box>
                            {leaderboard.map((user) => (
                                <Box
                                    key={user.rank}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        p: 1,
                                        borderRadius: 2,
                                        '&:hover': { backgroundColor: 'action.hover' },
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{ mr: 2, fontWeight: 700, minWidth: 30, color: 'text.secondary' }}
                                    >
                                        #{user.rank}
                                    </Typography>
                                    <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>{user.avatar}</Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {user.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {user.badge}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {user.score}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Trending Topics */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Trending Topics
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Chip label="#DebtFree" clickable />
                                <Chip label="#InvestingTips" clickable />
                                <Chip label="#BudgetingHacks" clickable />
                                <Chip label="#FinancialGoals" clickable />
                                <Chip label="#RetirementPlanning" clickable />
                                <Chip label="#TaxSaving" clickable />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Community;
