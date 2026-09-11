import React, { useEffect } from 'react';

// Accessibility utilities and hooks
export const useKeyboardNavigation = () => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Skip to main content with Alt+M
            if (e.altKey && e.key === 'm') {
                const mainContent = document.getElementById('main-content');
                mainContent?.focus();
            }

            // Open search with Alt+S
            if (e.altKey && e.key === 's') {
                const searchInput = document.querySelector('[role="search"] input') as HTMLElement;
                searchInput?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// Focus trap for modals
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey as EventListener);
        firstElement?.focus();

        return () => {
            container.removeEventListener('keydown', handleTabKey as EventListener);
        };
    }, [isActive, containerRef]);
};

// Skip to content link component
export const SkipToContent: React.FC = () => {
    return (
        <a
            href="#main-content"
            className="skip-to-content"
            style={{
                position: 'absolute',
                left: '-9999px',
                zIndex: 999,
                padding: '1rem',
                backgroundColor: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.25rem',
            }}
            onFocus={(e) => {
                e.currentTarget.style.left = '1rem';
                e.currentTarget.style.top = '1rem';
            }}
            onBlur={(e) => {
                e.currentTarget.style.left = '-9999px';
            }}
        >
            Skip to main content
        </a>
    );
};

// ARIA live region component
interface LiveRegionProps {
    message: string;
    priority?: 'polite' | 'assertive';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ message, priority = 'polite' }) => {
    return (
        <div
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
            style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
            }}
        >
            {message}
        </div>
    );
};

// Accessible button with loading state
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
    children,
    loading,
    loadingText = 'Loading...',
    disabled,
    ...props
}) => {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            aria-busy={loading}
            aria-label={loading ? loadingText : props['aria-label']}
        >
            {loading ? loadingText : children}
        </button>
    );
};

// Color contrast checker (for development)
export const checkColorContrast = (foreground: string, background: string): boolean => {
    // Simplified WCAG 2.1 AA contrast ratio check (4.5:1 for normal text)
    // In production, use a proper library like 'color-contrast-checker'
    console.log(`Checking contrast between ${foreground} and ${background}`);
    return true; // Placeholder
};

// Accessible form field wrapper
interface AccessibleFieldProps {
    id: string;
    label: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    children: React.ReactNode;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
    id,
    label,
    error,
    required,
    helpText,
    children,
}) => {
    const helpTextId = `${id}-help`;
    const errorId = `${id}-error`;

    return (
        <div className="form-field">
            <label htmlFor={id}>
                {label}
                {required && <span aria-label="required"> *</span>}
            </label>
            {React.cloneElement(children as React.ReactElement, {
                id,
                'aria-describedby': [helpText && helpTextId, error && errorId].filter(Boolean).join(' '),
                'aria-invalid': !!error,
                'aria-required': required,
            })}
            {helpText && (
                <div id={helpTextId} className="help-text">
                    {helpText}
                </div>
            )}
            {error && (
                <div id={errorId} className="error-text" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

const accessibilityUtils = {
    useKeyboardNavigation,
    announceToScreenReader,
    useFocusTrap,
    SkipToContent,
    LiveRegion,
    AccessibleButton,
    AccessibleField,
    checkColorContrast,
};

export default accessibilityUtils;
