import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { FoodFilters } from './FoodFilters';

describe('FoodFilters', () => {
  test('renders category options', () => {
    render(
      <FoodFilters
        search=""
        category=""
        availability=""
        categories={[{ name: 'Pizza', slug: 'pizza' }]}
        onChange={() => undefined}
      />
    );

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pizza' })).toBeInTheDocument();
  });
});