import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { expect, test, vi } from 'vitest';
import React from 'react';

// Mocking Navigation to isolate Layout test
vi.mock('./Navigation', () => ({
    default: () => <nav data-testid="mock-navigation">Mock Navigation</nav>,
}));

// Mocking MUI Box to avoid theme provider issues in simple tests if any
// (Though Box standardly works, sometimes it's easier to mock MUI components if they cause noise)

test('renders Layout component with children and navigation', () => {
    render(
        <Layout>
            <div data-testid="child-element">Test Child</div>
        </Layout>
    );

    expect(screen.getByTestId('child-element')).toBeDefined();
    expect(screen.getByTestId('mock-navigation')).toBeDefined();
    expect(screen.getByText('Test Child')).toBeDefined();
});
