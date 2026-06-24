import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, status: 'ready' }),
}));

import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  test('renders children when authenticated', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret area</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret area')).toBeInTheDocument();
  });
});