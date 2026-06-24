import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const addItem = vi.fn();

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ addItem }),
}));

vi.mock('../services/reviewService', () => ({
  reviewService: {
    featured: vi.fn().mockResolvedValue([
      {
        _id: 'review-1',
        rating: 5,
        comment: 'Great food',
        user: { name: 'Maya' },
        food: { name: 'Paneer Bowl' },
      },
    ]),
  },
}));

import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    addItem.mockClear();
  });

  test('renders featured reviews', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Great food')).toBeInTheDocument());
    expect(screen.getByText('Smoked Tandoori Bowl')).toBeInTheDocument();
  });
});