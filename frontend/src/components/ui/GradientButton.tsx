import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/material/styles';

interface GradientButtonProps extends ButtonProps {
  gradient?: string;
  loading?: boolean;
  glowEffect?: boolean;
}

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 247, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 122, 247, 0);
  }
`;

/**
 * GradientButton - A premium button with gradient background and animations
 * 
 * @param gradient - Custom gradient (default: primary to secondary)
 * @param loading - Show loading spinner
 * @param glowEffect - Enable pulsing glow effect
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  gradient,
  loading = false,
  glowEffect = false,
  disabled,
  sx,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      {...props}
      sx={{
        background: gradient || ((theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        ),
        color: 'white',
        padding: '12px 32px',
        fontSize: '1rem',
        fontWeight: 600,
        borderRadius: (theme) => theme.shape.borderRadius,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 15px 0 rgba(0, 122, 247, 0.3)',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          transition: 'left 0.5s ease',
        },

        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px 0 rgba(0, 122, 247, 0.4)',

          '&::before': {
            left: '100%',
          },
        },

        '&:active': {
          transform: 'translateY(0)',
        },

        '&:disabled': {
          background: (theme) => theme.palette.action.disabledBackground,
          color: (theme) => theme.palette.action.disabled,
          boxShadow: 'none',
        },

        ...(glowEffect && {
          animation: `${pulse} 2s infinite`,
        }),

        ...sx,
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default GradientButton;
