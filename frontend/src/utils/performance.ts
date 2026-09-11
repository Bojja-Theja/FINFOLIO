// Performance optimization utilities

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Lazy load images
export const lazyLoadImage = (imageElement: HTMLImageElement) => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src || '';
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    imageObserver.observe(imageElement);
};

// Memoize expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// Virtual scrolling helper
export const calculateVisibleRange = (
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 3
): { start: number; end: number } => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(totalItems, start + visibleCount + overscan * 2);
    return { start, end };
};

// Preload critical resources
export const preloadResource = (url: string, type: 'script' | 'style' | 'image' | 'font') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'font') {
        link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
};

// Code splitting helper
export const loadComponent = async (componentPath: string) => {
    try {
        const importedModule = await import(/* webpackChunkName: "[request]" */ `${componentPath}`);
        return importedModule.default;
    } catch (error) {
        console.error(`Failed to load component: ${componentPath}`, error);
        return null;
    }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
};

// Web Vitals tracking
export const trackWebVitals = () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            });
            console.log('CLS:', clsScore);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
};

// Cache API helper
export const cacheData = async (key: string, data: any, ttl: number = 3600000) => {
    const item = {
        data,
        expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key: string): any | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.data;
};

// Request idle callback wrapper
export const runWhenIdle = (callback: () => void, options?: IdleRequestOptions) => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, options);
    } else {
        setTimeout(callback, 1);
    }
};

const performanceUtils = {
    debounce,
    throttle,
    lazyLoadImage,
    memoize,
    calculateVisibleRange,
    preloadResource,
    loadComponent,
    measurePerformance,
    trackWebVitals,
    cacheData,
    getCachedData,
    runWhenIdle,
};

export default performanceUtils;
