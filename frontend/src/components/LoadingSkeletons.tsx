import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export const DashboardSkeleton = () => (
    <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="60%" height={30} />
                            <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={300} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <Card>
        <CardContent>
            <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
            {Array.from({ length: rows }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="25%" />
                    <Skeleton variant="text" width="25%" />
                </Box>
            ))}
        </CardContent>
    </Card>
);

export const CardSkeleton = () => (
    <Card>
        <CardContent>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
        </CardContent>
    </Card>
);

export const ChartSkeleton = () => (
    <Card>
        <CardContent>
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
        </CardContent>
    </Card>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
    <Box>
        {Array.from({ length: items }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" />
                </Box>
            </Box>
        ))}
    </Box>
);
