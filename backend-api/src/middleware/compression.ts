import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

/**
 * Compression middleware configuration
 * Compresses response bodies for all requests
 */
export const compressionMiddleware = compression({
    // Compression level (0-9, where 9 is maximum compression)
    level: 6,

    // Minimum response size to compress (in bytes)
    threshold: 1024, // 1KB

    // Filter function to determine if response should be compressed
    filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't accept encoding
        if (req.headers['x-no-compression']) {
            return false;
        }

        // Use compression filter function
        return compression.filter(req, res);
    },

    // Memory level (1-9)
    memLevel: 8,
});

/**
 * Custom compression options for different content types
 */
export const customCompressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const contentType = res.getHeader('Content-Type') as string;

    // Apply different compression levels based on content type
    if (contentType) {
        if (contentType.includes('application/json')) {
            // Higher compression for JSON
            res.setHeader('Content-Encoding', 'gzip');
        } else if (contentType.includes('text/html')) {
            // Medium compression for HTML
            res.setHeader('Content-Encoding', 'gzip');
        } else if (contentType.includes('image/')) {
            // Skip compression for images (already compressed)
            return next();
        }
    }

    next();
};

export default compressionMiddleware;
