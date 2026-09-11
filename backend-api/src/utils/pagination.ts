export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface CursorPaginationParams {
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
    data: T[];
    pagination: {
        nextCursor: string | null;
        previousCursor: string | null;
        hasMore: boolean;
        limit: number;
    };
}

/**
 * Parse pagination parameters from request query
 */
export const parsePaginationParams = (query: any): PaginationParams => {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100); // Max 100 items per page
    const sortBy = (query.sortBy as string) || 'created_at';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

    return {
        page: Math.max(1, page),
        limit,
        sortBy,
        sortOrder,
    };
};

/**
 * Calculate offset for SQL queries
 */
export const calculateOffset = (page: number, limit: number): number => {
    return (page - 1) * limit;
};

/**
 * Create pagination result
 */
export const createPaginationResult = <T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number
): PaginationResult<T> => {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

/**
 * Generate SQL LIMIT and OFFSET clause
 */
export const getPaginationSQL = (page: number, limit: number): string => {
    const offset = calculateOffset(page, limit);
    return `LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Generate SQL ORDER BY clause
 */
export const getOrderBySQL = (sortBy: string, sortOrder: 'asc' | 'desc'): string => {
    // Whitelist of allowed sort columns to prevent SQL injection
    const allowedColumns = [
        'id',
        'created_at',
        'updated_at',
        'amount',
        'date',
        'name',
        'email',
        'score',
        'status',
    ];

    const sanitizedColumn = allowedColumns.includes(sortBy) ? sortBy : 'created_at';
    const sanitizedOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    return `ORDER BY ${sanitizedColumn} ${sanitizedOrder}`;
};

/**
 * Cursor-based pagination for large datasets
 */
export const parseCursorPaginationParams = (query: any): CursorPaginationParams => {
    const cursor = query.cursor as string;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const sortBy = (query.sortBy as string) || 'id';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

    return {
        cursor,
        limit,
        sortBy,
        sortOrder,
    };
};

/**
 * Encode cursor for cursor-based pagination
 */
export const encodeCursor = (value: any): string => {
    return Buffer.from(JSON.stringify(value)).toString('base64');
};

/**
 * Decode cursor for cursor-based pagination
 */
export const decodeCursor = (cursor: string): any => {
    try {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch (_error) {
        return null;
    }
};

/**
 * Create cursor pagination result
 */
export const createCursorPaginationResult = <T extends Record<string, any>>(
    data: T[],
    limit: number,
    cursorField: string = 'id'
): CursorPaginationResult<T> => {
    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;

    const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1][cursorField])
        : null;

    const previousCursor = items.length > 0
        ? encodeCursor(items[0][cursorField])
        : null;

    return {
        data: items,
        pagination: {
            nextCursor,
            previousCursor,
            hasMore,
            limit,
        },
    };
};

/**
 * Get cursor WHERE clause for SQL
 */
export const getCursorWhereSQL = (
    cursor: string | undefined,
    cursorField: string,
    sortOrder: 'asc' | 'desc'
): string => {
    if (!cursor) {
        return '';
    }

    const decodedCursor = decodeCursor(cursor);
    if (!decodedCursor) {
        return '';
    }

    const operator = sortOrder === 'asc' ? '>' : '<';
    return `WHERE ${cursorField} ${operator} ${decodedCursor}`;
};

/**
 * Pagination metadata helper
 */
export const getPaginationMetadata = (
    totalItems: number,
    page: number,
    limit: number
) => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, totalItems);

    return {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        startIndex,
        endIndex,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
    };
};

export default {
    parsePaginationParams,
    calculateOffset,
    createPaginationResult,
    getPaginationSQL,
    getOrderBySQL,
    parseCursorPaginationParams,
    encodeCursor,
    decodeCursor,
    createCursorPaginationResult,
    getCursorWhereSQL,
    getPaginationMetadata,
};
