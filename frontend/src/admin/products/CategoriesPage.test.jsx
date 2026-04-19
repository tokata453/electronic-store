import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoriesPage from './CategoriesPage';

const mockListCategories = vi.fn();
const mockDeleteCategory = vi.fn();

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('./api', () => ({
  listCategories: (...args) => mockListCategories(...args),
  deleteCategory: (...args) => mockDeleteCategory(...args),
}));

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders categories and deletes one', async () => {
    const user = userEvent.setup();
    mockListCategories.mockResolvedValue([
      { id: 1, name: 'Phones', slug: 'phones', sortOrder: 1, icon: 'Smartphone', isActive: true },
    ]);
    mockDeleteCategory.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Phones')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete phones/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete phones/i }));

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith(1);
    });
  });
});
