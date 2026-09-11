import React from 'react';
import { Box, BoxProps, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';

interface LoadingSkeletonProps extends BoxProps {
    variant?: 'text' | 'rectangular' | 'circular';
    animation?: 'pulse' | 'wave' | 'none';
    width?: number | string;
    height?: number | string;
}

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

/**
 * LoadingSkeleton - A shimmer loading skeleton component
 * 
 * @param variant - Shape variant (text, rectangular, circular)
 * @param animation - Animation type (wave, pulse, none)
 * @param width - Width of the skeleton
 * @param height - Height of the skeleton
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'rectangular',
    animation = 'wave',
    width,
    height,
    sx,
    ...props
}) => {
    return (
        <Box
            {...props}
            sx={{
                backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.11),
                borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? 4 : (theme) => theme.shape.borderRadius,

                ...(animation === 'wave' && {
                    background: (theme) => `linear-gradient(90deg, ${alpha(theme.palette.action.hover, 0.11)} 0%, ${alpha(theme.palette.action.hover, 0.3)} 50%, ${alpha(theme.palette.action.hover, 0.11)} 100%)`,
                    backgroundSize: '1000px 100%',
                    animation: `${shimmer} 1.5s infinite`,
                }),

                ...(animation === 'pulse' && {
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                }),

                ...(variant === 'text' && {
                    height: '1em',
                    marginTop: '0.25em',
                    marginBottom: '0.25em',
                    transformOrigin: '0 60%',
                    transform: 'scale(1, 0.6)',
                }),

                width: width || (variant === 'text' ? '100%' : undefined),
                height: height || (variant === 'circular' ? 40 : variant === 'rectangular' ? 100 : undefined),

                ...sx,
            }}
        />
    );
};

/**
 * SkeletonGroup - Multiple skeletons for card loading states
 */
export const SkeletonGroup: React.FC<{ count?: number; spacing?: number }> = ({
    count = 3,
    spacing = 2
}) => {
    return (
        <Box>
            {Array.from({ length: count }).map((_, index) => (
                <Box key={index} sx={{ mb: spacing }}>
                    <LoadingSkeleton variant="text" width="60%" height={24} />
                    <LoadingSkeleton variant="rectangular" width="100%" height={100} sx={{ mt: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <LoadingSkeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                            <LoadingSkeleton variant="text" width="80%" />
                            <LoadingSkeleton variant="text" width="60%" />
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default LoadingSkeleton;
