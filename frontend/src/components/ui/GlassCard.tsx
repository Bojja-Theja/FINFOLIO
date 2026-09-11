import React from 'react';
import { Card, CardProps, alpha } from '@mui/material';

interface GlassCardProps extends Omit<CardProps, 'sx'> {
    sx?: CardProps['sx']; // optional style prop
    gradient?: string;
    blur?: number;
    borderGlow?: boolean;
    children: React.ReactNode;
}

/**
 * GlassCard - A premium glassmorphism card component
 * 
 * @param gradient - Custom gradient background
 * @param blur - Blur intensity (default: 10)
 * @param borderGlow - Enable gradient border on hover
 */
const GlassCard: React.FC<GlassCardProps> = ({
    children,
    gradient,
    blur = 10,
    borderGlow = false,
    sx,
    ...props
}) => {
    return (
        <Card
            {...props}
            sx={{
                background: gradient || ((theme) =>
                    `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
                ),
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: (theme) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                borderRadius: (theme) => theme.shape.borderRadius * 1.5,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

                ...(borderGlow && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        padding: '1px',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    },
                }),

                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.15)}`,

                    ...(borderGlow && {
                        '&::before': {
                            opacity: 1,
                        },
                    }),
                },

                ...sx,
            }}
        >
            {children}
        </Card>
    );
};

export default GlassCard;
