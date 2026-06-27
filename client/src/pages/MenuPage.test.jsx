import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const addItem = vi.fn();

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ addItem }),
}));

vi.mock('../services/foodService', () => ({
  foodService: {
    list: vi.fn().mockResolvedValue({
      foods: [
        {
          _id: 'food-1',
          name: 'Loaded Burger',
          description: 'Test description',
          category: 'Burger',
          image: 'img',
          price: 250,
          rating: 4.6,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  },
}));

vi.mock('../services/categoryService', () => ({
  categoryService: {
    list: vi.fn().mockResolvedValue([{ name: 'Burger', slug: 'burger' }]),
  },
}));

vi.mock('../services/restaurantService', () => ({
  restaurantService: {
    list: vi.fn().mockResolvedValue({ restaurants: [{ _id: 'r-1', name: 'Spice Route Kitchen' }] }),
  },
}));

import MenuPage from './MenuPage';

describe('MenuPage', () => {
  beforeEach(() => {
    addItem.mockClear();
  });

  test('renders foods from the API', async () => {
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Loaded Burger')).toBeInTheDocument());
    expect(screen.getByRole('option', { name: 'Burger' })).toBeInTheDocument();
  });
});