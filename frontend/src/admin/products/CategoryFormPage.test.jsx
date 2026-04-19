import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryFormPage from './CategoryFormPage';

const mockNavigate = vi.fn();
const mockParams = vi.fn(() => ({}));
const mockCreateCategory = vi.fn();
const mockGetCategory = vi.fn();
const mockUpdateCategory = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
      useParams: () => mockParams(),
  };
});

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('./api', () => ({
  createCategory: (...args) => mockCreateCategory(...args),
  getCategory: (...args) => mockGetCategory(...args),
  updateCategory: (...args) => mockUpdateCategory(...args),
}));

describe('CategoryFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.mockReturnValue({});
  });

  it('creates a category', async () => {
    const user = userEvent.setup();
    mockCreateCategory.mockResolvedValue({ id: 5 });

    render(
      <MemoryRouter initialEntries={['/admin/categories/new']}>
        <CategoryFormPage />
      </MemoryRouter>
    );

    await user.type(screen.getAllByRole('textbox')[0], 'Phones');
    await user.click(screen.getByRole('button', { name: /save category/i }));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith(expect.objectContaining({ name: 'Phones', slug: 'phones' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/categories');
  });

  it('loads and updates a category', async () => {
    const user = userEvent.setup();
    mockParams.mockReturnValue({ id: '1' });
    mockGetCategory.mockResolvedValue({
      name: 'Phones',
      slug: 'phones',
      description: 'Mobile devices',
      icon: 'Smartphone',
      sortOrder: 1,
      isActive: true,
    });
    mockUpdateCategory.mockResolvedValue({ id: 1 });

    render(
      <MemoryRouter initialEntries={['/admin/categories/1']}>
        <CategoryFormPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetCategory).toHaveBeenCalledWith('1');
    });
    const nameInput = await screen.findByDisplayValue('Phones');
    await user.clear(nameInput);
    await user.type(nameInput, 'Phones Updated');
    await user.click(screen.getByRole('button', { name: /save category/i }));

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Phones Updated' }));
    });
  });
});
