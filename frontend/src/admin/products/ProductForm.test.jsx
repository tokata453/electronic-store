import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductForm from './ProductForm';

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('./ImageUploader', () => ({
  default: ({ onRemove, onFilesSelected, imageUrls }) => (
    <div>
      <button type="button" onClick={() => onFilesSelected({ target: { files: [new File(['a'], 'a.png', { type: 'image/png' })] } })}>Upload</button>
      <button type="button" onClick={() => onRemove(0)}>Remove Image</button>
      <div>{imageUrls.length}</div>
    </div>
  ),
}));

vi.mock('./SpecsEditor', () => ({
  default: ({ onChange }) => <button type="button" onClick={() => onChange({ ram: '8GB' })}>Update Specs</button>,
}));

describe('ProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates fields and submits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <ProductForm
        value={{
          name: 'Phone', slug: 'phone', description: '', specifications: {}, price: '100', salePrice: '', sku: '', stock: '5', categoryId: '1', images: [], imageUrls: [], badge: '', isFeatured: false, isActive: true,
        }}
        onChange={onChange}
        onSubmit={onSubmit}
        saving={false}
        categories={[{ id: 1, name: 'Phones' }]}
        onFilesSelected={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /update specs/i }));
    await user.click(screen.getByRole('button', { name: /save product/i }));

    expect(onSubmit).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });
});
