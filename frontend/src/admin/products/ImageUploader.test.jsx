import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImageUploader from './ImageUploader';

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls file selection and remove handlers', async () => {
    const user = userEvent.setup();
    const onFilesSelected = vi.fn();
    const onRemove = vi.fn();

    render(
      <ImageUploader
        imageUrls={['https://example.com/one.png']}
        onFilesSelected={onFilesSelected}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole('button', { name: /upload product images/i }));
    expect(screen.getByText(/drag images here or click to upload/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '✕' }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
