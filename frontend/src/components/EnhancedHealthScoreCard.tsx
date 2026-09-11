'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  alpha,
  CircularProgress,
  Button,
  Stack,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Refresh,
  Assessment
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// Styled Components
const EnhancedCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease'
  },
  '&:hover::before': {
    transform: 'translateX(0)'
  }
}));

const ScoreRing = styled(Box)<{ score: number; color: string }>(({ theme, score, color }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `conic-gradient(${color} ${score * 3.6}deg, ${alpha(theme.palette.grey[300], 0.3)} 0deg)`,
    animation: 'pulse 2s ease-in-out infinite'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    background: theme.palette.background.paper
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.05)', opacity: 0.8 }
  }
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  fontWeight: 800,
  fontSize: '2rem',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}));

interface HealthScoreCardProps {
  score: number;
  category: string;
  previousScore?: number;
  insights?: string[];
  recommendations?: string[];
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
  onRefresh?: () => void;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  score,
  category,
  previousScore,
  insights = [],
  recommendations = [],
  trend = 'stable',
  loading = false,
  onRefresh
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [animatingScore, setAnimatingScore] = useState(0);

  useEffect(() => {
    const validScore = isNaN(score) ? 0 : score;
    const timer = setTimeout(() => {
      setAnimatingScore(validScore);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.primary.main;
    if (value >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Critical';
  };

  const getStatusIcon = (value: number) => {
    if (value >= 80) return <CheckCircle />;
    if (value >= 60) return <TrendingUp />;
    if (value >= 40) return <Warning />;
    return <TrendingDown />;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp color="success" />;
    if (trend === 'down') return <TrendingDown color="error" />;
    return <Assessment color="action" />;
  };

  const scoreColor = getScoreColor(score);
  const statusLabel = getStatusLabel(score);
  const statusIcon = getStatusIcon(score);

  return (
    <EnhancedCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              {category}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {statusIcon}
              <Chip
                label={statusLabel}
                size="small"
                color={score >= 60 ? 'primary' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
              {getTrendIcon()}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh Score">
                <IconButton size="small" onClick={onRefresh} disabled={loading}>
                  <Refresh sx={{
                    transform: loading ? 'rotate(360deg)' : 'none',
                    transition: 'transform 0.5s',
                    opacity: loading ? 0.7 : 1
                  }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="More Details">
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
              >
                <ExpandMore />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Score Ring */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ScoreRing
              score={isNaN(animatingScore) ? 0 : animatingScore}
              color={scoreColor || theme.palette.primary.main}
            >
              {loading ? (
                <CircularProgress size={60} />
              ) : (
                <ScoreText variant="h3">
                  {Math.round(isNaN(animatingScore) ? 0 : animatingScore)}
                </ScoreText>
              )}
            </ScoreRing>
          </motion.div>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={animatingScore}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.grey[300], 0.3),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${scoreColor}, ${alpha(scoreColor, 0.7)})`,
                borderRadius: 4,
                transition: 'width 1s ease-in-out'
              }
            }}
          />
        </Box>

        {/* Previous Score Comparison */}
        {previousScore !== undefined && !loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Previous: {previousScore}
            </Typography>
            {score > previousScore && (
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 16 }} /> +{score - previousScore}
              </Typography>
            )}
            {score < previousScore && (
              <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDown sx={{ fontSize: 16 }} /> {previousScore - score}
              </Typography>
            )}
          </Box>
        )}

        {/* Expandable Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 2 }} />

              {/* Insights */}
              {insights.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Lightbulb color="primary" />
                    Key Insights
                  </Typography>
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 3, py: 0.5 }}>
                        • {insight}
                      </Typography>
                    </motion.div>
                  ))}
                </Box>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Assessment color="secondary" />
                    Recommendations
                  </Typography>
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          mb: 1,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        {rec}
                      </Button>
                    </motion.div>
                  ))}
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </EnhancedCard>
  );
};

export default HealthScoreCard;
