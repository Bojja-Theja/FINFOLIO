import React, { useEffect, useState, useRef } from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface AnimatedCounterProps extends Omit<TypographyProps, 'children'> {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    separator?: string;
}

/**
 * AnimatedCounter - Animates number changes with easing
 * 
 * @param value - Target number to count to
 * @param duration - Animation duration in ms (default: 1000)
 * @param decimals - Number of decimal places (default: 0)
 * @param prefix - Text before the number (e.g., "$")
 * @param suffix - Text after the number (e.g., "%")
 * @param separator - Thousands separator (default: ",")
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 1000,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    ...typographyProps
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(0);
    const animationFrameRef = useRef<number>();
    const displayValueRef = useRef(0);
    displayValueRef.current = displayValue;

    useEffect(() => {
        startValueRef.current = displayValueRef.current;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function (easeOutCubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = startValueRef.current + (value - startValueRef.current) * easeProgress;
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [value, duration]);

    const formatNumber = (num: number): string => {
        const fixed = num.toFixed(decimals);
        const parts = fixed.split('.');

        if (parts[0]) {
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }

        return parts.join('.');
    };

    return (
        <Typography {...typographyProps}>
            {prefix}{formatNumber(displayValue)}{suffix}
        </Typography>
    );
};

export default AnimatedCounter;
